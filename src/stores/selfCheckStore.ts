import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
import { addDays, toDbTimestamp } from '@/lib/dates';
import type { CancerKey, ScreeningAnswers } from '@/lib/screening';
import { historyFor, mergeHistory, startOfDay, type SelfCheckState } from '@/lib/selfCheck';

// Self-checks: when each guide was last done, and reminder choices. Signed in, history
// belongs to the account (src/lib/selfCheckSync.ts) and isn't written to the phone;
// guests keep it on the phone until they sign in.

type SelfCheckStore = SelfCheckState & {
  /** Account ID that `followed` and `answers` belong to (null for a guest). */
  ownerId: string | null;
  /** Cancers the person follows (Your cancers); null means the defaults for their profile. */
  followed: CancerKey[] | null;
  setFollowed: (cancers: CancerKey[]) => void;
  /** Answers to the lung and liver questions. */
  answers: ScreeningAnswers;
  setAnswer: <K extends keyof ScreeningAnswers>(
    key: K,
    value: NonNullable<ScreeningAnswers[K]>,
  ) => void;
  /** `changed`: the person noticed a change (design refresh Phase 22). */
  markDone: (guideId: string, when?: Date, changed?: boolean) => void;
  /** "Remind me tomorrow" on Today's next-step panel. */
  snoozeUntilTomorrow: (now?: Date) => void;
};

export const useSelfCheckStore = create<SelfCheckStore>()(
  persist(
    (set) => ({
      lastDone: {},
      history: {},
      snoozedUntil: null,
      ownerId: null,
      followed: null,
      setFollowed: (followed) =>
        set({ followed, ownerId: useAuthStore.getState().user?.id ?? null }),
      answers: {},
      setAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value },
          ownerId: useAuthStore.getState().user?.id ?? null,
        })),
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
    }),
    {
      name: 'self-checks',
      storage: persistStorage,
      version: 5,
      migrate: (persisted, version) => {
        const state = { ...(persisted as Partial<SelfCheckStore>) };
        // 5: saved guides are gone (design refresh Phase 27).
        delete (state as { savedGuides?: unknown }).savedGuides;
        // Before 3: followed cancers and answers start again from the defaults; history is
        // kept (a guest's exists only on this phone).
        if (version < 3) return { ...state, ownerId: null, followed: null, answers: {} };
        // 4: the liver question now tells cirrhosis from hepatitis B, so an old "yes" (B, C
        // or cirrhosis) is asked again.
        const { hepatitis, ...answers } = (state.answers ?? {}) as Record<string, string>;
        return { ...state, answers: hepatitis === 'yes' ? answers : (state.answers ?? {}) };
      },
      partialize: (state) =>
        useAuthStore.getState().user
          ? // shortcut: followed cancers and answers stay on this phone; move them to the
            // account if people ask for them on a second phone.
            {
              ownerId: state.ownerId,
              followed: state.followed,
              answers: state.answers,
              snoozedUntil: state.snoozedUntil,
            }
          : state,
    },
  ),
);
