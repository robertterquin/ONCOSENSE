import { supabase } from '@/lib/supabase';
import { preventionTipFromRow, type PreventionTip } from '@/types/preventionTip';
import { selfCheckGuideFromRow, type SelfCheckGuide } from '@/types/selfCheckGuide';

import { check } from './errors';

// Port of lib/services/prevention_service.dart. Content comes from WHO, CDC, NCI and similar sources.

export async function fetchPreventionTips(category?: string): Promise<PreventionTip[]> {
  let query = supabase.from('prevention_tips').select().eq('is_active', true);
  if (category) query = query.eq('category', category);
  const { data, error } = await query.order('display_order');
  check(error, 'Failed to fetch prevention tips');
  return (data ?? []).map(preventionTipFromRow);
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
