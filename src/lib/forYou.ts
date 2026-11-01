import type { CancerType } from '@/types/cancerType';

import type { JourneyFocus } from './focus';
import type { Smoker } from './habits';

// Learn › Cancers "For you": cancers ranked for this person, each with the reason it's
// there. Nothing is hidden; the full list stays below. Incidence order is GLOBOCAN 2022
// for the Philippines (men: lung, liver, colorectal, prostate; women: breast, cervical,
// colorectal, lung). Screening ages and the testicular, oral and thyroid reasons follow
// the American Cancer Society.
// shortcut: the age cut-offs haven't been reviewed by a clinician, before release.

export type ForYouPick = { cancer: CancerType; reason: string };

type Profile = {
  gender: string | null;
  age: number | null;
  smoker: Smoker | null;
  /** The cancer named in "Which cancer?"; it's shown on its own, so left out here. */
  myCancerId: string | null;
};

/** A candidate: the word in the cancer's name, why, and whether it's about this person. */
type Rule = { match: string; reason: string; personal?: boolean } | null;

const MAX_PICKS = 4;

function rules({ gender, age, smoker }: Profile): Rule[] {
  const sex = gender?.toLowerCase();
  const over = (years: number) => age !== null && age >= years;
  const lung: Rule =
    smoker === 'yes' ? { match: 'lung', reason: 'You said you smoke', personal: true } : null;
  // Tobacco also causes most mouth cancers.
  const oral: Rule =
    smoker === 'yes'
      ? { match: 'oral', reason: 'Smoking causes most mouth cancers', personal: true }
      : null;
  const colorectal: Rule = over(45)
    ? { match: 'colorectal', reason: 'Screening starts at 45', personal: true }
    : { match: 'colorectal', reason: 'Common in the Philippines' };

  if (sex === 'male') {
    return [
      lung ?? { match: 'lung', reason: 'Most common in Filipino men' },
      oral,
      age !== null && age >= 15 && age <= 35
        ? { match: 'testicular', reason: 'Most common in men 15 to 35', personal: true }
        : null,
      over(50) ? { match: 'prostate', reason: 'Common for men over 50', personal: true } : null,
      colorectal,
      { match: 'liver', reason: 'Common in Filipino men' },
      age === null ? { match: 'prostate', reason: 'Common for men over 50' } : null,
      age === null ? { match: 'testicular', reason: 'Most common in men 15 to 35' } : null,
    ];
  }
  if (sex === 'female') {
    const cervical: Rule =
      age === null || (age >= 25 && age <= 65)
        ? { match: 'cervical', reason: 'Screening from age 25', personal: age !== null }
        : null;
    return [
      { match: 'breast', reason: 'Most common in Filipino women' },
      cervical,
      colorectal,
      lung ?? { match: 'lung', reason: 'Common in the Philippines' },
      oral,
      { match: 'thyroid', reason: 'Three times more common in women' },
    ];
  }
  // No sex given (or non-binary): shared cancers only, since organs can't be assumed.
  return [
    lung ?? { match: 'lung', reason: 'Common in the Philippines' },
    oral,
    { match: 'breast', reason: 'Most common in the Philippines' },
    colorectal,
    { match: 'liver', reason: 'Common in the Philippines' },
  ];
}

export function forYouCancers(cancers: CancerType[], profile: Profile): ForYouPick[] {
  const candidates = rules(profile).filter((rule) => rule !== null);
  // Reasons about this person (smoking, screening age) come before population ones.
  const ordered = [
    ...candidates.filter((rule) => rule.personal),
    ...candidates.filter((rule) => !rule.personal),
  ];
  const picks: ForYouPick[] = [];
  for (const rule of ordered) {
    const cancer = cancers.find((c) => c.name.toLowerCase().includes(rule.match));
    if (!cancer || cancer.id === profile.myCancerId) continue;
    if (picks.some((pick) => pick.cancer.id === cancer.id)) continue;
    picks.push({ cancer, reason: rule.reason });
  }
  return picks.slice(0, MAX_PICKS);
}

/** Treatment and Finished are asked "Which cancer?"; Learning isn't. */
export function asksWhichCancer(focus: JourneyFocus | null): boolean {
  return focus === 'treatment' || focus === 'finished';
}
