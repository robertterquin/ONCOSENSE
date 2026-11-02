import { supabase } from '@/lib/supabase';

import { check, currentUserId } from './errors';
import { isMissingTable } from './journey';

export type HabitCompletionRow = {
  habit_id: string;
  completed_date: string; // YYYY-MM-DD
};

/** Fetch all habit completions for the signed-in user. */
export async function fetchHabitCompletions(): Promise<HabitCompletionRow[] | null> {
  const userId = await currentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('habit_completions')
    .select('habit_id, completed_date')
    .eq('user_id', userId);

  if (isMissingTable(error)) return null;
  check(error, 'Failed to load habit completions');
  return data ?? [];
}

/** Insert completed habit for date. */
export async function insertHabitCompletion(habitId: string, completedDate: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('habit_completions')
    .upsert(
      { user_id: userId, habit_id: habitId, completed_date: completedDate },
      { onConflict: 'user_id,habit_id,completed_date' },
    );

  if (isMissingTable(error)) return;
  check(error, 'Failed to save habit completion');
}

/** Delete completed habit for date. */
export async function deleteHabitCompletion(habitId: string, completedDate: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('habit_completions')
    .delete()
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .eq('completed_date', completedDate);

  if (isMissingTable(error)) return;
  check(error, 'Failed to remove habit completion');
}
