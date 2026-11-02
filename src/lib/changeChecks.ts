import type { SelfCheckGuide } from '@/types/selfCheckGuide';

// Change checks: breast and testicular guides become two steps, "look and feel the way
// you usually do", then "any of these changes?" from the guide's own warning signs. The
// American Cancer Society no longer recommends a structured breast self-exam for women at
// average risk (it recommends knowing what's normal for you), and the US Preventive
// Services Task Force recommends against routine testicular self-exams. Skin keeps its
// ABCDE steps, which are the useful part. The guides keep their ids, so history matches.

const CHANGE_CHECKS: Record<string, { title: string; lookAndFeel: string }> = {
  breast: {
    title: 'Breast change check',
    lookAndFeel:
      "Look in a mirror and feel your breasts and armpits, in the shower or lying down. There's no set way; it's about knowing what's normal for you, so you notice a change.",
  },
  testicular: {
    title: 'Testicular change check',
    lookAndFeel:
      "After a warm shower, gently roll each testicle between your fingers. One is often a little larger or lower; that's normal. It's about knowing what's normal for you.",
  },
};

/** The guide as a two-step change check, or unchanged for other cancers. */
export function asChangeCheck(guide: SelfCheckGuide): SelfCheckGuide {
  const change = CHANGE_CHECKS[guide.cancerType.toLowerCase()];
  if (!change || !guide.warningSigns?.length) return guide;
  return {
    ...guide,
    title: change.title,
    changeCheck: true,
    steps: [
      { step: 1, instruction: 'Look and feel, the way you usually do', detail: change.lookAndFeel },
      // The detail is read aloud; the screen shows the signs as a list.
      { step: 2, instruction: 'Any of these changes?', detail: guide.warningSigns.join('. ') },
    ],
  };
}
