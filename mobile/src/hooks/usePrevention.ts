import { useQuery } from '@tanstack/react-query';

import {
  fetchPreventionTips,
  fetchSelfCheckGuideById,
  fetchSelfCheckGuides,
} from '@/api/prevention';
import { queryClient } from '@/lib/queryClient';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

import { queryKeys } from './queryKeys';

// Replaces lib/providers/prevention_provider.dart.

export function usePreventionTips() {
  return useQuery({ queryKey: queryKeys.preventionTips, queryFn: () => fetchPreventionTips() });
}

export function useSelfCheckGuides() {
  return useQuery({ queryKey: queryKeys.selfCheckGuides, queryFn: () => fetchSelfCheckGuides() });
}

/** One guide; shows the already-loaded list's copy instantly when there is one. */
export function useSelfCheckGuide(id: string) {
  return useQuery({
    queryKey: queryKeys.selfCheckGuide(id),
    queryFn: () => fetchSelfCheckGuideById(id),
    initialData: () =>
      queryClient
        .getQueryData<SelfCheckGuide[]>(queryKeys.selfCheckGuides)
        ?.find((g) => g.id === id),
  });
}
