import { parseOptionalDbTimestamp } from '@/lib/dates';

import { booleanOr, numberOr, optionalString, requireString, type Row } from './row';

export type HealthReminder = {
  id: string;
  title: string;
  message: string;
  /** Material icon name, e.g. `water_drop`. */
  icon: string;
  /** Hex color without `#`, e.g. `2196F3`. */
  color: string;
  category: string;
  /** How often to show it, in hours. */
  frequencyHours: number;
  isActive: boolean;
  lastShownAt: Date | null;
  /** Where the information comes from. */
  source: string | null;
  /** 1–5; higher shows first. */
  priority: number;
};

export function healthReminderFromRow(row: Row): HealthReminder {
  return {
    id: requireString(row, 'id'),
    title: requireString(row, 'title'),
    message: requireString(row, 'message'),
    icon: requireString(row, 'icon'),
    color: requireString(row, 'color'),
    category: requireString(row, 'category'),
    frequencyHours: numberOr(row, 'frequency_hours', 24),
    isActive: booleanOr(row, 'is_active', true),
    lastShownAt: parseOptionalDbTimestamp(row.last_shown_at),
    source: optionalString(row, 'source'),
    priority: numberOr(row, 'priority', 3),
  };
}

/** Whether enough time has passed since the reminder was last shown. */
export function shouldShowReminder(reminder: HealthReminder, now: Date = new Date()): boolean {
  if (!reminder.isActive) return false;
  if (!reminder.lastShownAt) return true;
  const hoursSinceShown = Math.trunc((now.getTime() - reminder.lastShownAt.getTime()) / 3_600_000);
  return hoursSinceShown >= reminder.frequencyHours;
}

export const REMINDER_CATEGORIES = {
  hydration: 'hydration',
  exercise: 'exercise',
  nutrition: 'nutrition',
  screening: 'screening',
  mentalHealth: 'mental_health',
  sunProtection: 'sun_protection',
  sleepHealth: 'sleep_health',
  selfExam: 'self_exam',
} as const;
