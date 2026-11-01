import { useQuery } from '@tanstack/react-query';

import { fetchAllCancerTypes, fetchCancerTypeById } from '@/api/cancerInfo';

import { useMyCancerId } from './useFocus';
import { queryKeys } from './queryKeys';

// Replaces lib/providers/cancer_info_provider.dart.

export function useCancerTypes() {
  return useQuery({ queryKey: queryKeys.cancerTypes, queryFn: fetchAllCancerTypes });
}

export function useCancerType(id: string) {
  return useQuery({ queryKey: queryKeys.cancerType(id), queryFn: () => fetchCancerTypeById(id) });
}

/** The cancer named in "Which cancer?", once the list has loaded; null otherwise. */
export function useMyCancer() {
  const id = useMyCancerId();
  return useCancerTypes().data?.find((cancer) => cancer.id === id) ?? null;
}
