import { useHabitsStore } from '../habitsStore';

jest.mock('@/lib/haptics', () => ({
  haptics: {
    selection: jest.fn(),
    lightImpact: jest.fn(),
    mediumImpact: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('habitsStore', () => {
  beforeEach(() => {
    useHabitsStore.setState({ completedByDate: {}, bookmarkedHabits: [] });
    jest.clearAllMocks();
  });

  it('toggles a habit as done and increments count', () => {
    const habitId = 'habit-1';
    const today = new Date(2026, 9, 28);

    expect(useHabitsStore.getState().isDone(habitId, today)).toBe(false);
    expect(useHabitsStore.getState().completedCount(today)).toBe(0);

    // Toggle on
    const result = useHabitsStore.getState().toggleDone(habitId, today);
    expect(result).toBe(true);
    expect(useHabitsStore.getState().isDone(habitId, today)).toBe(true);
    expect(useHabitsStore.getState().completedCount(today)).toBe(1);

    // Toggle off
    const result2 = useHabitsStore.getState().toggleDone(habitId, today);
    expect(result2).toBe(false);
    expect(useHabitsStore.getState().isDone(habitId, today)).toBe(false);
    expect(useHabitsStore.getState().completedCount(today)).toBe(0);
  });

  it('toggles bookmarks for habits', () => {
    const habitId = 'habit-diet';

    expect(useHabitsStore.getState().isBookmarked(habitId)).toBe(false);

    useHabitsStore.getState().toggleBookmark(habitId);
    expect(useHabitsStore.getState().isBookmarked(habitId)).toBe(true);
    expect(useHabitsStore.getState().bookmarkedHabits).toContain(habitId);

    useHabitsStore.getState().toggleBookmark(habitId);
    expect(useHabitsStore.getState().isBookmarked(habitId)).toBe(false);
  });
});
