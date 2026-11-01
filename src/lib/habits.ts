import { MAX_TRACKED, type Habit } from '@/constants/habits';
import { toDayKey } from '@/stores/habitsStore';

export type Smoker = 'no' | 'yes';

export type HabitPlan = {
  /** Daily habits this person can choose from. */
  options: Habit[];
  /** The daily habits counted in the ring. */
  tracked: Habit[];
  once: Habit[];
  wellbeing: Habit[];
};

/**
 * Which habits someone sees. In treatment: the gentle treatment habits, all tracked.
 * Otherwise: the prevention habits they chose (smoke-free only for smokers, and first by
 * default for them), the once-only list and the wellbeing ones.
 */
export function habitPlan(
  habits: Habit[],
  {
    inTreatment,
    smoker,
    chosen,
  }: { inTreatment: boolean; smoker: Smoker | null; chosen: string[] | null },
): HabitPlan {
  const audience = inTreatment ? 'treatment' : 'prevention';
  const fits = (habit: Habit) => habit.audience === audience || habit.audience === 'all';
  const options = habits.filter(
    (habit) => habit.kind === 'daily' && fits(habit) && (!habit.smokersOnly || smoker === 'yes'),
  );
  const picked = options.filter((habit) => chosen?.includes(habit.id));
  const byDefault = [
    ...options.filter((habit) => habit.smokersOnly),
    ...options.filter((habit) => !habit.smokersOnly),
  ].slice(0, MAX_TRACKED);
  return {
    options,
    tracked: inTreatment ? options : picked.length ? picked : byDefault,
    once: habits.filter((habit) => habit.kind === 'once' && fits(habit)),
    wellbeing: habits.filter((habit) => habit.kind === 'wellbeing' && fits(habit)),
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
