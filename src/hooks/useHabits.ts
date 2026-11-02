import { useMemo } from 'react';

import { userAge } from '@/api/auth';
import { HABITS } from '@/constants/habits';
import { habitPlan } from '@/lib/habits';
import { useUser } from '@/stores/authStore';
import { useHabitsStore } from '@/stores/habitsStore';

import { useFocus } from './useFocus';
import { useFollowedCancers } from './useSelfChecks';

/** The habits this person sees, by their focus, smoking answer, picks, age and cancers. */
export function useHabitPlan() {
  const focus = useFocus();
  const age = userAge(useUser());
  const smoker = useHabitsStore((state) => state.smoker);
  const chosen = useHabitsStore((state) => state.chosenHabits);
  const { followed, careTeamCancer } = useFollowedCancers();
  const followedKey = followed.join();
  return useMemo(
    () => habitPlan(HABITS, { focus, smoker, chosen, followed, myCancer: careTeamCancer, age }),
    // `followed` is a new array each render; its contents are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focus, smoker, chosen, followedKey, careTeamCancer, age],
  );
}
