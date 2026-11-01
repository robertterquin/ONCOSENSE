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

/**
 * Guides shown first for a profile (`cancer_type` values), by sex and age (design refresh
 * Phase 22): breast from 20, testicular from 15 to 40 (most cases are 15 to 35), skin and
 * oral for adults. With no age, every adult check for that sex. Without a sex, only the
 * checks that suit everyone; the person can turn on others in Your checks.
 */
function defaultGuideTypes(gender: string | null, age: number | null): string[] {
  const between = (from: number, to = Infinity) => age === null || (age >= from && age <= to);
  return [
    ...(gender === 'Female' && between(20) ? ['Breast'] : []),
    ...(gender === 'Male' && between(15, 40) ? ['Testicular'] : []),
    ...(between(18) ? ['Skin', 'Oral'] : []),
  ];
}

/** The person's guides: their own choice if they made one, else the defaults, in order. */
export function chosenGuides<T extends Pick<SelfCheckGuide, 'id' | 'cancerType'>>(
  guides: T[],
  chosenIds: string[] | null,
  gender: string | null,
  age: number | null = null,
): T[] {
  if (chosenIds) return guides.filter((guide) => chosenIds.includes(guide.id));
  const types = defaultGuideTypes(gender, age);
  return guides
    .filter((guide) => types.includes(guide.cancerType))
    .sort((a, b) => types.indexOf(a.cancerType) - types.indexOf(b.cancerType));
}

/** One finished self-check: when (local time, `toDbTimestamp`) and whether a change was noted. */
export type CheckEntry = { date: string; changed: boolean };

/** How many entries each guide keeps (two years of monthly checks). */
export const HISTORY_LIMIT = 24;

export type SelfCheckState = {
  /** When each guide was last marked done (local time, `toDbTimestamp`), by guide ID. */
  lastDone: Record<string, string>;
  /** Each guide's finished checks, newest first (design refresh Phase 22). */
  history?: Record<string, CheckEntry[]>;
  /** Start of the day the next-step panel can show a self-check again (`toDbTimestamp`). */
  snoozedUntil: string | null;
};

export function lastDoneDate(state: SelfCheckState, guideId: string): Date | null {
  const value = state.lastDone[guideId];
  return value ? parseDbTimestamp(value) : null;
}

/** A guide's finished checks, newest first; a date from before the history counts as one. */
export function historyFor(state: SelfCheckState, guideId: string): CheckEntry[] {
  const entries = state.history?.[guideId];
  if (entries?.length) return entries;
  const last = state.lastDone[guideId];
  return last ? [{ date: last, changed: false }] : [];
}

/** Two lists of entries as one: each date once, newest first, at most `HISTORY_LIMIT`. */
export function mergeHistory(a: CheckEntry[], b: CheckEntry[]): CheckEntry[] {
  const byDate = new Map<string, CheckEntry>();
  for (const entry of [...a, ...b]) {
    const time = String(parseDbTimestamp(entry.date).getTime());
    const known = byDate.get(time);
    byDate.set(time, known ? { ...known, changed: known.changed || entry.changed } : entry);
  }
  return [...byDate.values()]
    .sort((x, y) => parseDbTimestamp(y.date).getTime() - parseDbTimestamp(x.date).getTime())
    .slice(0, HISTORY_LIMIT);
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
