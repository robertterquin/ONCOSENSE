import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import {
  acceptAnswer,
  createAnswer,
  createQuestion,
  deleteAnswer,
  deleteQuestion,
  fetchAnswers,
  fetchQuestion,
  fetchQuestions,
  hasUpvotedAnswer,
  hasUpvotedQuestion,
  reportContent,
  toggleAnswerUpvote,
  toggleQuestionUpvote,
  updateQuestion,
  type QuestionFilters,
} from '@/api/forum';
import { useUserId } from '@/stores/authStore';
import type { Answer } from '@/types/answer';
import type { Question } from '@/types/question';

import { queryKeys } from './queryKeys';

// Replaces lib/providers/forum_provider.dart.

export function useQuestions(filters: QuestionFilters = {}) {
  return useQuery({
    queryKey: queryKeys.questions(filters),
    queryFn: () => fetchQuestions(filters),
  });
}

export function useQuestion(questionId: string) {
  return useQuery({
    queryKey: queryKeys.question(questionId),
    queryFn: () => fetchQuestion(questionId),
  });
}

export function useAnswers(questionId: string) {
  return useQuery({
    queryKey: queryKeys.answers(questionId),
    queryFn: () => fetchAnswers(questionId),
  });
}

export function useHasUpvotedQuestion(questionId: string) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.questionUpvoted(userId, questionId),
    queryFn: () => hasUpvotedQuestion(questionId),
  });
}

export function useHasUpvotedAnswer(answerId: string) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.answerUpvoted(userId, answerId),
    queryFn: () => hasUpvotedAnswer(answerId),
  });
}

function invalidateQuestions(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.allQuestions });
}

export function useAskQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => invalidateQuestions(queryClient),
  });
}

export function useUpdateQuestion(questionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: Parameters<typeof updateQuestion>[1]) =>
      updateQuestion(questionId, changes),
    onSuccess: (question) => {
      queryClient.setQueryData(queryKeys.question(questionId), question);
      return invalidateQuestions(queryClient);
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: (_result, questionId) => {
      queryClient.removeQueries({ queryKey: queryKeys.question(questionId) });
      return invalidateQuestions(queryClient);
    },
  });
}

/** Optimistic: flips the upvote and adjusts the count right away, rolls back on error. */
export function useToggleQuestionUpvote(questionId: string) {
  const queryClient = useQueryClient();
  const userId = useUserId();
  const upvotedKey = queryKeys.questionUpvoted(userId, questionId);

  const adjustCounts = (delta: number) => {
    const update = (question: Question) =>
      question.id === questionId ? { ...question, upvotes: question.upvotes + delta } : question;
    queryClient.setQueryData<Question | null>(queryKeys.question(questionId), (question) =>
      question ? update(question) : question,
    );
    queryClient.setQueriesData<Question[]>({ queryKey: queryKeys.allQuestions }, (questions) =>
      questions?.map(update),
    );
  };

  return useMutation({
    mutationFn: () => toggleQuestionUpvote(questionId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: upvotedKey });
      const wasUpvoted = queryClient.getQueryData<boolean>(upvotedKey) ?? false;
      queryClient.setQueryData(upvotedKey, !wasUpvoted);
      adjustCounts(wasUpvoted ? -1 : 1);
      return { wasUpvoted };
    },
    onError: (_error, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData(upvotedKey, context.wasUpvoted);
      adjustCounts(context.wasUpvoted ? 1 : -1);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: upvotedKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.question(questionId) });
      return invalidateQuestions(queryClient);
    },
  });
}

export function usePostAnswer(questionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      content: string;
      isAnonymous: boolean;
      parentAnswerId?: string | null;
    }) => createAnswer({ questionId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.answers(questionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.question(questionId) });
      return invalidateQuestions(queryClient);
    },
  });
}

export function useDeleteAnswer(questionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answerId: string) => deleteAnswer(answerId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.answers(questionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.question(questionId) });
      return invalidateQuestions(queryClient);
    },
  });
}

export function useAcceptAnswer(questionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answerId: string) => acceptAnswer(answerId, questionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.answers(questionId) }),
  });
}

/** Optimistic, like `useToggleQuestionUpvote`. */
export function useToggleAnswerUpvote(questionId: string, answerId: string) {
  const queryClient = useQueryClient();
  const userId = useUserId();
  const upvotedKey = queryKeys.answerUpvoted(userId, answerId);
  const answersKey = queryKeys.answers(questionId);

  const adjustCount = (delta: number) =>
    queryClient.setQueryData<Answer[]>(answersKey, (answers) =>
      answers?.map((answer) =>
        answer.id === answerId ? { ...answer, upvotes: answer.upvotes + delta } : answer,
      ),
    );

  return useMutation({
    mutationFn: () => toggleAnswerUpvote(answerId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: upvotedKey });
      const wasUpvoted = queryClient.getQueryData<boolean>(upvotedKey) ?? false;
      queryClient.setQueryData(upvotedKey, !wasUpvoted);
      adjustCount(wasUpvoted ? -1 : 1);
      return { wasUpvoted };
    },
    onError: (_error, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData(upvotedKey, context.wasUpvoted);
      adjustCount(context.wasUpvoted ? 1 : -1);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: upvotedKey });
      return queryClient.invalidateQueries({ queryKey: answersKey });
    },
  });
}

export function useReportContent() {
  return useMutation({ mutationFn: reportContent });
}
