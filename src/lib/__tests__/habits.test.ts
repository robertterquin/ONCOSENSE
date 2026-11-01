import { HABITS, MAX_TRACKED } from '@/constants/habits';

import { habitPlan, habitWeek } from '../habits';

jest.mock('@/lib/haptics', () => ({ haptics: {} }));

const titles = (list: { title: string }[]) => list.map((habit) => habit.title);

describe('habitPlan', () => {
  it('tracks three prevention habits by default, without smoke-free for non-smokers', () => {
    const plan = habitPlan(HABITS, { inTreatment: false, smoker: null, chosen: null });
    expect(plan.tracked).toHaveLength(MAX_TRACKED);
    expect(titles(plan.options)).not.toContain('Smoke-free day');
    expect(titles(plan.once)).toContain('HPV vaccine');
    expect(plan.tracked.every((habit) => habit.kind === 'daily')).toBe(true);
  });

  it('puts smoke-free first for smokers', () => {
    const plan = habitPlan(HABITS, { inTreatment: false, smoker: 'yes', chosen: null });
    expect(plan.tracked[0].title).toBe('Smoke-free day');
  });

  it('keeps picks, and ignores ones that no longer apply', () => {
    const smokeFree = HABITS.find((habit) => habit.smokersOnly)!.id;
    const sun = HABITS.find((habit) => habit.title === 'Sun-safe outside')!.id;
    const plan = habitPlan(HABITS, { inTreatment: false, smoker: 'no', chosen: [sun, smokeFree] });
    expect(titles(plan.tracked)).toEqual(['Sun-safe outside']);
  });

  it('shows treatment habits, no once-only list, while in treatment', () => {
    const plan = habitPlan(HABITS, { inTreatment: true, smoker: 'yes', chosen: null });
    expect(titles(plan.tracked)).toEqual(['Gentle movement', 'Eat something you enjoy']);
    expect(plan.once).toEqual([]);
    expect(plan.wellbeing.length).toBeGreaterThan(0);
  });
});

describe('habitWeek', () => {
  it('marks a day done only when every tracked habit was done', () => {
    const week = habitWeek(
      { '2026-10-30': ['a', 'b'], '2026-10-31': ['a'] },
      ['a', 'b'],
      new Date(2026, 9, 31),
    );
    expect(week).toHaveLength(7);
    expect(week[5]).toMatchObject({ key: '2026-10-30', done: true });
    expect(week[6]).toMatchObject({ key: '2026-10-31', done: false, isToday: true });
  });
});
