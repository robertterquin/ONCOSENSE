import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

/** Error thrown by every `src/api` function, so screens never handle raw Supabase errors. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NotSignedInError extends ApiError {
  constructor(action: string) {
    super(`You need to be signed in to ${action}.`);
    this.name = 'NotSignedInError';
  }
}

/** Throws an `ApiError` with context when a Supabase call returned an error. */
export function check(error: { message: string } | null, context: string): void {
  if (error) {
    throw new ApiError(`${context}: ${error.message}`, error);
  }
}

/** The signed-in user from the locally stored session, or `null`. */
export async function currentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

export async function currentUserId(): Promise<string | null> {
  return (await currentUser())?.id ?? null;
}

export async function requireUser(action: string): Promise<User> {
  const user = await currentUser();
  if (!user) throw new NotSignedInError(action);
  return user;
}

export async function requireUserId(action: string): Promise<string> {
  return (await requireUser(action)).id;
}

/**
 * Quotes a value for a PostgREST `or()` filter so commas, dots or parentheses
 * typed into a search box can't break the filter.
 */
export function ilikeValue(text: string): string {
  const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"%${escaped}%"`;
}
