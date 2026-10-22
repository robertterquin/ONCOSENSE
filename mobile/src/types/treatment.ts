import { parseDbTimestamp, toDbTimestamp } from '@/lib/dates';

import { booleanOr, numberOr, optionalString, requireString, stringArray, type Row } from './row';

/** Stored by name in the `type` column. The order matches Flutter's enum (used for old numeric rows). */
export const TREATMENT_TYPES = [
  'surgery',
  'chemotherapy',
  'radiation',
  'immunotherapy',
  'hormoneTherapy',
  'targetedTherapy',
  'stemCell',
  'other',
] as const;

export type TreatmentType = (typeof TREATMENT_TYPES)[number];

export type Treatment = {
  id: string;
  name: string;
  type: TreatmentType;
  startDate: Date;
  /** Not stored in Supabase yet (same as Flutter). */
  endDate: Date | null;
  doctorName: string | null;
  hospitalName: string | null;
  notes: string | null;
  totalSessions: number;
  completedSessions: number;
  sideEffects: string[];
  isActive: boolean;
};

function parseTreatmentType(value: unknown): TreatmentType {
  if (typeof value === 'number') return TREATMENT_TYPES[value] ?? 'other';
  return TREATMENT_TYPES.find((type) => type === value) ?? 'other';
}

export function treatmentFromRow(row: Row): Treatment {
  return {
    id: requireString(row, 'id'),
    name: requireString(row, 'name'),
    type: parseTreatmentType(row.type),
    startDate: parseDbTimestamp(requireString(row, 'start_date')),
    endDate: null,
    doctorName: null,
    hospitalName: null,
    notes: optionalString(row, 'notes'),
    totalSessions: numberOr(row, 'total_sessions', 0),
    completedSessions: numberOr(row, 'completed_sessions', 0),
    sideEffects: stringArray(row, 'side_effects'),
    isActive: booleanOr(row, 'is_active', true),
  };
}

/** Columns for `journey_treatments`; the API layer adds `user_id`. */
export function treatmentToRow(treatment: Treatment): Row {
  return {
    id: treatment.id,
    name: treatment.name,
    type: treatment.type,
    start_date: toDbTimestamp(treatment.startDate),
    total_sessions: treatment.totalSessions,
    completed_sessions: treatment.completedSessions,
    side_effects: treatment.sideEffects,
    notes: treatment.notes,
    is_active: treatment.isActive,
  };
}

/** 0–100. */
export function treatmentProgress(treatment: Treatment): number {
  if (treatment.totalSessions === 0) return 0;
  return Math.min(100, Math.max(0, (treatment.completedSessions / treatment.totalSessions) * 100));
}

const TYPE_INFO: Record<TreatmentType, { label: string; icon: string }> = {
  surgery: { label: 'Surgery', icon: 'medical_services' },
  chemotherapy: { label: 'Chemotherapy', icon: 'science' },
  radiation: { label: 'Radiation Therapy', icon: 'radio_button_checked' },
  immunotherapy: { label: 'Immunotherapy', icon: 'security' },
  hormoneTherapy: { label: 'Hormone Therapy', icon: 'medication' },
  targetedTherapy: { label: 'Targeted Therapy', icon: 'track_changes' },
  stemCell: { label: 'Stem Cell Transplant', icon: 'biotech' },
  other: { label: 'Other', icon: 'healing' },
};

export function treatmentTypeLabel(type: TreatmentType): string {
  return TYPE_INFO[type].label;
}

/** Material icon name. */
export function treatmentTypeIcon(type: TreatmentType): string {
  return TYPE_INFO[type].icon;
}
