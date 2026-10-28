import {
  deleteHabitBookmark,
  deleteHabitCompletion,
  fetchHabitBookmarks,
  fetchHabitCompletions,
  insertHabitBookmark,
  insertHabitCompletion,
  type HabitCompletionRow,
} from '@/api/habits';
import { useAuthStore } from '@/stores/authStore';
import { useHabitsStore } from '@/stores/habitsStore';
import { showToast } from '@/stores/toastStore';

let applying = false;

const apply = (state: { completedByDate?: Record<string, string[]>; bookmarkedHabits?: string[] }) => {
  applying = true;
  useHabitsStore.setState(state);
  applying = false;
};

/** Merges cloud completions and bookmarks with local habits store. */
export function mergeHabits(
  localCompleted: Record<string, string[]>,
  localBookmarked: string[],
  cloudCompletions: HabitCompletionRow[],
  cloudBookmarks: string[],
) {
  // Merge completed by date
  const mergedCompleted: Record<string, string[]> = { ...localCompleted };
  const toUploadCompletions: { habitId: string; date: string }[] = [];

  // Add cloud items into merged map
  for (const c of cloudCompletions) {
    const list = mergedCompleted[c.completed_date] ?? [];
    if (!list.includes(c.habit_id)) {
      mergedCompleted[c.completed_date] = [...list, c.habit_id];
    }
  }

  // Find local items missing from cloud that should be uploaded
  for (const [date, habits] of Object.entries(localCompleted)) {
    for (const habitId of habits) {
      const inCloud = cloudCompletions.some(
        (c) => c.completed_date === date && c.habit_id === habitId,
      );
      if (!inCloud) {
        toUploadCompletions.push({ habitId, date });
      }
    }
  }

  // Merge bookmarks
  const mergedBookmarks = Array.from(new Set([...localBookmarked, ...cloudBookmarks]));
  const toUploadBookmarks = localBookmarked.filter((id) => !cloudBookmarks.includes(id));

  return {
    mergedCompleted,
    mergedBookmarks,
    toUploadCompletions,
    toUploadBookmarks,
  };
}

/** Synchronize habits with the user account on sign-in / app launch while signed in. */
export async function syncHabits(): Promise<void> {
  try {
    const [cloudCompletions, cloudBookmarks] = await Promise.all([
      fetchHabitCompletions(),
      fetchHabitBookmarks(),
    ]);

    if (!cloudCompletions || !cloudBookmarks) return;

    const current = useHabitsStore.getState();
    const { mergedCompleted, mergedBookmarks, toUploadCompletions, toUploadBookmarks } = mergeHabits(
      current.completedByDate,
      current.bookmarkedHabits,
      cloudCompletions,
      cloudBookmarks,
    );

    apply({
      completedByDate: mergedCompleted,
      bookmarkedHabits: mergedBookmarks,
    });

    // Upload any offline / guest items to cloud
    await Promise.all([
      ...toUploadCompletions.map((item) => insertHabitCompletion(item.habitId, item.date)),
      ...toUploadBookmarks.map((id) => insertHabitBookmark(id)),
    ]);
  } catch (error) {
    console.warn('syncHabits error:', error);
  }
}

/** Clear habits state when signing out. */
export function clearHabits(): void {
  apply({
    completedByDate: {},
    bookmarkedHabits: [],
  });
}

/** Subscribe to habit changes while signed in to keep cloud in sync. Returns cleanup unsubscribe. */
export function startHabitSync(): () => void {
  return useHabitsStore.subscribe((state, previous) => {
    if (applying || !useAuthStore.getState().user) return;

    // Detect completions added or removed
    const allDates = new Set([
      ...Object.keys(state.completedByDate),
      ...Object.keys(previous.completedByDate),
    ]);

    for (const date of allDates) {
      const currentList = state.completedByDate[date] ?? [];
      const previousList = previous.completedByDate[date] ?? [];

      // Added
      const added = currentList.filter((id) => !previousList.includes(id));
      for (const id of added) {
        insertHabitCompletion(id, date).catch(() =>
          showToast("Couldn't save habit. Check your connection.", 'error'),
        );
      }

      // Removed
      const removed = previousList.filter((id) => !currentList.includes(id));
      for (const id of removed) {
        deleteHabitCompletion(id, date).catch(() =>
          showToast("Couldn't update habit. Check your connection.", 'error'),
        );
      }
    }

    // Detect bookmarks added or removed
    const addedBookmarks = state.bookmarkedHabits.filter(
      (id) => !previous.bookmarkedHabits.includes(id),
    );
    for (const id of addedBookmarks) {
      insertHabitBookmark(id).catch(() =>
        showToast("Couldn't bookmark habit. Check your connection.", 'error'),
      );
    }

    const removedBookmarks = previous.bookmarkedHabits.filter(
      (id) => !state.bookmarkedHabits.includes(id),
    );
    for (const id of removedBookmarks) {
      deleteHabitBookmark(id).catch(() =>
        showToast("Couldn't remove bookmark. Check your connection.", 'error'),
      );
    }
  });
}
