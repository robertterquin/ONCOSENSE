import { supabase } from '@/lib/supabase';
import { journeyEntryFromRow, journeyEntryToRow, type JourneyEntry } from '@/types/journeyEntry';
import { milestoneFromRow, milestoneToRow, type Milestone } from '@/types/milestone';
import { treatmentFromRow, treatmentToRow, type Treatment } from '@/types/treatment';

import { check, currentUserId, requireUserId } from './errors';

// Port of the Supabase parts of lib/services/journey_service.dart. Supabase is the
// source of truth; journey setup (diagnosis and cancer-free dates) is in user
// metadata — see saveJourneySetupStatus in ./auth.ts. Calculations live in
// src/lib/journey.ts.
//
// Differences from Flutter: each save writes only the changed row (Flutter re-saved
// every row), and deletes remove the row from Supabase (Flutter only removed it from
// the device, so deleted items came back on the next load).

/** Ids are the creation time in milliseconds, plus an optional suffix (same format as Flutter). */
export function newJourneyId(suffix?: string): string {
  const id = String(Date.now());
  return suffix ? `${id}_${suffix}` : id;
}

// ---- Entries ----

export async function fetchJourneyEntries(): Promise<JourneyEntry[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('journey_entries')
    .select()
    .eq('user_id', userId)
    .order('date', { ascending: false });
  check(error, 'Failed to load journal entries');
  return (data ?? []).map(journeyEntryFromRow);
}

/** Inserts a new entry or updates an existing one with the same id. */
export async function saveJourneyEntry(entry: JourneyEntry): Promise<void> {
  const userId = await requireUserId('save journal entries');
  const { error } = await supabase
    .from('journey_entries')
    .upsert({ ...journeyEntryToRow(entry), user_id: userId });
  check(error, 'Failed to save journal entry');
}

export async function deleteJourneyEntry(entryId: string): Promise<void> {
  const userId = await requireUserId('delete journal entries');
  const { error } = await supabase
    .from('journey_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);
  check(error, 'Failed to delete journal entry');
}

// ---- Treatments ----

export async function fetchTreatments(): Promise<Treatment[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data, error } = await supabase.from('journey_treatments').select().eq('user_id', userId);
  check(error, 'Failed to load treatments');
  return (data ?? []).map(treatmentFromRow);
}

export async function saveTreatment(treatment: Treatment): Promise<void> {
  const userId = await requireUserId('save treatments');
  const { error } = await supabase
    .from('journey_treatments')
    .upsert({ ...treatmentToRow(treatment), user_id: userId });
  check(error, 'Failed to save treatment');
}

export async function deleteTreatment(treatmentId: string): Promise<void> {
  const userId = await requireUserId('delete treatments');
  const { error } = await supabase
    .from('journey_treatments')
    .delete()
    .eq('id', treatmentId)
    .eq('user_id', userId);
  check(error, 'Failed to delete treatment');
}

// ---- Milestones ----

export async function fetchMilestones(): Promise<Milestone[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('journey_milestones')
    .select()
    .eq('user_id', userId)
    .order('date_achieved', { ascending: false });
  check(error, 'Failed to load milestones');
  return (data ?? []).map(milestoneFromRow);
}

export async function saveMilestone(milestone: Milestone): Promise<void> {
  const userId = await requireUserId('save milestones');
  const { error } = await supabase
    .from('journey_milestones')
    .upsert({ ...milestoneToRow(milestone), user_id: userId });
  check(error, 'Failed to save milestone');
}

export async function deleteMilestone(milestoneId: string): Promise<void> {
  const userId = await requireUserId('delete milestones');
  const { error } = await supabase
    .from('journey_milestones')
    .delete()
    .eq('id', milestoneId)
    .eq('user_id', userId);
  check(error, 'Failed to delete milestone');
}
