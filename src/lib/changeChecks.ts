import type { SelfCheckGuide } from '@/types/selfCheckGuide';

// Change checks: a self-check guide becomes "where and how to look", then "any of these
// changes?" from the guide's own warning signs, answered No / Yes. The American Cancer
// Society no longer recommends a structured breast self-exam for women at average risk (it
// recommends knowing what's normal for you), and the US Preventive Services Task Force
// recommends against routine testicular self-exams. Skin follows the American Academy of
// Dermatology's self-exam: the body areas to look at, then the ABCDE and "ugly duckling"
// signs. The guides keep their ids, so history matches.

type Step = { instruction: string; detail: string };

const CHANGE_CHECKS: Record<string, { title: string; steps: Step[] }> = {
  skin: {
    title: 'Skin change check',
    steps: [
      {
        instruction: 'Front, back and sides',
        detail:
          'Stand in front of a full-length mirror in good light. Look at your front and back, then each side with your arms raised.',
      },
      {
        instruction: 'Arms, underarms, palms and nails',
        detail:
          'Bend your elbows to see your forearms and underarms. Check your palms and fingernails.',
      },
      {
        instruction: 'Legs, soles and between your toes',
        detail:
          'Sit down to look at the backs of your legs, the soles of your feet, between your toes and your toenails.',
      },
      {
        instruction: 'Scalp, neck, back and buttocks',
        detail:
          'Use a hand mirror, and part your hair to see your scalp. Someone you trust can help with the places you can’t see.',
      },
    ],
  },
  breast: {
    title: 'Breast change check',
    steps: [
      {
        instruction: 'Look and feel, the way you usually do',
        detail:
          "Look in a mirror and feel your breasts and armpits, in the shower or lying down. There's no set way; it's about knowing what's normal for you, so you notice a change.",
      },
    ],
  },
  testicular: {
    title: 'Testicular change check',
    steps: [
      {
        instruction: 'Look and feel, the way you usually do',
        detail:
          "After a warm shower, gently roll each testicle between your fingers. One is often a little larger or lower; that's normal. It's about knowing what's normal for you.",
      },
    ],
  },
};

/** The guide as a change check, or unchanged for other cancers. */
export function asChangeCheck(guide: SelfCheckGuide): SelfCheckGuide {
  const change = CHANGE_CHECKS[guide.cancerType.toLowerCase()];
  if (!change || !guide.warningSigns?.length) return guide;
  const steps = [
    ...change.steps,
    // The detail is read aloud; the screen shows the signs as a list.
    { instruction: 'Any of these changes?', detail: guide.warningSigns.join('. ') },
  ];
  return {
    ...guide,
    title: change.title,
    changeCheck: true,
    steps: steps.map((step, index) => ({ step: index + 1, ...step })),
  };
}
