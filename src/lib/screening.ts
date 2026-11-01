import { addMonths, startOfDay } from './selfCheck';

// Your cancers (design refresh Phase 23): what following a cancer gives a person. Each
// cancer gets the one kind of action that's recognised for it: a monthly self-check, a
// screening test at a clinic, a talk with a doctor, or knowing the warning signs. Ages
// and intervals follow WHO, the American Cancer Society and the US Preventive Services
// Task Force.
// shortcut: the ages, intervals and questions haven't been reviewed by a clinician, before release.

/** Cancers by the first word of their name ("breast" for "Breast cancer"). */
export type CancerKey = string;

export type Sex = 'Male' | 'Female' | null;

/** Answers to the two questions asked when following lung or liver cancer. */
export type ScreeningAnswers = {
  /** About a pack a day for 20 years or more, now or in the last 15 years. */
  heavySmoker?: 'yes' | 'no' | 'unsaid';
  /** Hepatitis B or C, or cirrhosis. */
  hepatitis?: 'yes' | 'no' | 'unsaid';
};

export type ScreeningTest = {
  id: string;
  cancer: CancerKey;
  title: string;
  /** What the test finds, in a sentence or two. */
  about: string;
  who: string;
  /** Months between tests by age; null for a one-off talk with a doctor. */
  months: (age: number | null) => number | null;
  howOften: (age: number | null) => string;
  /** Whether this person should be offered it. */
  eligible: (age: number | null, answers: ScreeningAnswers) => boolean;
  source: string;
};

const within = (age: number | null, from: number, to = Infinity) =>
  age === null || (age >= from && age <= to);

export const SCREENING_TESTS: ScreeningTest[] = [
  {
    id: 'hpv',
    cancer: 'cervical',
    title: 'HPV test',
    about:
      "Finds the virus that causes most cervical cancers, before any cell changes. If HPV testing isn't available, a VIA or Pap smear works too.",
    who: 'Women 25 to 65',
    months: () => 60,
    howOften: () => 'Every 5 years (Pap smear: every 3)',
    eligible: (age) => within(age, 25, 65),
    source: 'WHO, American Cancer Society',
  },
  {
    id: 'mammogram',
    cancer: 'breast',
    title: 'Mammogram',
    about:
      'An X-ray of the breast that can find cancer before a lump can be felt. From 40 you can choose to start; from 45 it is recommended.',
    who: 'Women 45 and over (from 40 if you choose)',
    months: (age) => (age !== null && age >= 55 ? 24 : 12),
    howOften: (age) => (age !== null && age >= 55 ? 'Every 2 years' : 'Every year'),
    eligible: (age) => within(age, 40),
    source: 'American Cancer Society',
  },
  {
    id: 'stool',
    cancer: 'colorectal',
    title: 'Stool test',
    about:
      'A test you do at home and send to a lab, which finds hidden blood from polyps or cancer. A colonoscopy every 10 years is the other choice.',
    who: 'Adults 45 to 75',
    months: () => 12,
    howOften: () => 'Every year (colonoscopy: every 10 years)',
    eligible: (age) => within(age, 45, 75),
    source: 'American Cancer Society, US Preventive Services Task Force',
  },
  {
    id: 'lung-ct',
    cancer: 'lung',
    title: 'Low-dose CT scan',
    about: 'A quick scan of the lungs that finds cancer early in people who have smoked heavily.',
    who: 'Ages 50 to 80 who smoked heavily, now or in the last 15 years',
    months: () => 12,
    howOften: () => 'Every year',
    eligible: (age, answers) => answers.heavySmoker === 'yes' && within(age, 50, 80),
    source: 'US Preventive Services Task Force, American Cancer Society',
  },
  {
    id: 'liver-ultrasound',
    cancer: 'liver',
    title: 'Liver ultrasound',
    about:
      'An ultrasound, often with an AFP blood test, that finds liver cancer early in people with hepatitis B or C, or cirrhosis.',
    who: 'People with hepatitis B or C, or cirrhosis',
    months: () => 6,
    howOften: () => 'Every 6 months',
    eligible: (_age, answers) => answers.hepatitis === 'yes',
    source: 'WHO, American Association for the Study of Liver Diseases',
  },
  {
    id: 'psa-talk',
    cancer: 'prostate',
    title: 'Talk to a doctor about PSA testing',
    about:
      "A PSA blood test can find prostate cancer early, but it can also lead to treatment you don't need. Whether to have it is a choice to make with your doctor.",
    who: 'Men 50 and over (45 if a father or brother had it)',
    months: () => null,
    howOften: () => 'Once, then as your doctor advises',
    eligible: (age) => within(age, 50),
    source: 'American Cancer Society, US Preventive Services Task Force',
  },
];

