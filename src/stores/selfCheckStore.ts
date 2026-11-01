import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
import { addDays, toDbTimestamp } from '@/lib/dates';
import { historyFor, mergeHistory, startOfDay, type SelfCheckState } from '@/lib/selfCheck';

// Self-checks: when each guide was last done, saved guides and reminder choices. Signed
// in, history and saved guides belong to the account (src/lib/selfCheckSync.ts) and
// aren't written to the phone; guests keep them on the phone until they sign in.

type SelfCheckStore = SelfCheckState & {
  /** Guide IDs the person picked; null means the defaults for their profile. */
  chosen: string[] | null;
  /** `changed`: the person noticed a change (design refresh Phase 22). */
  markDone: (guideId: string, when?: Date, changed?: boolean) => void;
  /** "Remind me tomorrow" on Today's next-step panel. */
  snoozeUntilTomorrow: (now?: Date) => void;
  setChosen: (guideIds: string[] | null) => void;
  /** Guides saved to Profile → Saved (on the device; redesign Phase 5). */
  savedGuides: string[];
  toggleSavedGuide: (guideId: string) => void;
};

export const useSelfCheckStore = create<SelfCheckStore>()(
  persist(
    (set) => ({
      lastDone: {},
      history: {},
      snoozedUntil: null,
      chosen: null,
      markDone: (guideId, when = new Date(), changed = false) =>
        set((state) => {
          const date = toDbTimestamp(when);
          return {
            lastDone: { ...state.lastDone, [guideId]: date },
            history: {
              ...state.history,
              [guideId]: mergeHistory([{ date, changed }], historyFor(state, guideId)),
            },
            snoozedUntil: null,
          };
        }),
      snoozeUntilTomorrow: (now = new Date()) =>
        set({ snoozedUntil: toDbTimestamp(addDays(startOfDay(now), 1)) }),
      setChosen: (chosen) => set({ chosen }),
      savedGuides: [],
      toggleSavedGuide: (guideId) =>
        set((state) => ({
          savedGuides: state.savedGuides.includes(guideId)
            ? state.savedGuides.filter((id) => id !== guideId)
            : [...state.savedGuides, guideId],
        })),
    }),
    {
      name: 'self-checks',
      storage: persistStorage,
      version: 1,
      partialize: (state) =>
        useAuthStore.getState().user
          ? { chosen: state.chosen, snoozedUntil: state.snoozedUntil }
          : state,
    },
  ),
);
