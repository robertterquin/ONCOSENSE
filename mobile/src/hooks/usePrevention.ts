import { useQuery } from '@tanstack/react-query';

import { fetchPreventionTips, fetchSelfCheckGuides } from '@/api/prevention';

import { queryKeys } from './queryKeys';

// Replaces lib/providers/prevention_provider.dart.

export function usePreventionTips() {
  return useQuery({ queryKey: queryKeys.preventionTips, queryFn: () => fetchPreventionTips() });
}

export function useSelfCheckGuides() {
  return useQuery({ queryKey: queryKeys.selfCheckGuides, queryFn: () => fetchSelfCheckGuides() });
}
