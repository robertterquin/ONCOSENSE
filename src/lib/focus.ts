import type { User } from '@supabase/supabase-js';

// "What brings you here?" (redesign Phase 4): people with or without cancer, and for
// cancer, in treatment or finished. The focus decides whether Journey and the daily
// check-in reminder appear. Saved in user metadata `journey_focus`; guests keep it on
// the device (stores/focusStore.ts). Caregiver accounts ("caring") were retired in
// November 2026 and read as "learning".

const JOURNEY_FOCUSES = ['learning', 'treatment', 'finished'] as const;

export type JourneyFocus = (typeof JOURNEY_FOCUSES)[number];

export const FOCUS_OPTIONS: { value: JourneyFocus; title: string; description: string }[] = [
  {
    value: 'learning',
    title: "I don't have cancer",
    description: 'Early signs, checks and lowering my risk',
  },
  {
    value: 'treatment',
    title: 'Going through treatment',
    description: 'Track how I feel, my treatments and appointments',
  },
  {
    value: 'finished',
    title: 'Finished treatment',
    description: 'Keep an eye on how I feel and my follow-ups',
  },
];

function isJourneyFocusValue(value: unknown): value is JourneyFocus {
  return typeof value === 'string' && (JOURNEY_FOCUSES as readonly string[]).includes(value);
}

/** Treatment and Finished use Journey; Learning doesn't. */
export function usesJourney(focus: JourneyFocus | null): boolean {
  return focus !== null && focus !== 'learning';
}

/**
 * The saved focus, or one worked out for accounts from before the redesign: a started
 * journey with a cancer-free date is "Finished", any other started journey is
 * "Treatment". Null means the person hasn't chosen yet.
 */
export function focusFromMetadata(user: User | null): JourneyFocus | null {
  const metadata = user?.user_metadata;
  if (!metadata) return null;
  if (metadata.journey_focus === 'caring') return 'learning';
  if (isJourneyFocusValue(metadata.journey_focus)) return metadata.journey_focus;
  if (metadata.journey_started === true) {
    return typeof metadata.cancer_free_date === 'string' && metadata.cancer_free_date
      ? 'finished'
      : 'treatment';
  }
  return null;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const monthYear = (date: Date) => `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

/** Journey's subtitle: "In treatment since July 2026", "Treatment finished March 2025". */
export function focusSubtitle(
  focus: JourneyFocus | null,
  startDate: Date | null,
  cancerFreeDate: Date | null,
): string {
  switch (focus) {
    case 'treatment':
      return startDate ? `In treatment since ${monthYear(startDate)}` : 'Going through treatment';
    case 'finished':
      return cancerFreeDate
        ? `Treatment finished ${monthYear(cancerFreeDate)}`
        : 'Finished treatment';
    default:
      return 'How you feel, treatments and appointments';
  }
}

/** A caregiver account from before November 2026, not yet shown the retirement note. */
export function wasCaregiver(user: User | null): boolean {
  return user?.user_metadata?.journey_focus === 'caring';
}
