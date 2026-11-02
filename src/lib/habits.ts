import { MAX_TRACKED, type Habit } from '@/constants/habits';
import type { JourneyFocus } from '@/lib/focus';
import type { CancerKey } from '@/lib/screening';
import { toDayKey } from '@/stores/habitsStore';

export type Smoker = 'no' | 'yes';

export type HabitReason = {
  text: string;
  /** Tied to a cancer the person follows or had, rather than general health. */
  linked: boolean;
};

export type HabitPlan = {
  /** Daily habits this person can choose from, most relevant first. */
  options: Habit[];
  /** The daily habits counted in the ring. */
  tracked: Habit[];
  once: Habit[];
  wellbeing: Habit[];
  /** Why a habit is shown to this person; null shows its usual description. */
  reason: (habit: Habit) => HabitReason | null;
  /** The detailed explanation for this person's situation (treatment, recovery or prevention). */
  detail: (habit: Habit) => string | null;
};

/** "liver cancer", but "leukemia". */
const cancerLabel = (key: CancerKey) =>
  key === 'leukemia' || key === 'lymphoma' ? key : `${key} cancer`;

/**
 * Which habits someone sees, and why. For someone with or after cancer (`treatment` or
 * `finished`), habits and reasons are tailored strictly to their own cancer (`myCancer`).
 * For everyone else (`learning`), habits are ranked by the cancers they follow. Picks
 * always win over the ranking.
 */
export function habitPlan(
  habits: Habit[],
  {
    focus,
    smoker,
    chosen,
    followed = [],
    myCancer = null,
    age = null,
  }: {
    focus: JourneyFocus | null;
    smoker: Smoker | null;
    chosen: string[] | null;
    followed?: CancerKey[];
    /** The cancer the person has (`treatment`) or finished treatment for (`finished`). */
    myCancer?: CancerKey | null;
    age?: number | null;
  },
): HabitPlan {
  const inTreatment = focus === 'treatment';
  const finished = focus === 'finished';
  const hasCancer = inTreatment || finished;
  const patient = inTreatment && myCancer ? myCancer : null;
  const survivor = finished && myCancer ? myCancer : null;
  const audience = inTreatment ? 'treatment' : 'prevention';
  const fits = (habit: Habit) =>
    (habit.audience === audience ||
      habit.audience === 'all' ||
      Boolean(patient && habit.duringCancer?.[patient])) &&
    (habit.maxAge === undefined || age === null || age <= habit.maxAge);
  // Only non-cancer users match against `followed`; cancer patients focus on `myCancer`.
  const matches = (habit: Habit) =>
    hasCancer ? [] : (habit.lowers ?? []).filter((key) => followed.includes(key));
  const onceMatch = (habit: Habit) =>
    survivor && habit.kind === 'once' && habit.lowers?.includes(survivor) ? 1 : 0;
  const score = (habit: Habit) =>
    (habit.smokersOnly ? 100 : 0) +
    (patient && habit.duringCancer?.[patient] ? 10 : inTreatment && habit.duringAnyCancer ? 5 : 0) +
    (survivor && habit.afterCancer?.[survivor] ? 10 : finished && habit.afterAnyCancer ? 5 : 0) +
    onceMatch(habit) +
    matches(habit).length;
  // Array sort is stable, so equal scores keep the catalog order.
  const ranked = (list: Habit[]) => [...list].sort((a, b) => score(b) - score(a));

  const options = ranked(
    habits.filter(
      (habit) => habit.kind === 'daily' && fits(habit) && (!habit.smokersOnly || smoker === 'yes'),
    ),
  );
  const picked = options.filter((habit) => chosen?.includes(habit.id));
  const matched = options.filter((habit) => score(habit) > 0);
  // Smoke-free always scores; with nothing else matched, fall back to the general habits.
  const autoTracked = matched.some((habit) => !habit.smokersOnly) ? matched : options;

  const reason = (habit: Habit): HabitReason | null => {
    if (habit.smokersOnly && inTreatment) {
      return { text: 'Helps treatment work and lowers side effects', linked: true };
    }
    if (habit.smokersOnly && finished) {
      return { text: 'Quitting after cancer helps you live longer', linked: true };
    }
    if (inTreatment) {
      const during = patient ? habit.duringCancer?.[patient] : habit.duringAnyCancer;
      return during ? { text: during, linked: Boolean(patient) } : null;
    }
    const after = survivor ? habit.afterCancer?.[survivor] : undefined;
    if (after) return { text: after, linked: true };
    if (finished && habit.afterAnyCancer) {
      return { text: habit.afterAnyCancer, linked: true };
    }
    if (finished && onceMatch(habit)) {
      return { text: `Recommended after ${cancerLabel(survivor!)}`, linked: true };
    }
    const keys = matches(habit);
    if (keys.length) {
      const names = keys.slice(0, 2).map(cancerLabel).join(' and ');
      return { text: `For ${names}${keys.length > 2 ? ' and others' : ''}`, linked: true };
    }
    if (finished && habit.kind === 'daily') {
      return { text: 'Good for your overall health', linked: false };
    }
    return null;
  };

  const detail = (habit: Habit): string | null => {
    if (inTreatment && habit.treatmentDetail) return habit.treatmentDetail;
    if (finished && habit.survivorDetail) return habit.survivorDetail;
    return habit.detailedInfo;
  };

  return {
    options,
    // In treatment there's nothing to pick, so every treatment habit is tracked (at most 4).
    tracked: inTreatment ? options : picked.length ? picked : autoTracked.slice(0, MAX_TRACKED),
    once: ranked(habits.filter((habit) => habit.kind === 'once' && fits(habit))),
    wellbeing: habits.filter((habit) => habit.kind === 'wellbeing' && fits(habit)),
    reason,
    detail,
  };
}

/** The last seven days, oldest first; a day counts when every tracked habit was done. */
export function habitWeek(
  completedByDate: Record<string, string[]>,
  trackedIds: string[],
  today: Date = new Date(),
): { key: string; label: string; done: boolean; isToday: boolean }[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    const key = toDayKey(day);
    const done = completedByDate[key] ?? [];
    return {
      key,
      label: day.toLocaleDateString('en-US', { weekday: 'narrow' }),
      done: trackedIds.length > 0 && trackedIds.every((id) => done.includes(id)),
      isToday: index === 6,
    };
  });
}

/**
 * Days in a row, ending today, on which every tracked habit was done. An unfinished
 * today doesn't break the streak; it just isn't counted yet.
 */
export function habitStreak(
  completedByDate: Record<string, string[]>,
  trackedIds: string[],
  today: Date = new Date(),
): number {
  if (!trackedIds.length) return 0;
  const complete = (day: Date) => {
    const done = completedByDate[toDayKey(day)] ?? [];
    return trackedIds.every((id) => done.includes(id));
  };
  const day = new Date(today);
  if (!complete(day)) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (complete(day)) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}
