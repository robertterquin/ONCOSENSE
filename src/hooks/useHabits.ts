import { useMemo } from 'react';

import { HABITS } from '@/constants/habits';
import { habitPlan } from '@/lib/habits';
import { useHabitsStore } from '@/stores/habitsStore';

import { useFocus } from './useFocus';

/** The habits this person sees, by their focus, smoking answer and picks. */
export function useHabitPlan() {
  const focus = useFocus();
  const smoker = useHabitsStore((state) => state.smoker);
  const chosen = useHabitsStore((state) => state.chosenHabits);
  return useMemo(
    () => habitPlan(HABITS, { inTreatment: focus === 'treatment', smoker, chosen }),
    [focus, smoker, chosen],
  );
}
