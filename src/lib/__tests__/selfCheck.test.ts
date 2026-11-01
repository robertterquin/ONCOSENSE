import { toDbTimestamp } from '@/lib/dates';
import {
  addMonths,
  chosenGuides,
  dueLabel,
  isDue,
  nextDue,
  selfCheckReminderDate,
  type SelfCheckState,
} from '@/lib/selfCheck';
import { checkItems } from '@/lib/checks';
import { remindersForType } from '@/lib/notifications/reminders';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

const guide = (id: string, cancerType: string, frequency = 'Monthly'): SelfCheckGuide => ({
  id,
  title: `${cancerType} self-check`,
  description: '',
  cancerType,
  frequency,
  ageRecommendation: null,
  steps: [],
  warningSigns: null,
  whenToSeeDoctor: '',
  sourceName: '',
  sourceUrl: '',
  dateVerified: null,
  displayOrder: 0,
  isActive: true,
});

const breast = guide('breast', 'Breast');
const skin = guide('skin', 'Skin');
const oral = guide('oral', 'Oral');
const testicular = guide('testicular', 'Testicular');
const colorectal = guide('colorectal', 'Colorectal', 'Weekly');
const all = [breast, skin, oral, testicular, colorectal];

const now = new Date(2026, 9, 24, 14, 30); // Saturday, October 24, 2:30 PM
const state = (lastDone: Record<string, Date> = {}, snoozedUntil: Date | null = null) =>
  ({
    lastDone: Object.fromEntries(
      Object.entries(lastDone).map(([id, date]) => [id, toDbTimestamp(date)]),
    ),
    snoozedUntil: snoozedUntil && toDbTimestamp(snoozedUntil),
  }) satisfies SelfCheckState;

describe('nextDue', () => {
  it('is today when a guide was never done', () => {
    expect(nextDue(breast, null, now)).toEqual(new Date(2026, 9, 24));
    expect(isDue(breast, null, now)).toBe(true);
  });

  it('is a month later for monthly guides and a week later for weekly ones', () => {
    const done = new Date(2026, 9, 10, 20, 15);
    expect(nextDue(breast, done, now)).toEqual(new Date(2026, 10, 10));
    expect(nextDue(colorectal, done, now)).toEqual(new Date(2026, 9, 17));
    expect(isDue(breast, done, now)).toBe(false);
    expect(isDue(colorectal, done, now)).toBe(true);
  });

  it('keeps month ends inside the next month', () => {
    expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
    expect(addMonths(new Date(2026, 11, 15), 1)).toEqual(new Date(2027, 0, 15));
  });
});

describe('dueLabel', () => {
  it('says when a check is due', () => {
    expect(dueLabel(new Date(2026, 9, 20), now)).toBe('Due today');
    expect(dueLabel(new Date(2026, 9, 24), now)).toBe('Due today');
    expect(dueLabel(new Date(2026, 9, 25), now)).toBe('Due tomorrow');
    expect(dueLabel(new Date(2026, 9, 28), now)).toBe('Due in 4 days');
    expect(dueLabel(new Date(2026, 10, 24), now)).toBe('Next: November 24');
  });
});

describe('chosenGuides', () => {
  it('picks the guides for followed cancers, in their order', () => {
    expect(chosenGuides(all, ['breast', 'skin', 'oral']).map((g) => g.id)).toEqual([
      'breast',
      'skin',
      'oral',
    ]);
    expect(chosenGuides(all, ['oral', 'colorectal']).map((g) => g.id)).toEqual([
      'oral',
      'colorectal',
    ]);
  });
});

describe('self-check reminder', () => {
  it('fires at 9 AM on the due day, or tomorrow when that has passed', () => {
    expect(selfCheckReminderDate(new Date(2026, 10, 10), null, now)).toEqual(
      new Date(2026, 10, 10, 9),
    );
    expect(selfCheckReminderDate(new Date(2026, 9, 24), null, now)).toEqual(
      new Date(2026, 9, 25, 9),
    );
    expect(selfCheckReminderDate(new Date(2026, 9, 1), new Date(2026, 9, 27), now)).toEqual(
      new Date(2026, 9, 27, 9),
    );
  });

  it('names the guide on its due day, and keeps the monthly fallback before guides load', () => {
    const [next] = remindersForType('self_check', {
      selfCheckPlan: { guideTitle: 'Monthly body check', date: new Date(2026, 10, 10, 9) },
    });
    expect(next.identifier).toBe('self-check-next');
    expect(next.body).toBe('Your monthly body check is due today.');
    expect(
      remindersForType('self_check', {
        selfCheckPlan: { guideTitle: 'HPV test', date: new Date(2026, 10, 10, 9) },
      })[0].body,
    ).toBe('Your HPV test is due today.');
    expect(next.trigger).toEqual({ kind: 'date', date: new Date(2026, 10, 10, 9) });
    expect(remindersForType('self_check')[0].trigger).toMatchObject({ kind: 'monthly' });
  });
});

describe('checkItems', () => {
  // The colorectal fixture above is a guide; real colorectal has a test, not a self-check.
  const items = (followed: string[], lastDone: Record<string, Date> = {}, age = 50) =>
    checkItems({
      guides: chosenGuides(all, followed).filter((item) => item !== colorectal),
      followed,
      age,
      answers: {},
      state: state(lastDone),
      now,
    });

  it('bundles the self-checks into one body check, due when any of them is', () => {
    const [body] = items(['breast', 'skin'], { breast: new Date(2026, 9, 1) }, 30);
    expect(body).toMatchObject({
      kind: 'body',
      title: 'Monthly body check',
      detail: 'Breast, Skin',
      isDue: true,
    });
  });

  it('keeps each test, puts signs in one check, and sorts soonest first', () => {
    const list = items(['ovarian', 'colorectal', 'thyroid'], {
      'screening:stool': new Date(2026, 4, 1),
    });
    expect(list.map((item) => [item.kind, item.title, item.detail])).toEqual([
      ['signs', 'Signs check', 'Ovarian, Thyroid'],
      ['test', 'Stool test', 'Every year (colonoscopy: every 10 years)'],
    ]);
    expect(list[0].isDue).toBe(true);
    expect(list[1]).toMatchObject({ isDue: false, due: new Date(2027, 4, 1) });
  });

  it('keeps a noted change on the bundle', () => {
    const [signs] = checkItems({
      guides: [],
      followed: ['ovarian'],
      age: 30,
      answers: {},
      state: {
        lastDone: { 'signs:ovarian': toDbTimestamp(new Date(2026, 9, 20)) },
        history: {
          'signs:ovarian': [{ date: toDbTimestamp(new Date(2026, 9, 20)), changed: true }],
        },
        snoozedUntil: null,
      },
      now,
    });
    expect(signs.changeNoted).toEqual(new Date(2026, 9, 20));
    expect(signs.isDue).toBe(false);
  });
});
