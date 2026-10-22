import { supabase } from '@/lib/supabase';
import { preventionTipFromRow, type PreventionTip } from '@/types/preventionTip';
import { selfCheckGuideFromRow, type SelfCheckGuide } from '@/types/selfCheckGuide';

import { check, ilikeValue } from './errors';

// Port of lib/services/prevention_service.dart. Content comes from WHO, CDC, NCI and similar sources.

export async function fetchPreventionTips(category?: string): Promise<PreventionTip[]> {
  let query = supabase.from('prevention_tips').select().eq('is_active', true);
  if (category) query = query.eq('category', category);
  const { data, error } = await query.order('display_order');
  check(error, 'Failed to fetch prevention tips');
  return (data ?? []).map(preventionTipFromRow);
}

export async function fetchPreventionCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('prevention_tips')
    .select('category')
    .eq('is_active', true);
  check(error, 'Failed to fetch prevention categories');
  return [...new Set((data ?? []).map((row) => row.category as string))].sort();
}

export async function fetchSelfCheckGuides(cancerType?: string): Promise<SelfCheckGuide[]> {
  let query = supabase.from('self_check_guides').select().eq('is_active', true);
  if (cancerType) query = query.eq('cancer_type', cancerType);
  const { data, error } = await query.order('display_order');
  check(error, 'Failed to fetch self-check guides');
  return (data ?? []).map(selfCheckGuideFromRow);
}

export async function fetchSelfCheckGuideById(id: string): Promise<SelfCheckGuide> {
  const { data, error } = await supabase
    .from('self_check_guides')
    .select()
    .eq('id', id)
    .eq('is_active', true)
    .single();
  check(error, 'Failed to fetch self-check guide');
  return selfCheckGuideFromRow(data);
}

export async function fetchSelfCheckCancerTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from('self_check_guides')
    .select('cancer_type')
    .eq('is_active', true);
  check(error, 'Failed to fetch self-check cancer types');
  return [...new Set((data ?? []).map((row) => row.cancer_type as string))].sort();
}

export async function searchPreventionTips(keyword: string): Promise<PreventionTip[]> {
  const value = ilikeValue(keyword);
  const { data, error } = await supabase
    .from('prevention_tips')
    .select()
    .eq('is_active', true)
    .or(`title.ilike.${value},description.ilike.${value},detailed_info.ilike.${value}`)
    .order('display_order');
  check(error, 'Failed to search prevention tips');
  return (data ?? []).map(preventionTipFromRow);
}

export async function searchSelfCheckGuides(keyword: string): Promise<SelfCheckGuide[]> {
  const value = ilikeValue(keyword);
  const { data, error } = await supabase
    .from('self_check_guides')
    .select()
    .eq('is_active', true)
    .or(`title.ilike.${value},description.ilike.${value},cancer_type.ilike.${value}`)
    .order('display_order');
  check(error, 'Failed to search self-check guides');
  return (data ?? []).map(selfCheckGuideFromRow);
}
