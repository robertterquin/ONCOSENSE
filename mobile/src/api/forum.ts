import { toDbTimestamp } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { answerFromRow, type Answer } from '@/types/answer';
import { questionFromRow, type Question } from '@/types/question';

import { userForumName, userProfilePictureUrl } from './auth';
import {
  check,
  currentUser,
  currentUserId,
  ilikeValue,
  requireUser,
  requireUserId,
} from './errors';

// Port of lib/services/forum_service.dart.

export type QuestionSort = 'recent' | 'trending' | 'unanswered';

export type QuestionFilters = {
  category?: string | null;
  searchQuery?: string | null;
  sortBy?: QuestionSort;
  limit?: number;
  offset?: number;
};

// ---- Questions ----

// Reads go through views that hide the author of anonymous posts (migration
// 20261025000000); the tables no longer return `user_id`, so writes ask only for these.
const QUESTION_COLUMNS =
  'id,title,content,category,user_name,profile_picture_url,is_anonymous,upvotes,answer_count,created_at,updated_at,is_resolved,tags';
const ANSWER_COLUMNS =
  'id,question_id,content,user_name,is_anonymous,upvotes,created_at,updated_at,is_accepted,parent_answer_id';

export async function fetchQuestions({
  category,
  searchQuery,
  sortBy = 'recent',
  limit = 20,
  offset = 0,
}: QuestionFilters = {}): Promise<Question[]> {
  let query = supabase.from('questions_public').select('*');
  if (category) query = query.eq('category', category);
  if (searchQuery) {
    const value = ilikeValue(searchQuery);
    query = query.or(`title.ilike.${value},content.ilike.${value}`);
  }

  if (sortBy === 'trending') {
    query = query.order('upvotes', { ascending: false });
  } else if (sortBy === 'unanswered') {
    query = query.eq('answer_count', 0).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query.range(offset, offset + limit - 1);
  check(error, 'Failed to load questions');

  // Older questions may lack the author's name or photo; fill them in for the
  // signed-in user's own questions (same as the Flutter app).
  const user = await currentUser();
  return (data ?? []).map((row) => {
    const question = questionFromRow(row);
    if (
      user &&
      question.userId === user.id &&
      !question.isAnonymous &&
      (question.userName === null || question.profilePictureUrl === null)
    ) {
      return {
        ...question,
        userName: question.userName ?? userForumName(user) ?? user.email?.split('@')[0] ?? null,
        profilePictureUrl: question.profilePictureUrl ?? userProfilePictureUrl(user),
      };
    }
    return question;
  });
}

export async function fetchQuestion(questionId: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions_public')
    .select('*')
    .eq('id', questionId)
    .maybeSingle();
  check(error, 'Failed to load question');
  return data ? questionFromRow(data) : null;
}

export async function createQuestion(input: {
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  tags?: string[];
}): Promise<Question> {
  const user = await requireUser('post questions');

  const now = toDbTimestamp(new Date());
  const profilePictureUrl = input.isAnonymous ? null : userProfilePictureUrl(user);
  const { data, error } = await supabase
    .from('questions')
    .insert({
      title: input.title,
      content: input.content,
      category: input.category,
      user_id: user.id,
      user_name: input.isAnonymous ? null : userForumName(user),
      is_anonymous: input.isAnonymous,
      upvotes: 0,
      answer_count: 0,
      created_at: now,
      updated_at: now,
      is_resolved: false,
      tags: input.tags ?? [],
      ...(profilePictureUrl && { profile_picture_url: profilePictureUrl }),
    })
    .select(QUESTION_COLUMNS)
    .single();
  check(error, 'Failed to post question');
  return questionFromRow({ ...data, user_id: user.id });
}

export async function updateQuestion(
  questionId: string,
  changes: { title?: string; content?: string; category?: string; isResolved?: boolean },
): Promise<Question> {
  const { data, error } = await supabase
    .from('questions')
    .update({
      updated_at: toDbTimestamp(new Date()),
      ...(changes.title !== undefined && { title: changes.title }),
      ...(changes.content !== undefined && { content: changes.content }),
      ...(changes.category !== undefined && { category: changes.category }),
      ...(changes.isResolved !== undefined && { is_resolved: changes.isResolved }),
    })
    .eq('id', questionId)
    .select(QUESTION_COLUMNS)
    .single();
  check(error, 'Failed to update question');
  // Only the author can change a question.
  return questionFromRow({ ...data, user_id: await currentUserId() });
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const { error } = await supabase.from('questions').delete().eq('id', questionId);
  check(error, 'Failed to delete question');
}

/** Adds the user's upvote, or removes it if they already upvoted. Returns whether it's now upvoted. */
export async function toggleQuestionUpvote(questionId: string): Promise<boolean> {
  const userId = await requireUserId('upvote');
  const existing = await supabase
    .from('question_votes')
    .select('id')
    .eq('question_id', questionId)
    .eq('user_id', userId)
    .maybeSingle();
  check(existing.error, 'Failed to check upvote');

  if (existing.data) {
    const removed = await supabase
      .from('question_votes')
      .delete()
      .eq('question_id', questionId)
      .eq('user_id', userId);
    check(removed.error, 'Failed to remove upvote');
    const rpc = await supabase.rpc('decrement_question_upvotes', { question_id_param: questionId });
    check(rpc.error, 'Failed to update upvote count');
    return false;
  }

  const added = await supabase.from('question_votes').insert({
    question_id: questionId,
    user_id: userId,
    created_at: toDbTimestamp(new Date()),
  });
  check(added.error, 'Failed to upvote');
  const rpc = await supabase.rpc('increment_question_upvotes', { question_id_param: questionId });
  check(rpc.error, 'Failed to update upvote count');
  return true;
}

export async function hasUpvotedQuestion(questionId: string): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  const { data, error } = await supabase
    .from('question_votes')
    .select('id')
    .eq('question_id', questionId)
    .eq('user_id', userId)
    .maybeSingle();
  check(error, 'Failed to check upvote');
  return data !== null;
}

