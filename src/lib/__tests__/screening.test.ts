import { actionsFor, cancerAppliesToSex, defaultFollowed, nextDueAfter } from '../screening';

const kinds = (cancer: string, age: number | null, answers = {}) =>
  actionsFor(cancer, age, answers).map((action) =>
    action.kind === 'screening' ? action.test.id : action.kind,
  );

describe('defaultFollowed', () => {
  it('follows self-checks by sex and age', () => {
    expect(defaultFollowed('Male', 60)).toEqual(['skin', 'thyroid', 'colorectal', 'prostate']);
    expect(defaultFollowed('Male', 17)).toEqual(['testicular']);
    expect(defaultFollowed('Female', 19)).toEqual(['skin', 'thyroid']);
    expect(defaultFollowed('Female', 16)).toEqual([]);
    expect(defaultFollowed('Non-binary', 30)).toEqual(['skin', 'thyroid']);
  });

  it('adds the screening every woman or man of that age should have', () => {
    expect(defaultFollowed('Female', 47)).toEqual([
      'breast',
      'skin',
      'thyroid',
      'cervical',
      'colorectal',
    ]);
    expect(defaultFollowed('Female', 70)).toEqual(['breast', 'skin', 'thyroid', 'colorectal']);
  });

  it('leaves out age-based screening when no age is given', () => {
    expect(defaultFollowed('Male', null)).toEqual(['testicular', 'skin', 'thyroid']);
  });
});

describe('actionsFor', () => {
  it('gives breast both a self-check and, from 40, a mammogram', () => {
    expect(kinds('breast', 30)).toEqual(['self-check']);
    expect(kinds('breast', 47)).toEqual(['self-check', 'mammogram']);
  });

  it('offers lung and liver tests only to people at high risk, else warning signs', () => {
    expect(kinds('lung', 60)).toEqual(['signs']);
    expect(kinds('lung', 60, { heavySmoker: 'yes' })).toEqual(['lung-ct']);
    expect(kinds('lung', 40, { heavySmoker: 'yes' })).toEqual(['signs']);
    expect(kinds('liver', 35, { hepatitis: 'yes' })).toEqual(['liver-ultrasound']);
    expect(kinds('liver', 35, { hepatitis: 'unsaid' })).toEqual(['signs']);
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