/** Cancers with a guided self-check at home (matching `self_check_guides.cancer_type`). */
export const SELF_CHECK_CANCERS: CancerKey[] = ['breast', 'skin', 'testicular'];

const MALE_ONLY_CANCERS: CancerKey[] = ['prostate', 'testicular'];
const FEMALE_ONLY_CANCERS: CancerKey[] = ['breast', 'cervical', 'ovarian', 'uterine'];

/** Whether a cancer applies to a person of this sex (everyone when sex is unset or non-binary). */
export function cancerAppliesToSex(cancer: CancerKey, sex: string | null): boolean {
  const normalized = sex?.toLowerCase();
  if (normalized === 'male') return !FEMALE_ONLY_CANCERS.includes(cancer);
  if (normalized === 'female') return !MALE_ONLY_CANCERS.includes(cancer);
  return true;
}

/** Lung and liver ask a question before offering their test. */
export const QUESTION_FOR: Partial<Record<CancerKey, keyof ScreeningAnswers>> = {
  lung: 'heavySmoker',
  liver: 'hepatitis',
};

export type CancerAction =
  { kind: 'self-check' } | { kind: 'screening'; test: ScreeningTest } | { kind: 'signs' };

/**
 * What following a cancer gives this person: a self-check and/or a test when there is one
 * for them, else its warning signs.
 */
export function actionsFor(
  cancer: CancerKey,
  age: number | null,
  answers: ScreeningAnswers,
): CancerAction[] {
  const actions: CancerAction[] = [];
  if (SELF_CHECK_CANCERS.includes(cancer)) actions.push({ kind: 'self-check' });
  for (const test of SCREENING_TESTS) {
    if (test.cancer === cancer && test.eligible(age, answers)) {
      actions.push({ kind: 'screening', test });
    }
  }
  return actions.length ? actions : [{ kind: 'signs' }];
}

/**
 * The cancers recommended (and ticked) by sex and age (design refresh Phase 24): those
 * with a screening test, or a talk about one, recommended for everyone of that age and
 * sex. Self-checks aren't recommended on their own (guidelines favour knowing your body
 * over set exams), so skin, testicular and the rest are the person's choice.
 */
export function defaultFollowed(sex: string | null, age: number | null): CancerKey[] {
  return [
    ...(sex === 'Female' && within(age, 25, 65) ? ['cervical'] : []),
    ...(sex === 'Female' && within(age, 40) ? ['breast'] : []),
    ...(age !== null && age >= 45 && age <= 75 ? ['colorectal'] : []),
    ...(sex === 'Male' && age !== null && age >= 50 ? ['prostate'] : []),
  ];
}

/** "Monthly body check, mammogram every year", "HPV test every 5 years", "Signs check every 3 months". */
export function followSummary(
  key: CancerKey,
  age: number | null,
  answers: ScreeningAnswers,
): string {
  const parts = actionsFor(key, age, answers).map((action) =>
    action.kind === 'self-check'
      ? 'Monthly body check'
      : action.kind === 'screening'
        ? action.test.months(age) === null
          ? action.test.title
          : `${action.test.title} ${lowerFirst(action.test.howOften(age))}`
        : `Signs check every ${SIGNS_EVERY_MONTHS} months`,
  );
  const text = parts.map((part, index) => (index ? lowerFirst(part) : part)).join(', ');
  const question = QUESTION_FOR[key];
  return question && !answers[question] ? `${text} (a test if you're at high risk)` : text;
}

/** "Every year" → "every year", but "HPV test" stays as it is. */
const lowerFirst = (text: string) =>
  /^[A-Z][A-Z]/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);

/** How often the warning-signs prompt comes back. */
export const SIGNS_EVERY_MONTHS = 3;

/** When something is next due: now if never done, else the interval after; null if done for good. */
export function nextDueAfter(
  lastDone: Date | null,
  months: number | null,
  now: Date = new Date(),
): Date | null {
  if (!lastDone) return startOfDay(now);
  return months === null ? null : addMonths(startOfDay(lastDone), months);
}

/** History IDs in `self_check_progress`, next to the self-check guides' IDs. */
export const screeningId = (test: ScreeningTest) => `screening:${test.id}`;
export const signsId = (cancer: CancerKey) => `signs:${cancer}`;
