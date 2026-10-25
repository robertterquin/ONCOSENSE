import { supabase } from '@/lib/supabase';

import { check, currentUserId } from './errors';
import { isMissingTable } from './journey';

// Self-check history and saved guides for the signed-in account (migration
// 20261025000000). Kept in step with the phone by src/lib/selfCheckSync.ts.

export type SelfCheckRow = {
  guide_id: string;
  /** Local wall-clock time, `toDbTimestamp` (read back with an offset to ignore). */
  last_done: string | null;
  saved: boolean;
};

/** The account's rows; `null` when signed out or before the table exists. */
export async function fetchSelfCheckProgress(): Promise<SelfCheckRow[] | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  const { data, error } = await supabase
    .from('self_check_progress')
    .select('guide_id,last_done,saved')
    .eq('user_id', userId);
  if (isMissingTable(error)) return null;
  check(error, 'Failed to load self-checks');
  return data;
}

export async function saveSelfCheckProgress(rows: SelfCheckRow[]): Promise<void> {
  const userId = await currentUserId();
  if (!userId || !rows.length) return;
  const updatedAt = new Date().toISOString();
  const { error } = await supabase
    .from('self_check_progress')
    .upsert(rows.map((row) => ({ ...row, user_id: userId, updated_at: updatedAt })));
  if (isMissingTable(error)) return;
  check(error, 'Failed to save self-checks');
}
