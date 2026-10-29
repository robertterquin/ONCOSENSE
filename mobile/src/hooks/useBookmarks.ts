import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addQuestionBookmark,
  addResourceBookmark,
  fetchBookmarkedQuestions,
  fetchBookmarkedResources,
  removeQuestionBookmark,
  removeResourceBookmark,
} from '@/api/bookmarks';
import { useUserId } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';
import type { Question } from '@/types/question';
import type { Resource } from '@/types/resource';

import { queryKeys } from './queryKeys';

// Replaces lib/providers/bookmark_provider.dart. Each list is loaded once; "is this
// bookmarked?" and counts are derived from it instead of extra requests.

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
    onError: (error, { save }, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
      showToast(`Couldn't ${save ? 'save' : 'remove'} it: ${error.message}`, 'error');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const toggle = (item: T) => {
    const list = queryClient.getQueryData<T[]>(queryKey) ?? [];
    mutation.mutate({ item, save: !list.some((saved) => sameItem(saved, item)) });
  };

  return { ...mutation, toggle };
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