// ---- Answers ----

export async function fetchAnswers(questionId: string): Promise<Answer[]> {
  const { data, error } = await supabase
    .from('answers_public')
    .select('*')
    .eq('question_id', questionId)
    .order('is_accepted', { ascending: false })
    .order('upvotes', { ascending: false })
    .order('created_at', { ascending: false });
  check(error, 'Failed to load answers');
  return (data ?? []).map(answerFromRow);
}

export async function createAnswer(input: {
  questionId: string;
  content: string;
  isAnonymous: boolean;
  parentAnswerId?: string | null;
}): Promise<Answer> {
  const user = await requireUser('post answers');

  const now = toDbTimestamp(new Date());
  // The Flutter app uses only the `name` metadata key for answers.
  const name = user.user_metadata?.name;
  const { data, error } = await supabase
    .from('answers')
    .insert({
      question_id: input.questionId,
      content: input.content,
      user_id: user.id,
      user_name: input.isAnonymous ? null : typeof name === 'string' ? name : null,
      is_anonymous: input.isAnonymous,
      upvotes: 0,
      created_at: now,
      updated_at: now,
      is_accepted: false,
      parent_answer_id: input.parentAnswerId ?? null,
    })
    .select(ANSWER_COLUMNS)
    .single();
  check(error, 'Failed to post answer');

  const rpc = await supabase.rpc('increment_answer_count', {
    question_id_param: input.questionId,
  });
  check(rpc.error, 'Failed to update answer count');
  return answerFromRow({ ...data, user_id: user.id });
}

export async function updateAnswer(answerId: string, content: string): Promise<Answer> {
  const { data, error } = await supabase
    .from('answers')
    .update({ content, updated_at: toDbTimestamp(new Date()) })
    .eq('id', answerId)
    .select(ANSWER_COLUMNS)
    .single();
  check(error, 'Failed to update answer');
  // Only the author can change an answer.
  return answerFromRow({ ...data, user_id: await currentUserId() });
}

export async function deleteAnswer(answerId: string, questionId: string): Promise<void> {
  const { error } = await supabase.from('answers').delete().eq('id', answerId);
  check(error, 'Failed to delete answer');
  const rpc = await supabase.rpc('decrement_answer_count', { question_id_param: questionId });
  check(rpc.error, 'Failed to update answer count');
}

/** Marks one answer as the best answer for its question. */
export async function acceptAnswer(answerId: string, questionId: string): Promise<void> {
  const cleared = await supabase
    .from('answers')
    .update({ is_accepted: false })
    .eq('question_id', questionId);
  check(cleared.error, 'Failed to accept answer');
  const accepted = await supabase.from('answers').update({ is_accepted: true }).eq('id', answerId);
  check(accepted.error, 'Failed to accept answer');
}

/** Adds the user's upvote, or removes it if they already upvoted. Returns whether it's now upvoted. */
export async function toggleAnswerUpvote(answerId: string): Promise<boolean> {
  const userId = await requireUserId('upvote');
  const existing = await supabase
    .from('answer_votes')
    .select('id')
    .eq('answer_id', answerId)
    .eq('user_id', userId)
    .maybeSingle();
  check(existing.error, 'Failed to check upvote');

  if (existing.data) {
    const removed = await supabase
      .from('answer_votes')
      .delete()
      .eq('answer_id', answerId)
      .eq('user_id', userId);
    check(removed.error, 'Failed to remove upvote');
    const rpc = await supabase.rpc('decrement_answer_upvotes', { answer_id_param: answerId });
    check(rpc.error, 'Failed to update upvote count');
    return false;
  }

  const added = await supabase.from('answer_votes').insert({
    answer_id: answerId,
    user_id: userId,
    created_at: toDbTimestamp(new Date()),
  });
  check(added.error, 'Failed to upvote');
  const rpc = await supabase.rpc('increment_answer_upvotes', { answer_id_param: answerId });
  check(rpc.error, 'Failed to update upvote count');
  return true;
}

export async function hasUpvotedAnswer(answerId: string): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  const { data, error } = await supabase
    .from('answer_votes')
    .select('id')
    .eq('answer_id', answerId)
    .eq('user_id', userId)
    .maybeSingle();
  check(error, 'Failed to check upvote');
  return data !== null;
}

// ---- Reports ----

export async function reportContent(input: {
  contentType: 'question' | 'answer';
  contentId: string;
  reason: string;
  additionalInfo?: string | null;
}): Promise<void> {
  const userId = await requireUserId('report content');
  const { error } = await supabase.from('reports').insert({
    content_type: input.contentType,
    content_id: input.contentId,
    user_id: userId,
    reason: input.reason,
    additional_info: input.additionalInfo ?? null,
    created_at: toDbTimestamp(new Date()),
    status: 'pending',
  });
  check(error, 'Failed to send report');
}
