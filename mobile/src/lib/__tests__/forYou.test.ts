import type { CancerType } from '@/types/cancerType';

import { forYouCancers } from '../forYou';

type Profile = Parameters<typeof forYouCancers>[1];

const NAMES = [
  'Breast Cancer',
  'Cervical Cancer',
  'Oral cancer',
  'Testicular cancer',
  'Thyroid cancer',
  'Colorectal Cancer',
  'Liver Cancer',
  'Lung Cancer',
  'Ovarian Cancer',
  'Prostate Cancer',
  'Skin Cancer',
  'Stomach Cancer',
];
const CANCERS = NAMES.map((name) => ({ id: name, name }) as CancerType);
const base: Profile = { gender: null, age: null, smoker: null, myCancerId: null };
const names = (profile: Partial<Profile>) =>
  forYouCancers(CANCERS, { ...base, ...profile }).map((pick) => pick.cancer.name);

describe('forYouCancers', () => {
  it('puts the reasons about this person first for a man of 52 who smokes', () => {
    const picks = forYouCancers(CANCERS, { ...base, gender: 'Male', age: 52, smoker: 'yes' });
    expect(picks.map((pick) => pick.reason)).toEqual([
      'You said you smoke',
      'Smoking causes most mouth cancers',
      'Common for men over 50',
      'Screening starts at 45',
    ]);
  });

  it('puts testicular first for a young man', () => {
    expect(names({ gender: 'Male', age: 24 })[0]).toBe('Testicular cancer');
    expect(names({ gender: 'Male', age: 60 })).not.toContain('Testicular cancer');
  });

  it('offers thyroid to a woman when her own cancer frees a place', () => {
    expect(names({ gender: 'Female', myCancerId: 'Breast Cancer' })).toContain('Thyroid cancer');
  });

  it('leaves prostate out for a young man, and cervical out for a woman over 65', () => {
    expect(names({ gender: 'Male', age: 30 })).not.toContain('Prostate Cancer');
    expect(names({ gender: 'Female', age: 70 })).not.toContain('Cervical Cancer');
  });

  it('shows breast and cervical first for a woman with no age given', () => {
    expect(names({ gender: 'Female' }).slice(0, 2)).toEqual(['Breast Cancer', 'Cervical Cancer']);
  });

  it('assumes no organs when no sex is given', () => {
    for (const gender of [null, 'Non-binary', 'Prefer not to say']) {
      const list = names({ gender });
      expect(list).not.toContain('Prostate Cancer');
      expect(list).not.toContain('Cervical Cancer');
      expect(list).toHaveLength(4);
    }
  });

  it('leaves out the cancer the person named, since it shows on its own', () => {
    expect(names({ gender: 'Female', myCancerId: 'Breast Cancer' })).not.toContain('Breast Cancer');
  });

  it('skips cancers missing from the list', () => {
    const picks = forYouCancers(
      CANCERS.filter((c) => c.name !== 'Lung Cancer'),
      { ...base, smoker: 'yes' },
    );
    expect(picks.map((pick) => pick.cancer.name)).not.toContain('Lung Cancer');
  });
});
