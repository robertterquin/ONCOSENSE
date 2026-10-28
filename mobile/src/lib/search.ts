import type { CancerType } from '@/types/cancerType';
import type { PreventionTip } from '@/types/preventionTip';
import type { Question } from '@/types/question';
import type { Resource } from '@/types/resource';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

export type SearchableData = {
  cancers: CancerType[];
  guides: SelfCheckGuide[];
  tips: PreventionTip[];
  resources: Resource[];
  questions: Question[];
};

export type UniversalSearchResults = {
  cancers: CancerType[];
  guides: SelfCheckGuide[];
  tips: PreventionTip[];
  resources: Resource[];
  questions: Question[];
  totalCount: number;
};

const lower = (text: string) => text.trim().toLowerCase();

const matches = (query: string, ...fields: (string | null | undefined | string[])[]) =>
  fields.some((field) =>
    Array.isArray(field)
      ? field.some((item) => lower(item).includes(query))
      : field !== null && field !== undefined && lower(field).includes(query),
  );

/**
 * Universal search across all OncoSense domains:
 * - Cancer types and symptoms
 * - Self-check guides
 * - Daily prevention tips and habits
 * - Health resources, hotlines & screening centers
 * - Community discussions & survivor questions
 */
export function searchUniversal(data: SearchableData, rawQuery: string): UniversalSearchResults {
  const query = lower(rawQuery);

  if (!query) {
    return {
      cancers: [],
      guides: [],
      tips: [],
      resources: [],
      questions: [],
      totalCount: 0,
    };
  }

  const cancers = data.cancers.filter((c) =>
    matches(query, c.name, c.description, c.symptoms, c.riskFactors, c.screeningMethods),
  );

  const guides = data.guides.filter((g) =>
    matches(query, g.title, g.cancerType, g.description, g.warningSigns),
  );

  const tips = data.tips.filter((t) =>
    matches(query, t.title, t.description, t.category, t.sourceName, t.detailedInfo),
  );

  const resources = data.resources.filter((r) =>
    matches(query, r.name, r.description, r.address, r.location, r.type),
  );

  const questions = data.questions.filter((q) =>
    matches(query, q.title, q.content, q.category, q.tags),
  );

  const totalCount =
    cancers.length + guides.length + tips.length + resources.length + questions.length;

  return {
    cancers,
    guides,
    tips,
    resources,
    questions,
    totalCount,
  };
}

export const SUGGESTED_SEARCHES = [
  'Breast Self-Exam',
  'Colorectal screening',
  'Managing fatigue',
  'Diet and nutrition',
  'Free screening centers',
  'Chemotherapy support',
  'Skin check',
  'Quit smoking',
] as const;
