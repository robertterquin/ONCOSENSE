import { parseOptionalDbTimestamp } from '@/lib/dates';

import { booleanOr, numberOr, optionalString, requireString, type Row } from './row';

export type SelfCheckStep = {
  step: number;
  instruction: string;
  detail: string;
};

export type SelfCheckGuide = {
  id: string;
  title: string;
  description: string;
  cancerType: string;
  frequency: string;
  ageRecommendation: string | null;
  steps: SelfCheckStep[];
  warningSigns: string[] | null;
  whenToSeeDoctor: string;
  sourceName: string;
  sourceUrl: string;
  dateVerified: Date | null;
  displayOrder: number;
  isActive: boolean;
};

/** JSONB columns normally arrive as arrays; older rows may hold a JSON string. */
function jsonArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function selfCheckGuideFromRow(row: Row): SelfCheckGuide {
  const steps = (jsonArray(row.steps) ?? []).map((item) => {
    const step = item as Row;
    return {
      step: step.step as number,
      instruction: requireString(step, 'instruction'),
      detail: requireString(step, 'detail'),
    };
  });
  const warningSigns = jsonArray(row.warning_signs)?.map(String) ?? null;

  return {
    id: requireString(row, 'id'),
    title: requireString(row, 'title'),
    description: requireString(row, 'description'),
    cancerType: requireString(row, 'cancer_type'),
    frequency: requireString(row, 'frequency'),
    ageRecommendation: optionalString(row, 'age_recommendation'),
    steps,
    warningSigns,
    whenToSeeDoctor: requireString(row, 'when_to_see_doctor'),
    sourceName: requireString(row, 'source_name'),
    sourceUrl: requireString(row, 'source_url'),
    dateVerified: parseOptionalDbTimestamp(row.date_verified),
    displayOrder: numberOr(row, 'display_order', 0),
    isActive: booleanOr(row, 'is_active', true),
  };
}
