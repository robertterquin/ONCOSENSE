import { parseDbTimestamp, toDbTimestamp } from '@/lib/dates';

import { booleanOr, optionalNumber, requireString, type Row } from './row';

/** Stored by name in the `type` column. The order matches Flutter's enum (used for old numeric rows). */
export const MILESTONE_TYPES = [
  'daysFree',
  'treatmentComplete',
  'sessionComplete',
  'recovery',
  'personal',
  'anniversary',
] as const;

export type MilestoneType = (typeof MILESTONE_TYPES)[number];

export type Milestone = {
  id: string;
  title: string;
  description: string;
  type: MilestoneType;
  dateAchieved: Date;
  isCelebrated: boolean;
  /** Not stored in Supabase (same as Flutter); the icon comes from the type. */
  iconName: string | null;
  /** For days-free and streak milestones. */
  daysCount: number | null;
};

function parseMilestoneType(value: unknown): MilestoneType {
  if (typeof value === 'number') return MILESTONE_TYPES[value] ?? 'personal';
  return MILESTONE_TYPES.find((type) => type === value) ?? 'personal';
}

export function milestoneFromRow(row: Row): Milestone {
  return {
    id: requireString(row, 'id'),
    title: requireString(row, 'title'),
    description: requireString(row, 'description'),
    type: parseMilestoneType(row.type),
    dateAchieved: parseDbTimestamp(requireString(row, 'date_achieved')),
    isCelebrated: booleanOr(row, 'is_celebrated', false),
    iconName: null,
    daysCount: optionalNumber(row, 'days_count'),
  };
}

/** Columns for `journey_milestones`; the API layer adds `user_id`. */
export function milestoneToRow(milestone: Milestone): Row {
  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    type: milestone.type,
    date_achieved: toDbTimestamp(milestone.dateAchieved),
    is_celebrated: milestone.isCelebrated,
    days_count: milestone.daysCount,
  };
}

export const TREATMENT_MILESTONES = [
  { percent: 25, title: '25% Treatment Complete! 💪', description: 'Quarter way through!' },
  { percent: 50, title: '50% Treatment Complete! 🎯', description: 'Halfway there!' },
  { percent: 75, title: '75% Treatment Complete! 🌟', description: 'Almost at the finish line!' },
  { percent: 100, title: 'Treatment Complete! 🎉', description: 'You did it! Treatment finished!' },
];

export const STREAK_MILESTONE_DAYS = [7, 14, 30, 60, 90, 180, 365];
