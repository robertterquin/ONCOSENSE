import type { SelfCheckGuide } from '@/types/selfCheckGuide';

import { asChangeCheck } from '../changeChecks';

const guide = (cancerType: string, warningSigns: string[] | null): SelfCheckGuide => ({
  id: cancerType,
  title: `${cancerType} self-exam`,
  description: '',
  cancerType,
  frequency: 'Monthly',
  ageRecommendation: null,
  steps: [1, 2, 3, 4, 5].map((step) => ({ step, instruction: `Step ${step}`, detail: '' })),
  warningSigns,
  whenToSeeDoctor: '',
  sourceName: '',
  sourceUrl: '',
  dateVerified: null,
  displayOrder: 0,
  isActive: true,
});

describe('asChangeCheck', () => {
  it('turns breast and testicular into two steps ending with their warning signs', () => {
    const breast = asChangeCheck(guide('Breast', ['New lump', 'Dimpling']));
    expect(breast).toMatchObject({ id: 'Breast', title: 'Breast change check', changeCheck: true });
    expect(breast.steps.map((step) => step.instruction)).toEqual([
      'Look and feel, the way you usually do',
      'Any of these changes?',
    ]);
    expect(asChangeCheck(guide('Testicular', ['Lump'])).changeCheck).toBe(true);
  });

  it('leaves skin, and any guide without warning signs, as it is', () => {
    expect(asChangeCheck(guide('Skin', ['Changing mole'])).steps).toHaveLength(5);
    expect(asChangeCheck(guide('Breast', null)).changeCheck).toBeUndefined();
  });
});
