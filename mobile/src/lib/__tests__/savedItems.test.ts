import { iconForPreventionTip } from '@/lib/learn';
import { useHabitsStore } from '@/stores/habitsStore';
import type { PreventionTip } from '@/types/preventionTip';

jest.mock('@/lib/haptics', () => ({
  haptics: {
    selection: jest.fn(),
    lightImpact: jest.fn(),
    mediumImpact: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('Saved Habits integration & filtering', () => {
  const mockTips: PreventionTip[] = [
    {
      id: 'tip-1',
      iconName: 'natural-food',
      title: 'Healthy Diet',
      description: 'Eat more fruits, vegetables, and whole grains',
      category: 'Diet',
      detailedInfo: 'A balanced diet reduces risk of multiple cancers.',
      sourceName: 'WHO',
      sourceUrl: 'https://who.int',
      dateVerified: new Date(2026, 0, 1),
      displayOrder: 1,
      isActive: true,
    },
    {
      id: 'tip-2',
      iconName: 'running-shoes',
      title: 'Regular Exercise',
      description: 'Aim for 150 minutes of moderate activity weekly',
      category: 'Exercise',
      detailedInfo: 'Physical activity maintains healthy weight and immune function.',
      sourceName: 'CDC',
      sourceUrl: 'https://cdc.gov',
      dateVerified: new Date(2026, 0, 1),
      displayOrder: 2,
      isActive: true,
    },
    {
      id: 'tip-3',
      iconName: 'sun',
      title: 'Sun Protection',
      description: 'Wear broad-spectrum SPF 30+ sunscreen',
      category: 'Lifestyle',
      detailedInfo: 'Protects skin from harmful UV radiation.',
      sourceName: 'Skin Cancer Foundation',
      sourceUrl: 'https://skincancer.org',
      dateVerified: new Date(2026, 0, 1),
      displayOrder: 3,
      isActive: true,
    },
  ];

  beforeEach(() => {
    useHabitsStore.setState({ completedByDate: {}, bookmarkedHabits: [] });
    jest.clearAllMocks();
  });

  it('correctly maps prevention tip categories to icons for saved rows', () => {
    expect(iconForPreventionTip(mockTips[0])).toBe('natural-food');
    expect(iconForPreventionTip(mockTips[1])).toBe('running-shoes');
    expect(iconForPreventionTip(mockTips[2])).toBe('sun');
  });

  it('filters tips based on user bookmarks', () => {
    // Initially empty
    const bookmarkedIds = useHabitsStore.getState().bookmarkedHabits;
    const initialSaved = mockTips.filter((t) => bookmarkedIds.includes(t.id));
    expect(initialSaved).toHaveLength(0);

    // Bookmark tip-1 and tip-3
    useHabitsStore.getState().toggleBookmark('tip-1');
    useHabitsStore.getState().toggleBookmark('tip-3');

    const updatedBookmarks = useHabitsStore.getState().bookmarkedHabits;
    const saved = mockTips.filter((t) => updatedBookmarks.includes(t.id));
    expect(saved).toHaveLength(2);
    expect(saved.map((s) => s.id)).toEqual(['tip-1', 'tip-3']);

    // Unbookmark tip-1
    useHabitsStore.getState().toggleBookmark('tip-1');
    const remainingBookmarks = useHabitsStore.getState().bookmarkedHabits;
    const remainingSaved = mockTips.filter((t) => remainingBookmarks.includes(t.id));
    expect(remainingSaved).toHaveLength(1);
    expect(remainingSaved[0].id).toBe('tip-3');
  });

  it('toggles daily completion status for saved habits', () => {
    const today = new Date(2026, 9, 28);
    useHabitsStore.getState().toggleBookmark('tip-2');

    expect(useHabitsStore.getState().isDone('tip-2', today)).toBe(false);

    // Mark as done
    useHabitsStore.getState().toggleDone('tip-2', today);
    expect(useHabitsStore.getState().isDone('tip-2', today)).toBe(true);

    // Toggle off
    useHabitsStore.getState().toggleDone('tip-2', today);
    expect(useHabitsStore.getState().isDone('tip-2', today)).toBe(false);
  });
});
