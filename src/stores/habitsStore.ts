import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { haptics } from '@/lib/haptics';
import type { Smoker } from '@/lib/habits';
import { persistStorage } from '@/lib/storage';

export function toDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type HabitsStore = {
  /** Map of 'YYYY-MM-DD' -> array of habit IDs completed on that date. */
  completedByDate: Record<string, string[]>;
  // shortcut: picks and the smoking answer stay on this phone; move them to the account's metadata if people ask for them on a second phone.
  /** Daily habits picked in "Change habits"; null until someone picks. */
  chosenHabits: string[] | null;
  smoker: Smoker | null;
  /** Null goes back to the suggested habits. */
  setChosenHabits: (ids: string[] | null) => void;
  setSmoker: (smoker: Smoker) => void;

  /** Toggle habit completed for a given date (defaults to today). */
  toggleDone: (habitId: string, date?: Date) => boolean;
  /** Check if a habit is completed on a given date. */
  isDone: (habitId: string, date?: Date) => boolean;
  /** Number of habits completed on a given date. */
  completedCount: (date?: Date) => number;
  /** A once-only habit (a vaccine): done on any day. */
  isDoneEver: (habitId: string) => boolean;
  /** Ticks a once-only habit today, or clears it from every day. */
  toggleOnce: (habitId: string) => void;
};

export const useHabitsStore = create<HabitsStore>()(
  persist(
    (set, get) => ({
      completedByDate: {},
      chosenHabits: null,
      smoker: null,
      setChosenHabits: (ids) => set({ chosenHabits: ids }),
      setSmoker: (smoker) => set({ smoker }),

      toggleDone: (habitId, date = new Date()) => {
        const key = toDayKey(date);
        const current = get().completedByDate[key] ?? [];
        const isCurrentlyDone = current.includes(habitId);
        const next = isCurrentlyDone
          ? current.filter((id) => id !== habitId)
          : [...current, habitId];

        set((state) => ({
          completedByDate: {
            ...state.completedByDate,
            [key]: next,
          },
        }));

        if (!isCurrentlyDone) {
          haptics.success();
        } else {
          haptics.selection();
        }

        return !isCurrentlyDone;
      },

      isDone: (habitId, date = new Date()) => {
        const key = toDayKey(date);
        return (get().completedByDate[key] ?? []).includes(habitId);
      },

      completedCount: (date = new Date()) => {
        const key = toDayKey(date);
        return (get().completedByDate[key] ?? []).length;
      },

      isDoneEver: (habitId) =>
        Object.values(get().completedByDate).some((ids) => ids.includes(habitId)),

      toggleOnce: (habitId) => {
        if (!get().isDoneEver(habitId)) {
          get().toggleDone(habitId);
          return;
        }
        haptics.selection();
        set((state) => ({
          completedByDate: Object.fromEntries(
            Object.entries(state.completedByDate).map(([day, ids]) => [
              day,
              ids.filter((id) => id !== habitId),
            ]),
          ),
        }));
      },
    }),
    {
      name: 'prevention-habits',
      storage: persistStorage,
      version: 2,
      migrate: (persisted) => {
        const state = { ...(persisted as Partial<HabitsStore>) };
        // 2: saved habits are gone (design refresh Phase 27).
        delete (state as { bookmarkedHabits?: unknown }).bookmarkedHabits;
        return state as HabitsStore;
      },
    },
  ),
);
