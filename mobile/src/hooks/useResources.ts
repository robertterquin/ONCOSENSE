import { useQuery } from '@tanstack/react-query';

import { fetchResourcesByCategory, fetchResourcesByType } from '@/api/resources';
import type { ResourceType } from '@/types/resource';

import { queryKeys } from './queryKeys';

// Replaces lib/providers/resources_provider.dart.

/** Hotlines, screening centers, financial support and support groups, loaded together. */
export function useAllResources() {
  return useQuery({ queryKey: queryKeys.resourcesByCategory, queryFn: fetchResourcesByCategory });
}

export function useResourcesByType(type: ResourceType) {
  return useQuery({
    queryKey: queryKeys.resourcesByType(type),
    queryFn: () => fetchResourcesByType(type),
  });
}
