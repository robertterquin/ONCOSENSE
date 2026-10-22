import { DATA_LIMITS } from '@/constants/app';
import { DEFAULT_REMINDERS } from '@/constants/defaultReminders';
import { toDbTimestamp } from '@/lib/dates';
import { shuffle } from '@/lib/shuffle';
import { supabase } from '@/lib/supabase';
import {
  healthReminderFromRow,
  shouldShowReminder,
  type HealthReminder,
} from '@/types/healthReminder';

import { check } from './errors';

// Port of lib/services/health_reminders_service.dart. Falls back to the built-in
// list when the `health_reminders` table can't be read, like the Flutter app.

export async function fetchActiveReminders(
  category?: string,
  limit: number = DATA_LIMITS.healthRemindersLimit,
): Promise<HealthReminder[]> {
  try {
    let query = supabase
      .from('health_reminders')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });
    if (category) query = query.eq('category', category);
    const { data, error } = await query.limit(limit);
    check(error, 'Failed to fetch health reminders');
    return (data ?? []).map(healthReminderFromRow);
  } catch (error) {
    console.warn(error);
    return shuffle(DEFAULT_REMINDERS);
  }
}

/** A random selection, preferring reminders that are due based on their frequency. */
export async function fetchRemindersToShow(
  count: number = DATA_LIMITS.healthRemindersToShow,
  forceRefresh = false,
): Promise<HealthReminder[]> {
  const all = shuffle(await fetchActiveReminders());
  if (all.length === 0) return shuffle(DEFAULT_REMINDERS).slice(0, count);
  if (forceRefresh) return all.slice(0, count);

  const due = all.filter((reminder) => shouldShowReminder(reminder));
  if (due.length >= count) return shuffle(due).slice(0, count);
  return all.slice(0, count);
}

export async function markReminderAsShown(reminderId: string): Promise<void> {
  const { error } = await supabase
    .from('health_reminders')
    .update({ last_shown_at: toDbTimestamp(new Date()) })
    .eq('id', reminderId);
  if (error) console.warn('Failed to mark reminder as shown', error);
}
