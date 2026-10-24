import { useMutation } from '@tanstack/react-query';

import { updateProfile } from '@/api/auth';
import { focusFromMetadata, type JourneyFocus } from '@/lib/focus';
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
