import type { IconName } from '@/components/ui/Icon';
import type { CancerType } from '@/types/cancerType';
import type { PreventionTip } from '@/types/preventionTip';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

// Links between Learn's content (redesign Phase 3): a cancer type and its self-check,
// an awareness month and its cancer type, and one search over all three lists.

const lower = (text: string) => text.trim().toLowerCase();

/** The self-check for a cancer type: guide "Breast" ↔ "Breast Cancer", "Leukemia" ↔ "Leukemia". */
export function guideForCancer<T extends Pick<SelfCheckGuide, 'cancerType'>>(
  guides: T[],
  cancer: Pick<CancerType, 'name'>,
): T | null {
  const name = lower(cancer.name);
  return guides.find((guide) => name.startsWith(lower(guide.cancerType))) ?? null;
}

// Organ and clinical icons for cancer types (Health Icons & Hugeicons).
const CANCER_ICONS: [prefix: string, icon: IconName][] = [
  ['breast', 'breast'],
  ['cervic', 'cervix'],
  ['color', 'colon'],
  ['colon', 'colon'],
  ['leukemia', 'blood-cells'],
  ['liver', 'liver'],
  ['lung', 'lungs'],
  ['ovari', 'ovaries'],
  ['prostat', 'prostate'],
  ['skin', 'skin-check'],
  ['stomach', 'stomach'],
  ['gastric', 'stomach'],
  ['oral', 'tooth'],
  ['testicular', 'testicular'],
];

/** The icon for a cancer type or a guide's `cancerType` ("Lung Cancer", "Oral"). */
export function iconForCancer(name: string): IconName {
  const key = lower(name);
  return CANCER_ICONS.find(([prefix]) => key.startsWith(prefix))?.[1] ?? 'ribbon';
}

/** The cancer type an awareness month is about ("Breast Cancer"), if Learn has it. */
export function cancerForAwareness<T extends Pick<CancerType, 'name'>>(
  cancers: T[],
  awarenessTitle: string,
): T | null {
  return cancers.find((cancer) => lower(cancer.name) === lower(awarenessTitle)) ?? null;
}

type LearnLists = {
  cancers: CancerType[];
  guides: SelfCheckGuide[];
  tips: PreventionTip[];
};

const matches = (query: string, ...fields: (string | null | string[])[]) =>
  fields.some((field) =>
    Array.isArray(field)
      ? field.some((item) => lower(item).includes(query))
      : field !== null && lower(field).includes(query),
  );

/** Learn's search: names, signs and descriptions across cancer types, guides and tips. */
export function searchLearn(lists: LearnLists, text: string): LearnLists {
  const query = lower(text);
  if (!query) return lists;
  return {
    cancers: lists.cancers.filter((c) => matches(query, c.name, c.description, c.symptoms)),
    guides: lists.guides.filter((g) => matches(query, g.title, g.cancerType, g.description)),
    tips: lists.tips.filter((t) => matches(query, t.title, t.description, t.category)),
  };
}
