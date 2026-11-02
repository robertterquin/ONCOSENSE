import { useMutation } from '@tanstack/react-query';

import { updateProfile, userCancerTypeId } from '@/api/auth';
import { focusFromMetadata, type JourneyFocus } from '@/lib/focus';
import { asksWhichCancer } from '@/lib/forYou';
import { useUser } from '@/stores/authStore';
import { useFocusStore } from '@/stores/focusStore';

// The person's focus ("What brings you here?"): from user metadata when signed in,
// from this phone for guests.

export function useFocus(): JourneyFocus | null {
  const user = useUser();
  const guestFocus = useFocusStore((state) => state.guestFocus);
  return user ? focusFromMetadata(user) : guestFocus;
}

/** Saves a focus that needs no dates ("Learning"), or a guest's choice. */
export function useSaveFocus() {
  const user = useUser();
  return useMutation({
    mutationFn: async (focus: JourneyFocus) => {
      if (user) await updateProfile({ journey_focus: focus });
      else useFocusStore.getState().setGuestFocus(focus);
    },
  });
}

/**
 * "Which cancer?" for the current focus: an id, `'none'` for "I'd rather not say", or null
 * when not answered or not asked. Learning gets null even with an earlier answer, so every
 * screen follows a change of focus.
 */
export function useMyCancerId(): string | null {
  const saved = useSavedCancerId();
  return asksWhichCancer(useFocus()) ? saved : null;
}

/** The last "Which cancer?" answer whatever the focus, to fill in the choice again. */
export function useSavedCancerId(): string | null {
  const user = useUser();
  const guestCancerId = useFocusStore((state) => state.guestCancerId);
  return user ? userCancerTypeId(user) : guestCancerId;
}

export function useSaveMyCancer() {
  const user = useUser();
  return useMutation({
    mutationFn: async (id: string) => {
      if (user) await updateProfile({ cancer_type_id: id });
      else useFocusStore.getState().setGuestCancerId(id);
    },
  });
}
