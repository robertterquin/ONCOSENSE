import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addArticleBookmark,
  addQuestionBookmark,
  addResourceBookmark,
  fetchBookmarkedArticles,
  fetchBookmarkedQuestions,
  fetchBookmarkedResources,
  removeArticleBookmark,
  removeQuestionBookmark,
  removeResourceBookmark,
} from '@/api/bookmarks';
import { useUserId } from '@/stores/authStore';
import type { Article } from '@/types/article';
import type { Question } from '@/types/question';
import type { Resource } from '@/types/resource';

import { queryKeys } from './queryKeys';

// Replaces lib/providers/bookmark_provider.dart. Each list is loaded once; "is this
// bookmarked?" and counts are derived from it instead of extra requests.

export function useBookmarkedArticles() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.bookmarkedArticles(userId),
    queryFn: fetchBookmarkedArticles,
  });
}

export function useBookmarkedQuestions() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.bookmarkedQuestions(userId),
    queryFn: fetchBookmarkedQuestions,
  });
}

export function useBookmarkedResources() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.bookmarkedResources(userId),
    queryFn: fetchBookmarkedResources,
  });
}

export function useIsArticleBookmarked(url: string): boolean {
  return useBookmarkedArticles().data?.some((article) => article.url === url) ?? false;
}

export function useIsQuestionBookmarked(questionId: string): boolean {
  return useBookmarkedQuestions().data?.some((question) => question.id === questionId) ?? false;
}

export function useIsResourceBookmarked(resourceId: string): boolean {
  return useBookmarkedResources().data?.some((resource) => resource.id === resourceId) ?? false;
}

export function useTotalBookmarkCount(): number {
  const articles = useBookmarkedArticles().data?.length ?? 0;
  const questions = useBookmarkedQuestions().data?.length ?? 0;
  const resources = useBookmarkedResources().data?.length ?? 0;
  return articles + questions + resources;
}

/**
 * Builds an optimistic add/remove toggle for one bookmark list: the item appears or
 * disappears immediately and is restored if the request fails.
 * Call `toggle(item)`; it saves the item, or removes it if it's already saved.
 */
function useToggleBookmark<T>(options: {
  queryKey: readonly unknown[];
  sameItem: (a: T, b: T) => boolean;
  add: (item: T) => Promise<void>;
  remove: (item: T) => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { queryKey, sameItem } = options;

  const mutation = useMutation({
    mutationFn: ({ item, save }: { item: T; save: boolean }) =>
      save ? options.add(item) : options.remove(item),
    onMutate: async ({ item, save }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<T[]>(queryKey) ?? [];
      queryClient.setQueryData<T[]>(
        queryKey,
        save ? [item, ...previous] : previous.filter((saved) => !sameItem(saved, item)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const toggle = (item: T) => {
    const list = queryClient.getQueryData<T[]>(queryKey) ?? [];
    mutation.mutate({ item, save: !list.some((saved) => sameItem(saved, item)) });
  };

  return { ...mutation, toggle };
}

export function useToggleArticleBookmark() {
  const userId = useUserId();
  return useToggleBookmark<Article>({
    queryKey: queryKeys.bookmarkedArticles(userId),
    sameItem: (a, b) => a.url === b.url,
    add: addArticleBookmark,
    remove: (article) => removeArticleBookmark(article.url),
  });
}

export function useToggleQuestionBookmark() {
  const userId = useUserId();
  return useToggleBookmark<Question>({
    queryKey: queryKeys.bookmarkedQuestions(userId),
    sameItem: (a, b) => a.id === b.id,
    add: addQuestionBookmark,
    remove: (question) => removeQuestionBookmark(question.id),
  });
}

export function useToggleResourceBookmark() {
  const userId = useUserId();
  return useToggleBookmark<Resource>({
    queryKey: queryKeys.bookmarkedResources(userId),
    sameItem: (a, b) => a.id === b.id,
    add: addResourceBookmark,
    remove: (resource) => removeResourceBookmark(resource.id),
  });
}
