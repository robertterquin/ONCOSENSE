import { toDbTimestamp } from '@/lib/dates';
import {
  addMonths,
  checkStatusLabel,
  formatWeekdayDate,
  chooseNextStep,
  chosenGuides,
  dueLabel,
  isDue,
  nextDue,
  selfCheckReminderDate,
  type SelfCheckState,
} from '@/lib/selfCheck';
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
  it('defaults by gender, in order', () => {
    expect(chosenGuides(all, null, 'Female').map((g) => g.id)).toEqual(['breast', 'skin', 'oral']);
    expect(chosenGuides(all, null, 'Male').map((g) => g.id)).toEqual([
      'testicular',
      'skin',
      'oral',
    ]);
    expect(chosenGuides(all, null, null).map((g) => g.id)).toEqual(['skin', 'oral']);
  });

  it("uses the person's own choice when they made one", () => {
    expect(chosenGuides(all, ['colorectal'], 'Female').map((g) => g.id)).toEqual(['colorectal']);
  });
});

describe('chooseNextStep', () => {
  it('shows the soonest due self-check', () => {
    const step = chooseNextStep([breast, skin], state({ breast: new Date(2026, 8, 1) }), now);
    expect(step).toMatchObject({ kind: 'self-check', guide: { id: 'breast' } });
  });

  it('falls back to learning when nothing is due', () => {
    const done = new Date(2026, 9, 20);
    expect(chooseNextStep([breast, skin], state({ breast: done, skin: done }), now)).toEqual({
      kind: 'learn',
    });
  });

  it('hides a due check while it is snoozed, and shows it again the next day', () => {
    const snoozed = state({}, new Date(2026, 9, 25));
    expect(chooseNextStep([breast], snoozed, now)).toEqual({ kind: 'learn' });
    expect(chooseNextStep([breast], snoozed, new Date(2026, 9, 25, 8))).toMatchObject({
      kind: 'self-check',
    });
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
      selfCheckPlan: { guideTitle: 'Breast Self-Exam', date: new Date(2026, 10, 10, 9) },
    });
    expect(next.identifier).toBe('self-check-next');
    expect(next.body).toBe('Breast Self-Exam is due today. It takes about 10 minutes.');
    expect(next.trigger).toEqual({ kind: 'date', date: new Date(2026, 10, 10, 9) });
    expect(remindersForType('self_check')[0].trigger).toMatchObject({ kind: 'monthly' });
  });
});

describe('checkStatusLabel', () => {
  // `now` is Saturday, October 24.
  it('names the day an up-to-date check was done', () => {
    const done = new Date(2026, 9, 3, 9, 0);
    expect(checkStatusLabel(done, nextDue(skin, done, now), now)).toBe('Done October 3');
  });

  it('says a never-done check is not done yet', () => {
    expect(checkStatusLabel(null, nextDue(skin, null, now), now)).toBe('Not done yet');
  });

  it('counts how long a done check has waited', () => {
    const label = (done: Date) => checkStatusLabel(done, nextDue(skin, done, now), now);
    expect(label(new Date(2026, 8, 24))).toBe('Due today');
    expect(label(new Date(2026, 8, 23))).toBe('Waiting since yesterday');
    expect(label(new Date(2026, 8, 19))).toBe('Waiting since Monday');
    expect(label(new Date(2026, 8, 10))).toBe('Waiting since October 10');
  });
});

it('formats a weekday date', () => {
  expect(formatWeekdayDate(new Date(2026, 10, 25))).toBe('Wednesday, November 25');
});
