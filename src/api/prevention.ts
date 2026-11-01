import { supabase } from '@/lib/supabase';
import { selfCheckGuideFromRow, type SelfCheckGuide } from '@/types/selfCheckGuide';

import { check } from './errors';

// Self-check guides (Learn › Checks). The old prevention tips table is no longer read;
// habits live in constants/habits.ts.

export const THYROID_GUIDE: SelfCheckGuide = {
  id: 'd4b79210-6c1e-4a8b-9f32-11e8a90c54b1',
  title: 'Thyroid neck check',
  description: 'How to check your neck using a mirror and a glass of water',
  cancerType: 'Thyroid',
  frequency: 'Monthly',
  ageRecommendation: 'Adults 18+',
  steps: [
    {
      step: 1,
      instruction: 'Stand in front of a mirror with a glass of water',
      detail:
        'Focus on the lower front of your neck, just above the collarbones and below your voice box (Adam’s apple). This is where the thyroid gland sits.',
    },
    {
      step: 2,
      instruction: 'Tilt your head back slightly',
      detail:
        'Keep your chin raised enough to clearly see the lower front of your neck in the mirror under good lighting.',
    },
    {
      step: 3,
      instruction: 'Take a sip of water and swallow',
      detail:
        'Watch your neck in the mirror as you swallow. The thyroid moves up and down when you swallow.',
    },
    {
      step: 4,
      instruction: 'Look for any bulges, swelling, or asymmetry',
      detail:
        'Notice if one side looks fuller than the other or if a lump moves up and down as you swallow (do not confuse your voice box higher up with the thyroid).',
    },
    {
      step: 5,
      instruction: 'Gently feel the base and sides of your neck',
      detail:
        'Use the pads of your fingers to lightly feel just above the collarbones and along the sides of your neck for any firm nodules or swollen lymph nodes.',
    },
  ],
  warningSigns: [
    'A lump or swelling in the lower front of the neck',
    'Hoarseness or voice changes lasting more than 2 weeks',
    'Difficulty swallowing or a feeling that food is stuck',
    'Difficulty breathing or shortness of breath',
    'Swollen lymph nodes in the neck',
    'Persistent pain in the front of the neck reaching up to the ears',
  ],
  whenToSeeDoctor:
    'See a doctor if you notice a lump or bulge at the base of your neck when swallowing, or if you have hoarseness or trouble swallowing that lasts more than 2 weeks. Most thyroid nodules are benign, and a simple neck ultrasound can check them.',
  sourceName: 'American Cancer Society',
  sourceUrl: 'https://www.cancer.org/cancer/types/thyroid-cancer/detection-diagnosis-staging/signs-symptoms.html',
  dateVerified: new Date('2026-11-01'),
  displayOrder: 3,
  isActive: true,
};

export async function fetchSelfCheckGuides(cancerType?: string): Promise<SelfCheckGuide[]> {
  let query = supabase.from('self_check_guides').select().eq('is_active', true);
  if (cancerType) query = query.eq('cancer_type', cancerType);
  const { data, error } = await query.order('display_order');
  check(error, 'Failed to fetch self-check guides');
  const rows = (data ?? [])
    .map(selfCheckGuideFromRow)
    .filter((guide) => guide.cancerType.toLowerCase() !== 'oral');
  const hasThyroid = rows.some((guide) => guide.cancerType.toLowerCase() === 'thyroid');
  if (!hasThyroid && (!cancerType || cancerType.toLowerCase() === 'thyroid')) {
    rows.push(THYROID_GUIDE);
    rows.sort((a, b) => a.displayOrder - b.displayOrder);
  }
  return rows;
}

export async function fetchSelfCheckGuideById(id: string): Promise<SelfCheckGuide> {
  if (id === THYROID_GUIDE.id) return THYROID_GUIDE;
  const { data, error } = await supabase
    .from('self_check_guides')
    .select()
    .eq('id', id)
    .eq('is_active', true)
    .single();
  check(error, 'Failed to fetch self-check guide');
  return selfCheckGuideFromRow(data);
}
