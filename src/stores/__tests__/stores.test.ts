import { useCommunityStore } from '../communityStore';
import { useSelfCheckStore } from '../selfCheckStore';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

describe('self-check store', () => {
  beforeEach(() => useSelfCheckStore.setState({ lastDone: {}, history: {}, snoozedUntil: null }));

  it('snoozes until the start of tomorrow, and marking a check done clears the snooze', () => {
    const { snoozeUntilTomorrow, markDone } = useSelfCheckStore.getState();
    snoozeUntilTomorrow(new Date(2026, 9, 24, 21, 30));
    expect(useSelfCheckStore.getState().snoozedUntil).toBe('2026-10-25T00:00:00.000');

    markDone('skin', new Date(2026, 9, 25, 9, 5));
    expect(useSelfCheckStore.getState()).toMatchObject({
      lastDone: { skin: '2026-10-25T09:05:00.000' },
      snoozedUntil: null,
    });
  });

  it('keeps each check, newest first, with whether a change was noted', () => {
    const { markDone } = useSelfCheckStore.getState();
    markDone('skin', new Date(2026, 8, 25, 9, 0));
    markDone('skin', new Date(2026, 9, 25, 9, 0), true);
    expect(useSelfCheckStore.getState().history?.skin).toEqual([
      { date: '2026-10-25T09:00:00.000', changed: true },
      { date: '2026-09-25T09:00:00.000', changed: false },
    ]);
  });
});

describe('community store', () => {
  it('posts anonymously by default', () => {
    expect(useCommunityStore.getState().anonymousByDefault).toBe(true);
  });
});
