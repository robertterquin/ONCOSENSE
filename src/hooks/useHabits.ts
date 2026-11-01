import { useMemo } from 'react';

import { HABITS } from '@/constants/habits';
import { habitPlan } from '@/lib/habits';
import { useHabitsStore } from '@/stores/habitsStore';

import { useFocus } from './useFocus';
import { useFollowedCancers } from './useSelfChecks';

/** The habits this person sees, by their focus, smoking answer, picks and cancers. */
export function useHabitPlan() {
  const focus = useFocus();
  const smoker = useHabitsStore((state) => state.smoker);
  const chosen = useHabitsStore((state) => state.chosenHabits);
  const { followed, careTeamCancer } = useFollowedCancers();
  const followedKey = followed.join();
  return useMemo(
    () => habitPlan(HABITS, { focus, smoker, chosen, followed, myCancer: careTeamCancer }),
    // `followed` is a new array each render; its contents are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focus, smoker, chosen, followedKey, careTeamCancer],
  );
}
