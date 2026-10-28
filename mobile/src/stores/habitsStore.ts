import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { haptics } from '@/lib/haptics';
import { persistStorage } from '@/lib/storage';

function toDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type HabitsStore = {
  /** Map of 'YYYY-MM-DD' -> array of habit IDs completed on that date. */
  completedByDate: Record<string, string[]>;
  /** Habit IDs saved by the user to their profile bookmarks. */
  bookmarkedHabits: string[];

  /** Toggle habit completed for a given date (defaults to today). */
  toggleDone: (habitId: string, date?: Date) => boolean;
  /** Check if a habit is completed on a given date. */
  isDone: (habitId: string, date?: Date) => boolean;
  /** Number of habits completed on a given date. */
  completedCount: (date?: Date) => number;

  /** Toggle bookmarking a habit. */
  toggleBookmark: (habitId: string) => boolean;
  /** Check if a habit is bookmarked. */
  isBookmarked: (habitId: string) => boolean;
};

export const useHabitsStore = create<HabitsStore>()(
  persist(
    (set, get) => ({
      completedByDate: {},
      bookmarkedHabits: [],

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

      toggleBookmark: (habitId) => {
        const current = get().bookmarkedHabits;
        const bookmarked = current.includes(habitId);
        const next = bookmarked
          ? current.filter((id) => id !== habitId)
          : [...current, habitId];

        set({ bookmarkedHabits: next });
        haptics.lightImpact();
        return !bookmarked;
      },

      isBookmarked: (habitId) => {
        return get().bookmarkedHabits.includes(habitId);
      },
    }),
    {
      name: 'prevention-habits',
      storage: persistStorage,
      version: 1,
    },
  ),
);
