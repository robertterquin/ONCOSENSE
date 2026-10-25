import { useQuery } from '@tanstack/react-query';

import { fetchResourcesByCategory } from '@/api/resources';

import { queryKeys } from './queryKeys';

// Replaces lib/providers/resources_provider.dart.

/** Hotlines, screening centers, financial support and support groups, loaded together. */
export function useAllResources() {
  return useQuery({ queryKey: queryKeys.resourcesByCategory, queryFn: fetchResourcesByCategory });
}
