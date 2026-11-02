import { HABITS, MAX_TRACKED } from '@/constants/habits';
import { toDayKey } from '@/stores/habitsStore';

import { habitPlan, habitStreak, habitWeek } from '../habits';

jest.mock('@/lib/haptics', () => ({ haptics: {} }));

const titles = (list: { title: string }[]) => list.map((habit) => habit.title);

describe('habitPlan', () => {
  it('tracks three prevention habits by default, without smoke-free for non-smokers', () => {
    const plan = habitPlan(HABITS, { focus: 'learning', smoker: null, chosen: null });
    expect(plan.tracked).toHaveLength(MAX_TRACKED);
    expect(titles(plan.options)).not.toContain('Smoke-free day');
    expect(titles(plan.once)).toContain('HPV vaccine');
    expect(titles(plan.once)).not.toContain('Screening for your age');
    expect(plan.tracked.every((habit) => habit.kind === 'daily')).toBe(true);
  });

  it('offers the HPV vaccine only up to age 45', () => {
    const at45 = habitPlan(HABITS, { focus: 'learning', smoker: 'no', chosen: null, age: 45 });
    const at50 = habitPlan(HABITS, { focus: 'learning', smoker: 'no', chosen: null, age: 50 });
    expect(titles(at45.once)).toContain('HPV vaccine');
    expect(titles(at50.once)).not.toContain('HPV vaccine');
  });

  it('puts smoke-free first for smokers', () => {
    const plan = habitPlan(HABITS, { focus: 'learning', smoker: 'yes', chosen: null });
    expect(plan.tracked[0].title).toBe('Smoke-free day');
  });

  it('keeps picks, and ignores ones that no longer apply', () => {
    const smokeFree = HABITS.find((habit) => habit.smokersOnly)!.id;
    const sun = HABITS.find((habit) => habit.title === 'Sun-safe outside')!.id;
    const plan = habitPlan(HABITS, { focus: 'learning', smoker: 'no', chosen: [sun, smokeFree] });
    expect(titles(plan.tracked)).toEqual(['Sun-safe outside']);
  });

  it('shows treatment habits, smoke-free first for smokers, no once-only list', () => {
    const plan = habitPlan(HABITS, { focus: 'treatment', smoker: 'yes', chosen: null });
    expect(titles(plan.tracked)).toEqual([
      'Smoke-free day',
      'Gentle movement',
      'Eat something you enjoy',
    ]);
    expect(plan.reason(plan.tracked[0])).toMatchObject({ linked: true });
    expect(plan.once).toEqual([]);
    expect(plan.wellbeing.length).toBeGreaterThan(0);
  });

  it('ranks habits by the cancers someone follows, and says why', () => {
    const plan = habitPlan(HABITS, {
      focus: 'learning',
      smoker: 'no',
      chosen: null,
      followed: ['skin', 'liver'],
    });
    expect(titles(plan.tracked).slice(0, 2)).toEqual(['Alcohol-free day', 'Sun-safe outside']);
    expect(plan.reason(plan.tracked[1])).toEqual({ text: 'For skin cancer', linked: true });
    expect(plan.once[0].title).toBe('Hepatitis B vaccine');
  });

  it('after colorectal cancer, puts what may help first and leaves out prevention lines', () => {
    const plan = habitPlan(HABITS, {
      focus: 'finished',
      smoker: 'no',
      chosen: null,
      followed: ['colorectal'],
      myCancer: 'colorectal',
    });
    expect(titles(plan.tracked).slice(0, 2)).toEqual(['Eat plants', 'Move 30 minutes']);
    expect(plan.reason(plan.tracked[1])?.text).toMatch(/coming back/);
    const sun = plan.options.find((habit) => habit.title === 'Sun-safe outside')!;
    expect(plan.reason(sun)).toEqual({ text: 'Good for your overall health', linked: false });
  });

  it('gives recovery reasons and tailored details across all cancers and in treatment', () => {
    const thyroidSurvivor = habitPlan(HABITS, {
      focus: 'finished',
      smoker: 'no',
      chosen: null,
      myCancer: 'thyroid',
    });
    expect(titles(thyroidSurvivor.tracked).slice(0, 2)).toEqual(['Eat plants', 'Move 30 minutes']);
    expect(thyroidSurvivor.reason(thyroidSurvivor.tracked[0])).toEqual({
      text: 'Supports recovery and long-term health after treatment',
      linked: true,
    });
    expect(thyroidSurvivor.detail(thyroidSurvivor.tracked[1])).toMatch(/After treatment/);

    const inTreatment = habitPlan(HABITS, { focus: 'treatment', smoker: 'yes', chosen: null });
    const sleep = inTreatment.wellbeing.find((habit) => habit.title === 'Sleep 7 to 9 hours')!;
    expect(inTreatment.detail(sleep)).toMatch(/Steroids, pain or worry/);
    expect(inTreatment.detail(sleep)).not.toMatch(/cancer risk/);
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

describe('habitStreak', () => {
  const today = new Date(2026, 10, 1, 9);
  const key = (daysAgo: number) => {
    const day = new Date(today);
    day.setDate(day.getDate() - daysAgo);
    return toDayKey(day);
  };

  it('counts full days back from today, not breaking on an unfinished today', () => {
    const done = { [key(1)]: ['a', 'b'], [key(2)]: ['a', 'b'], [key(3)]: ['a'] };
    expect(habitStreak(done, ['a', 'b'], today)).toBe(2);
    expect(habitStreak({ ...done, [key(0)]: ['a', 'b'] }, ['a', 'b'], today)).toBe(3);
  });

  it('is zero with nothing tracked or nothing done', () => {
    expect(habitStreak({}, ['a'], today)).toBe(0);
    expect(habitStreak({ [key(0)]: ['a'] }, [], today)).toBe(0);
  });
});
