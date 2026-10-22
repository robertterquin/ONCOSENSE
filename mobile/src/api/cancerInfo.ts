import { supabase } from '@/lib/supabase';
import { cancerTypeFromRow, type CancerType } from '@/types/cancerType';

import { check } from './errors';

// Port of lib/services/cancer_info_service.dart

export async function fetchAllCancerTypes(): Promise<CancerType[]> {
  const { data, error } = await supabase.from('cancer_types').select().order('name');
  check(error, 'Failed to fetch cancer types');
  return (data ?? []).map(cancerTypeFromRow);
}

export async function fetchCancerTypeById(id: string): Promise<CancerType> {
  const { data, error } = await supabase.from('cancer_types').select().eq('id', id).single();
  check(error, 'Failed to fetch cancer type');
  return cancerTypeFromRow(data);
}

export async function searchCancerTypes(query: string): Promise<CancerType[]> {
  if (!query) return fetchAllCancerTypes();
  const { data, error } = await supabase
    .from('cancer_types')
    .select()
    .ilike('name', `%${query}%`)
    .order('name');
  check(error, 'Failed to search cancer types');
  return (data ?? []).map(cancerTypeFromRow);
}
