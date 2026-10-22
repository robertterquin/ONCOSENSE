import { supabase } from '@/lib/supabase';

// Phase 1 connection check only. The full port of
// lib/services/cancer_info_service.dart replaces this in Phase 2.
export async function listCancerTypeNames(limit = 5): Promise<string[]> {
  const { data, error } = await supabase
    .from('cancer_types')
    .select('name')
    .order('name')
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load cancer types: ${error.message}`);
  }
  return data.map((row) => row.name as string);
}
