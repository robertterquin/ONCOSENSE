import { supabase } from '@/lib/supabase';

import { check, currentUserId } from './errors';
import { isMissingTable } from './journey';

export type HabitCompletionRow = {
  habit_id: string;
  completed_date: string; // YYYY-MM-DD
};

export type HabitBookmarkRow = {
  habit_id: string;
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

/** Fetch all habit bookmarks for the signed-in user. */
export async function fetchHabitBookmarks(): Promise<string[] | null> {
  const userId = await currentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('habit_bookmarks')
    .select('habit_id')
    .eq('user_id', userId);

  if (isMissingTable(error)) return null;
  check(error, 'Failed to load habit bookmarks');
  return (data ?? []).map((row) => row.habit_id);
}

/** Insert habit bookmark. */
export async function insertHabitBookmark(habitId: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('habit_bookmarks')
    .upsert({ user_id: userId, habit_id: habitId }, { onConflict: 'user_id,habit_id' });

  if (isMissingTable(error)) return;
  check(error, 'Failed to save habit bookmark');
}

/** Delete habit bookmark. */
export async function deleteHabitBookmark(habitId: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('habit_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('habit_id', habitId);

  if (isMissingTable(error)) return;
  check(error, 'Failed to remove habit bookmark');
}
