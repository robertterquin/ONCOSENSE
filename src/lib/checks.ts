import {
  actionsFor,
  nextDueAfter,
  screeningId,
  SIGNS_EVERY_MONTHS,
  signsId,
  type CancerKey,
  type ScreeningAnswers,
} from './screening';
import { historyFor, lastDoneDate, nextDue, startOfDay, type SelfCheckState } from './selfCheck';
import { parseDbTimestamp } from './dates';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

// Your checks (design refresh Phase 24): everything a person follows, bundled into at most
// three kinds so following many cancers stays simple. The self-checks become one monthly
// body check, the warning signs one signs check every 3 months, and each screening test
// stays its own item because it's a real appointment.

export type CheckKind = 'body' | 'test' | 'signs';

export type CheckItem = {
  kind: CheckKind;
  /** The body check and signs check have one id each; a test is its screening id. */
  id: string;
  /** "Monthly body check", "Stool test", "Signs check". */
  title: string;
  /** What it covers: "Skin, breast", "Ovarian, thyroid", or how often a test is. */
  detail: string;
  /** Null when done for good (the one-off talk about PSA testing). */
  due: Date | null;
  isDue: boolean;
  /** When its latest result noted a change; null otherwise. */
  changeNoted: Date | null;
  /** For a test: the screening test's id, to open its page. */
  testId?: string;
};

export const BODY_CHECK_ID = 'body-check';
export const SIGNS_CHECK_ID = 'signs-check';

const capitalize = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

/** The latest change noted among these history ids, if the latest result was a change. */
function latestChange(state: SelfCheckState, ids: string[]): Date | null {
  const changes = ids
    .map((id) => historyFor(state, id)[0])
    .filter((entry) => entry?.changed)
    .map((entry) => parseDbTimestamp(entry.date));
  return changes.length ? new Date(Math.max(...changes.map((date) => date.getTime()))) : null;
}

const earliest = (dates: Date[]) => new Date(Math.min(...dates.map((date) => date.getTime())));

/**
 * The person's checks, soonest first: the body check (when they follow a cancer with a
 * self-check guide), each screening test they're offered, and the signs check (for
 * followed cancers with neither).
 */
export function checkItems({
  guides,
  followed,
  age,
  answers,
  sex = null,
  state,
  now = new Date(),
}: {
  /** The self-check guides for the cancers they follow. */
  guides: SelfCheckGuide[];
  followed: CancerKey[];
  age: number | null;
  answers: ScreeningAnswers;
  sex?: string | null;
  state: SelfCheckState;
  now?: Date;
}): CheckItem[] {
  const today = startOfDay(now).getTime();
  const items: CheckItem[] = [];

  if (guides.length) {
    const due = earliest(guides.map((guide) => nextDue(guide, lastDoneDate(state, guide.id), now)));
    items.push({
      kind: 'body',
      id: BODY_CHECK_ID,
      title: 'Monthly body check',
      detail: guides.map((guide) => guide.cancerType).join(', '),
      due,
      isDue: due.getTime() <= today,
      changeNoted: latestChange(
        state,
        guides.map((guide) => guide.id),
      ),
    });
  }

  const signs: CancerKey[] = [];
  for (const cancer of followed) {
    for (const action of actionsFor(cancer, age, answers, sex)) {
      if (action.kind === 'signs') signs.push(cancer);
      if (action.kind !== 'screening') continue;
      const id = screeningId(action.test);
      const due = nextDueAfter(lastDoneDate(state, id), action.test.months(age), now);
      items.push({
        kind: 'test',
        id,
        testId: action.test.id,
        title: action.test.title,
        detail: action.test.howOften(age),
        due,
        isDue: due !== null && due.getTime() <= today,
        changeNoted: null,
      });
    }
  }

  if (signs.length) {
    const ids = signs.map(signsId);
    const due = earliest(
      ids.map((id) => nextDueAfter(lastDoneDate(state, id), SIGNS_EVERY_MONTHS, now)!),
    );
    items.push({
      kind: 'signs',
      id: SIGNS_CHECK_ID,
      title: 'Signs check',
      detail: signs.map(capitalize).join(', '),
      due,
      isDue: due.getTime() <= today,
      changeNoted: latestChange(state, ids),
    });
  }

  // Soonest first; a test that's done for good goes last.
  return items.sort((a, b) => (a.due?.getTime() ?? Infinity) - (b.due?.getTime() ?? Infinity));
}
