import { parseDbTimestamp, parseOptionalDbTimestamp, toDbTimestamp } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/types/article';
import type { Question } from '@/types/question';
import type { Resource } from '@/types/resource';
import { booleanOr, numberOr, optionalString, stringArray, stringOr, type Row } from '@/types/row';

import { check, currentUserId, requireUserId } from './errors';

// Port of lib/services/bookmark_service.dart. Bookmarks are copies of the item stored
// per user, so saved lists load without fetching the original rows.
// Signed-out users simply have no bookmarks.

// ---- Articles (keyed by URL) ----

function articleFromBookmark(row: Row): Article {
  return {
    title: stringOr(row, 'title', ''),
    description: stringOr(row, 'description', ''),
    url: stringOr(row, 'url', ''),
    imageUrl: optionalString(row, 'image_url'),
    publishedAt: stringOr(row, 'published_at', ''),
    sourceName: stringOr(row, 'source_name', 'Unknown'),
  };
}

export async function fetchBookmarkedArticles(): Promise<Article[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('article_bookmarks')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  check(error, 'Failed to load saved articles');
  return (data ?? []).map(articleFromBookmark);
}

export async function addArticleBookmark(article: Article): Promise<void> {
  const userId = await requireUserId('save articles');
  const { error } = await supabase.from('article_bookmarks').upsert(
    {
      user_id: userId,
      title: article.title,
      description: article.description,
      url: article.url,
      image_url: article.imageUrl,
      published_at: article.publishedAt,
      source_name: article.sourceName,
    },
    // Already saved is fine: the table has UNIQUE(user_id, url).
    { onConflict: 'user_id,url', ignoreDuplicates: true },
  );
  check(error, 'Failed to save article');
}

export async function removeArticleBookmark(url: string): Promise<void> {
  const userId = await requireUserId('remove saved articles');
  const { error } = await supabase
    .from('article_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('url', url);
  check(error, 'Failed to remove saved article');
}

// ---- Questions (keyed by question id) ----

function questionFromBookmark(row: Row): Question {
  return {
    id: stringOr(row, 'question_id', ''),
    title: stringOr(row, 'title', ''),
    content: stringOr(row, 'content', ''),
    category: stringOr(row, 'category', ''),
    userId: stringOr(row, 'question_user_id', ''),
    userName: optionalString(row, 'question_user_name'),
    profilePictureUrl: optionalString(row, 'profile_picture_url'),
    isAnonymous: booleanOr(row, 'is_anonymous', false),
    upvotes: numberOr(row, 'upvotes', 0),
    answerCount: numberOr(row, 'answer_count', 0),
    createdAt: parseDbTimestamp(row.question_created_at as string),
    updatedAt: parseDbTimestamp(row.question_updated_at as string),
    isResolved: booleanOr(row, 'is_resolved', false),
    tags: stringArray(row, 'tags'),
  };
}

export async function fetchBookmarkedQuestions(): Promise<Question[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('question_bookmarks')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  check(error, 'Failed to load saved questions');
  return (data ?? []).map(questionFromBookmark);
}

export async function addQuestionBookmark(question: Question): Promise<void> {
  const userId = await requireUserId('save questions');
  const { error } = await supabase.from('question_bookmarks').upsert(
    {
      user_id: userId,
      question_id: question.id,
      title: question.title,
      content: question.content,
      category: question.category,
      question_user_id: question.userId,
      question_user_name: question.userName,
      profile_picture_url: question.profilePictureUrl,
      is_anonymous: question.isAnonymous,
      upvotes: question.upvotes,
      answer_count: question.answerCount,
      question_created_at: toDbTimestamp(question.createdAt),
      question_updated_at: toDbTimestamp(question.updatedAt),
      is_resolved: question.isResolved,
      tags: question.tags,
    },
    // Already saved is fine: the table has UNIQUE(user_id, question_id).
    { onConflict: 'user_id,question_id', ignoreDuplicates: true },
  );
  check(error, 'Failed to save question');
}

export async function removeQuestionBookmark(questionId: string): Promise<void> {
  const userId = await requireUserId('remove saved questions');
  const { error } = await supabase
    .from('question_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('question_id', questionId);
  check(error, 'Failed to remove saved question');
}

// ---- Resources (keyed by resource id) ----

function resourceFromBookmark(row: Row): Resource {
  return {
    id: stringOr(row, 'resource_id', ''),
    name: stringOr(row, 'name', ''),
    type: stringOr(row, 'type', ''),
    description: stringOr(row, 'description', ''),
    phone: optionalString(row, 'phone'),
    location: optionalString(row, 'location'),
    address: optionalString(row, 'address'),
    website: optionalString(row, 'website'),
    email: optionalString(row, 'email'),
    isVerified: booleanOr(row, 'is_verified', false),
    isActive: booleanOr(row, 'is_active', true),
    createdAt: parseOptionalDbTimestamp(row.resource_created_at) ?? new Date(),
  };
}

export async function fetchBookmarkedResources(): Promise<Resource[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('resource_bookmarks')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  check(error, 'Failed to load saved resources');
  return (data ?? []).map(resourceFromBookmark);
}

export async function addResourceBookmark(resource: Resource): Promise<void> {
  const userId = await requireUserId('save resources');
  const { error } = await supabase.from('resource_bookmarks').upsert(
    {
      user_id: userId,
      resource_id: resource.id,
      name: resource.name,
      type: resource.type,
      description: resource.description,
      phone: resource.phone,
      location: resource.location,
      address: resource.address,
      website: resource.website,
      email: resource.email,
      is_verified: resource.isVerified,
      is_active: resource.isActive,
      resource_created_at: toDbTimestamp(resource.createdAt),
    },
    // Already saved is fine: the table has UNIQUE(user_id, resource_id).
    { onConflict: 'user_id,resource_id', ignoreDuplicates: true },
  );
  check(error, 'Failed to save resource');
}

export async function removeResourceBookmark(resourceId: string): Promise<void> {
  const userId = await requireUserId('remove saved resources');
  const { error } = await supabase
    .from('resource_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('resource_id', resourceId);
  check(error, 'Failed to remove saved resource');
}
