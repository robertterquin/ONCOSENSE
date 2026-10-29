import type { SelfCheckGuide } from '@/types/selfCheckGuide';

import { addDays, differenceInWholeDays, parseDbTimestamp } from './dates';

// Self-check tracking (redesign Phase 3): when each guide is next due, which guides a
// person sees first, and what Today's next-step panel shows. Pure, so it is unit tested;
// the saved dates live in stores/selfCheckStore.ts.

type Frequency = Pick<SelfCheckGuide, 'frequency'>;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Same day next month, or the month's last day (Jan 31 → Feb 28). */
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

/** The day a guide is next due: today if never done, else one week or month after. */
export function nextDue(guide: Frequency, lastDone: Date | null, now: Date = new Date()): Date {
  if (!lastDone) return startOfDay(now);
  const done = startOfDay(lastDone);
  return /weekly/i.test(guide.frequency) ? addDays(done, 7) : addMonths(done, 1);
}

export function isDue(guide: Frequency, lastDone: Date | null, now: Date = new Date()): boolean {
  return nextDue(guide, lastDone, now).getTime() <= startOfDay(now).getTime();
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

/** "November 24" */
export function formatMonthDay(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** "November" */
export function formatMonth(date: Date): string {
  return MONTHS[date.getMonth()];
}

/** "Tuesday, November 25" */
export function formatWeekdayDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${formatMonthDay(date)}`;
}

/** "Due today", "Due tomorrow", "Due in 3 days", "Next: November 24". */
export function dueLabel(due: Date, now: Date = new Date()): string {
  const days = differenceInWholeDays(startOfDay(due), startOfDay(now));
  if (days <= 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 7) return `Due in ${days} days`;
  return `Next: ${formatMonthDay(due)}`;
}

/**
 * One check's line on Today's checks card: "Done November 3" when up to date, else how
 * long it has waited ("Not done yet", "Due today", "Waiting since Monday").
 */
export function checkStatusLabel(lastDone: Date | null, due: Date, now: Date = new Date()): string {
  const today = startOfDay(now);
  if (lastDone && due.getTime() > today.getTime()) return `Done ${formatMonthDay(lastDone)}`;
  if (!lastDone) return 'Not done yet';
  const waited = differenceInWholeDays(today, startOfDay(due));
  if (waited <= 0) return 'Due today';
  if (waited === 1) return 'Waiting since yesterday';
  if (waited < 7) return `Waiting since ${WEEKDAYS[due.getDay()]}`;
  return `Waiting since ${formatMonthDay(due)}`;
}

/** Guides shown first for a profile's gender (`cancer_type` values). Editable in Phase 6. */
function defaultGuideTypes(gender: string | null): string[] {
  if (gender === 'Female') return ['Breast', 'Skin', 'Oral'];
  if (gender === 'Male') return ['Testicular', 'Skin', 'Oral'];
  return ['Skin', 'Oral'];
}

/** The person's guides: their own choice if they made one, else the defaults, in order. */
export function chosenGuides<T extends Pick<SelfCheckGuide, 'id' | 'cancerType'>>(
  guides: T[],
  chosenIds: string[] | null,
  gender: string | null,
): T[] {
  if (chosenIds) return guides.filter((guide) => chosenIds.includes(guide.id));
  const types = defaultGuideTypes(gender);
  return guides
    .filter((guide) => types.includes(guide.cancerType))
    .sort((a, b) => types.indexOf(a.cancerType) - types.indexOf(b.cancerType));
}

export type SelfCheckState = {
  /** When each guide was last marked done (local time, `toDbTimestamp`), by guide ID. */
  lastDone: Record<string, string>;
  /** Start of the day the next-step panel can show a self-check again (`toDbTimestamp`). */
  snoozedUntil: string | null;
};

export function lastDoneDate(state: SelfCheckState, guideId: string): Date | null {
  const value = state.lastDone[guideId];
  return value ? parseDbTimestamp(value) : null;
}

export function isSnoozed(state: SelfCheckState, now: Date = new Date()): boolean {
  return (
    state.snoozedUntil !== null && now.getTime() < parseDbTimestamp(state.snoozedUntil).getTime()
  );
}

/** The chosen guide that is due soonest (ties keep the chosen order). */
export function soonestGuide<T extends SelfCheckGuide>(
  guides: T[],
  state: SelfCheckState,
  now: Date = new Date(),
): { guide: T; due: Date } | null {
  let soonest: { guide: T; due: Date } | null = null;
  for (const guide of guides) {
    const due = nextDue(guide, lastDoneDate(state, guide.id), now);
    if (!soonest || due.getTime() < soonest.due.getTime()) soonest = { guide, due };
  }
  return soonest;
}

type NextStep<T> = { kind: 'self-check'; guide: T; due: Date } | { kind: 'learn' };

/**
 * Today's one next step: a due self-check that isn't snoozed, else learning the early
 * signs. (Phase 4 adds an appointment in the next 24 hours between the two.)
 */
export function chooseNextStep<T extends SelfCheckGuide>(
  guides: T[],
  state: SelfCheckState,
  now: Date = new Date(),
): NextStep<T> {
  const soonest = soonestGuide(guides, state, now);
  if (soonest && isDue(soonest.guide, lastDoneDate(state, soonest.guide.id), now)) {
    if (!isSnoozed(state, now)) return { kind: 'self-check', ...soonest };
  }
  return { kind: 'learn' };
}

/** When the self-check reminder should fire: the soonest due day (or the snooze), at the chosen time (9 AM by default), never in the past. */
export function selfCheckReminderDate(
  due: Date,
  snoozedUntil: Date | null,
  now: Date = new Date(),
  time: { hour: number; minute: number } = { hour: 9, minute: 0 },
): Date {
  let day = startOfDay(due);
  if (snoozedUntil && snoozedUntil.getTime() > day.getTime()) day = startOfDay(snoozedUntil);
  const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.hour, time.minute);
  if (at.getTime() > now.getTime()) return at;
  const tomorrow = addDays(startOfDay(now), 1);
  return new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate(),
    time.hour,
    time.minute,
  );
}
