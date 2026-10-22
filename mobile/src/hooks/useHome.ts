import { useQuery } from '@tanstack/react-query';

import { getTipOfTheDay } from '@/api/healthTips';
import { fetchRemindersToShow } from '@/api/healthReminders';
import { fetchCancerArticles } from '@/api/news';
import { DATA_LIMITS } from '@/constants/app';

import { queryKeys } from './queryKeys';

// Replaces lib/providers/home_provider.dart.

export function useCancerArticles() {
  return useQuery({
    queryKey: queryKeys.cancerArticles,
    queryFn: () => fetchCancerArticles(DATA_LIMITS.newsArticlesDefault),
  });
}

export function useSurvivorStory() {
  return useQuery({
    queryKey: queryKeys.survivorStory,
    queryFn: async () => {
      const stories = await fetchCancerArticles(
        DATA_LIMITS.survivorStoryCount,
        'cancer survivor story recovery',
      );
      return stories[0] ?? null;
    },
  });
}

export function useHealthReminders() {
  return useQuery({ queryKey: queryKeys.healthReminders, queryFn: () => fetchRemindersToShow() });
}

/** Same tip all day. */
export function useDailyHealthTip() {
  return getTipOfTheDay();
}
