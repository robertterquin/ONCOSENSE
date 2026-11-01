import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { JourneyFocus } from '@/lib/focus';
import { persistStorage } from '@/lib/storage';

// A guest's focus ("What brings you here?") and cancer ("Which cancer?"), kept on this phone. Signed-in people keep
// theirs in user metadata so it follows them across devices.

type FocusStore = {
  guestFocus: JourneyFocus | null;
  setGuestFocus: (focus: JourneyFocus) => void;
  guestCancerId: string | null;
  setGuestCancerId: (id: string) => void;
};

export const useFocusStore = create<FocusStore>()(
  persist(
    (set) => ({
      guestFocus: null,
      setGuestFocus: (guestFocus) => set({ guestFocus }),
      guestCancerId: null,
      setGuestCancerId: (guestCancerId) => set({ guestCancerId }),
    }),
    { name: 'journey-focus', storage: persistStorage, version: 1 },
  ),
);
