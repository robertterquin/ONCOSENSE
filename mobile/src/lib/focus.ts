import type { User } from '@supabase/supabase-js';

// "What brings you here?" (redesign Phase 4). The focus decides whether Journey and
// the daily check-in reminder appear. Saved in user metadata `journey_focus`; guests
// keep it on the device (stores/focusStore.ts).

export const JOURNEY_FOCUSES = ['learning', 'treatment', 'finished', 'caring'] as const;

export type JourneyFocus = (typeof JOURNEY_FOCUSES)[number];

export const FOCUS_OPTIONS: { value: JourneyFocus; title: string; description: string }[] = [
  {
    value: 'learning',
    title: 'Learning and checking myself',
    description: 'Early signs, self-checks and ways to lower my risk',
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
  {
    value: 'caring',
    title: 'Caring for someone',
    description: "Track how they're doing and their appointments",
  },
];

export function isJourneyFocusValue(value: unknown): value is JourneyFocus {
  return typeof value === 'string' && (JOURNEY_FOCUSES as readonly string[]).includes(value);
}

/** Treatment, Finished and Caring use Journey; Learning doesn't. */
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
    case 'caring':
      return startDate ? `Caring for someone since ${monthYear(startDate)}` : 'Caring for someone';
    default:
      return 'How you feel, treatments and appointments';
  }
}

/** Copy that speaks to a caregiver about the person they care for. */
export function forFocus(focus: JourneyFocus | null, self: string, caregiver: string): string {
  return focus === 'caring' ? caregiver : self;
}
