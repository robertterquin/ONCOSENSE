import { parseDbTimestamp, toDbTimestamp } from '@/lib/dates';

import { booleanOr, optionalString, requireString, stringArray, type Row } from './row';

/** A daily journal entry in the journey tracker. */
export type JourneyEntry = {
  id: string;
  date: Date;
  /** 1–5 (1 = very sad, 5 = very happy). */
  moodLevel: number;
  /** 0–10. */
  painLevel: number;
  /** 1–10. */
  energyLevel: number;
  /** 1–5. */
  sleepQuality: number;
  symptoms: string[];
  notes: string | null;
  appointmentNotes: string | null;
  hasAppointment: boolean;
};

export function journeyEntryFromRow(row: Row): JourneyEntry {
  return {
    id: requireString(row, 'id'),
    date: parseDbTimestamp(requireString(row, 'date')),
    moodLevel: row.mood_level as number,
    painLevel: row.pain_level as number,
    energyLevel: row.energy_level as number,
    sleepQuality: row.sleep_quality as number,
    symptoms: stringArray(row, 'symptoms'),
    notes: optionalString(row, 'notes'),
    appointmentNotes: optionalString(row, 'appointment_notes'),
    hasAppointment: booleanOr(row, 'has_appointment', false),
  };
}

/** Columns for `journey_entries`; the API layer adds `user_id`. */
export function journeyEntryToRow(entry: JourneyEntry): Row {
  return {
    id: entry.id,
    date: toDbTimestamp(entry.date),
    mood_level: entry.moodLevel,
    pain_level: entry.painLevel,
    energy_level: entry.energyLevel,
    sleep_quality: entry.sleepQuality,
    symptoms: entry.symptoms,
    notes: entry.notes,
    appointment_notes: entry.appointmentNotes,
    has_appointment: entry.hasAppointment,
  };
}

/** Symptoms offered for quick selection. */
export const COMMON_SYMPTOMS = [
  'Fatigue',
  'Nausea',
  'Pain',
  'Headache',
  'Dizziness',
  'Loss of Appetite',
  'Difficulty Sleeping',
  'Anxiety',
  'Hair Loss',
  'Numbness/Tingling',
  'Mouth Sores',
  'Constipation',
  'Diarrhea',
  'Shortness of Breath',
  'Fever',
  'Chills',
  'Skin Changes',
  'Weight Changes',
  'Memory Issues',
  'Mood Changes',
];
