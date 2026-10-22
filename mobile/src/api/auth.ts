import type { User } from '@supabase/supabase-js';

import { parseDbTimestamp, toDbTimestamp } from '@/lib/dates';
import { supabase } from '@/lib/supabase';

import { ApiError } from './errors';

/** Auth errors are shown to the user as-is (e.g. "Invalid login credentials"), like Flutter. */
function throwIfAuthError(error: { message: string } | null): void {
  if (error) throw new ApiError(error.message, error);
}

// Port of the auth parts of lib/services/supabase_service.dart. "Remember me" lives
// in src/stores/authStore.ts.

/** Profile fields kept in Supabase user metadata (same keys as the Flutter app). */
export type ProfileMetadata = {
  name?: string;
  full_name?: string;
  age?: number | null;
  gender?: string | null;
  profile_picture_url?: string | null;
};

export async function signUp(email: string, password: string, metadata: ProfileMetadata) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  throwIfAuthError(error);
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  throwIfAuthError(error);
  return data;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  throwIfAuthError(error);
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  throwIfAuthError(error);
}

export async function updateProfile(metadata: Record<string, unknown>): Promise<User> {
  const { data, error } = await supabase.auth.updateUser({ data: metadata });
  throwIfAuthError(error);
  return data.user!;
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  throwIfAuthError(error);
}

/** Stores journey setup in user metadata so it follows the user across devices. */
export async function saveJourneySetupStatus(setup: {
  journeyStarted: boolean;
  diagnosisDate?: Date | null;
  cancerFreeDate?: Date | null;
}): Promise<void> {
  await updateProfile({
    journey_started: setup.journeyStarted,
    ...(setup.diagnosisDate && { diagnosis_date: toDbTimestamp(setup.diagnosisDate) }),
    ...(setup.cancerFreeDate && { cancer_free_date: toDbTimestamp(setup.cancerFreeDate) }),
  });
}

// ---- Reading user metadata ----

function metadataString(user: User | null, key: string): string | null {
  const value = user?.user_metadata?.[key];
  return typeof value === 'string' && value ? value : null;
}

function metadataDate(user: User | null, key: string): Date | null {
  const value = metadataString(user, key);
  if (!value) return null;
  try {
    return parseDbTimestamp(value);
  } catch {
    return null;
  }
}

export function userDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return metadataString(user, 'full_name') ?? user.email?.split('@')[0] ?? 'User';
}

/** Name used when posting to the forum (`full_name`, then `name`). */
export function userForumName(user: User | null): string | null {
  return metadataString(user, 'full_name') ?? metadataString(user, 'name');
}

export function userProfilePictureUrl(user: User | null): string | null {
  return metadataString(user, 'profile_picture_url');
}

export function hasCompletedJourneySetup(user: User | null): boolean {
  return user?.user_metadata?.journey_started === true;
}

export function diagnosisDateFromMetadata(user: User | null): Date | null {
  return metadataDate(user, 'diagnosis_date');
}

export function cancerFreeDateFromMetadata(user: User | null): Date | null {
  return metadataDate(user, 'cancer_free_date');
}
