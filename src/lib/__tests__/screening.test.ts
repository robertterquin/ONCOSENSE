import {
  actionsFor,
  cancerAppliesToSex,
  defaultFollowed,
  followSummary,
  nextDueAfter,
  primaryAction,
  type ScreeningAnswers,
} from '../screening';

const kinds = (
  cancer: string,
  age: number | null,
  answers: ScreeningAnswers = {},
  sex: string | null = null,
) =>
  actionsFor(cancer, age, answers, sex).map((action) =>
    action.kind === 'screening' ? action.test.id : action.kind,
  );

describe('defaultFollowed', () => {
  it('ticks only the screening recommended for that sex and age', () => {
    expect(defaultFollowed('Female', 47)).toEqual(['cervical', 'breast', 'colorectal']);
    expect(defaultFollowed('Female', 70)).toEqual(['breast', 'colorectal']);
    expect(defaultFollowed('Male', 60)).toEqual(['colorectal', 'prostate']);
    expect(defaultFollowed('Female', 30)).toEqual(['cervical']);
  });

  it('ticks no self-check on its own', () => {
    expect(defaultFollowed('Male', 25)).toEqual([]);
    expect(defaultFollowed('Non-binary', 30)).toEqual([]);
  });

  it('leaves out age-based screening when no age is given', () => {
    expect(defaultFollowed('Male', null)).toEqual([]);
    expect(defaultFollowed('Female', null)).toEqual(['cervical', 'breast']);
  });
});

describe('followSummary', () => {
  it('says what following a cancer gives, in the bundled names', () => {
    expect(followSummary('breast', 47, {})).toBe('Monthly body check, mammogram every year');
    expect(followSummary('ovarian', 47, {})).toBe('Signs check every 3 months');
    expect(followSummary('lung', 60, {})).toBe(
      "Signs check every 3 months (a test if you're at high risk)",
    );
  });
});

describe('actionsFor', () => {
  it('gives oral and thyroid warning signs, not a self-check', () => {
    expect(kinds('oral', 30)).toEqual(['signs']);
    expect(kinds('thyroid', 30)).toEqual(['signs']);
  });

  it('gives breast both a self-check and, from 40, a mammogram', () => {
    expect(kinds('breast', 30)).toEqual(['self-check']);
    expect(kinds('breast', 47)).toEqual(['self-check', 'mammogram']);
  });

  it('offers lung and liver tests only to people at high risk, else warning signs', () => {
    expect(kinds('lung', 60)).toEqual(['signs']);
    expect(kinds('lung', 60, { heavySmoker: 'yes' })).toEqual(['lung-ct']);
    expect(kinds('lung', 40, { heavySmoker: 'yes' })).toEqual(['signs']);
    expect(kinds('liver', 35, { hepatitis: 'cirrhosis' })).toEqual(['liver-ultrasound']);
    expect(kinds('liver', 35, { hepatitis: 'unsaid' })).toEqual(['signs']);
  });

  it('offers liver ultrasound for hepatitis B from 40 for men and 50 for women (AASLD)', () => {
    const b = { hepatitis: 'hepatitis-b' } as const;
    expect(kinds('liver', 42, b, 'Male')).toEqual(['liver-ultrasound']);
    expect(kinds('liver', 42, b, 'Female')).toEqual(['signs']);
    expect(kinds('liver', 52, b, 'Female')).toEqual(['liver-ultrasound']);
    expect(kinds('liver', 35, b, 'Male')).toEqual(['signs']);
  });

  it('gives cancers with no check or test their warning signs', () => {
    expect(kinds('ovarian', 50)).toEqual(['signs']);
    expect(kinds('cervical', 70)).toEqual(['signs']);
    expect(kinds('prostate', 55)).toEqual(['psa-talk']);
  });
});

describe('nextDueAfter', () => {
  const now = new Date(2026, 10, 1, 9);
  it('is due now if never done, else after the interval, and never again for a one-off', () => {
    expect(nextDueAfter(null, 60, now)).toEqual(new Date(2026, 10, 1));
    expect(nextDueAfter(new Date(2026, 2, 15), 12, now)).toEqual(new Date(2027, 2, 15));
    expect(nextDueAfter(new Date(2026, 2, 15), null, now)).toBeNull();
  });
});

describe('cancerAppliesToSex', () => {
  it('filters out opposite-sex reproductive cancers when sex is Male or Female', () => {
    expect(cancerAppliesToSex('breast', 'Male')).toBe(false);
    expect(cancerAppliesToSex('cervical', 'Male')).toBe(false);
    expect(cancerAppliesToSex('ovarian', 'Male')).toBe(false);
    expect(cancerAppliesToSex('uterine', 'Male')).toBe(false);
    expect(cancerAppliesToSex('prostate', 'Male')).toBe(true);
    expect(cancerAppliesToSex('testicular', 'Male')).toBe(true);

    expect(cancerAppliesToSex('prostate', 'Female')).toBe(false);
    expect(cancerAppliesToSex('testicular', 'Female')).toBe(false);
    expect(cancerAppliesToSex('breast', 'Female')).toBe(true);
    expect(cancerAppliesToSex('cervical', 'Female')).toBe(true);
    expect(cancerAppliesToSex('ovarian', 'Female')).toBe(true);
    expect(cancerAppliesToSex('uterine', 'Female')).toBe(true);

    expect(cancerAppliesToSex('breast', null)).toBe(true);
    expect(cancerAppliesToSex('cervical', null)).toBe(true);
    expect(cancerAppliesToSex('prostate', null)).toBe(true);
  });
});

describe('primaryAction', () => {
  const kind = (cancer: string, age: number | null, answers = {}) => {
    const action = primaryAction(cancer, age, answers);
    return action.kind === 'screening' ? action.test.id : action.kind;
  };

  it('opens the test when one is offered, else the self-check, else the signs', () => {
    expect(kind('breast', 47)).toBe('mammogram');
    expect(kind('breast', 30)).toBe('self-check');
    expect(kind('ovarian', 30)).toBe('signs');
    expect(kind('lung', 60, { heavySmoker: 'yes' })).toBe('lung-ct');
  });
});
