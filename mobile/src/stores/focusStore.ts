import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { JourneyFocus } from '@/lib/focus';
import { persistStorage } from '@/lib/storage';

// A guest's focus ("What brings you here?"), kept on this phone. Signed-in people keep
// theirs in user metadata so it follows them across devices.

type FocusStore = {
  guestFocus: JourneyFocus | null;
  setGuestFocus: (focus: JourneyFocus) => void;
};

export const useFocusStore = create<FocusStore>()(
  persist(
    (set) => ({
      guestFocus: null,
      setGuestFocus: (guestFocus) => set({ guestFocus }),
    }),
    { name: 'journey-focus', storage: persistStorage, version: 1 },
  ),
);
