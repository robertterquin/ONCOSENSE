import { mergeHabits } from '../habitSync';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

describe('mergeHabits', () => {
  it('merges local and cloud completions seamlessly without duplicates', () => {
    const local = {
      '2026-10-28': ['habit-1', 'habit-2'],
    };
    const cloud = [
      { habit_id: 'habit-2', completed_date: '2026-10-28' },
      { habit_id: 'habit-3', completed_date: '2026-10-28' },
      { habit_id: 'habit-4', completed_date: '2026-10-27' },
    ];

    const { mergedCompleted, toUploadCompletions } = mergeHabits(local, [], cloud, []);

    // 2026-10-28 should contain habit-1, habit-2, habit-3
    expect(mergedCompleted['2026-10-28']).toEqual(
      expect.arrayContaining(['habit-1', 'habit-2', 'habit-3']),
    );
    expect(mergedCompleted['2026-10-28']).toHaveLength(3);

    // 2026-10-27 should contain habit-4
    expect(mergedCompleted['2026-10-27']).toEqual(['habit-4']);

    // Only habit-1 was missing from cloud for 2026-10-28
    expect(toUploadCompletions).toEqual([{ habitId: 'habit-1', date: '2026-10-28' }]);
  });

  it('merges local and cloud bookmarks and tracks missing cloud items', () => {
    const localBookmarked = ['habit-a', 'habit-b'];
    const cloudBookmarks = ['habit-b', 'habit-c'];

    const { mergedBookmarks, toUploadBookmarks } = mergeHabits(
      {},
      localBookmarked,
      [],
      cloudBookmarks,
    );

    expect(mergedBookmarks).toEqual(expect.arrayContaining(['habit-a', 'habit-b', 'habit-c']));
    expect(mergedBookmarks).toHaveLength(3);

    expect(toUploadBookmarks).toEqual(['habit-a']);
  });
});
