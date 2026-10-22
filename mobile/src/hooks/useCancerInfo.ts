import { useQuery } from '@tanstack/react-query';

import { fetchAllCancerTypes, fetchCancerTypeById } from '@/api/cancerInfo';
import type { CancerType } from '@/types/cancerType';

import { queryKeys } from './queryKeys';

// Replaces lib/providers/cancer_info_provider.dart.

export function useCancerTypes() {
  return useQuery({ queryKey: queryKeys.cancerTypes, queryFn: fetchAllCancerTypes });
}

/** Client-side name search over the loaded list (same as Flutter's filtered provider). */
export function useFilteredCancerTypes(searchQuery: string) {
  const query = searchQuery.trim().toLowerCase();
  return useQuery({
    queryKey: queryKeys.cancerTypes,
    queryFn: fetchAllCancerTypes,
    select: (types: CancerType[]) =>
      query ? types.filter((type) => type.name.toLowerCase().includes(query)) : types,
  });
}

export function useCancerType(id: string) {
  return useQuery({ queryKey: queryKeys.cancerType(id), queryFn: () => fetchCancerTypeById(id) });
}
