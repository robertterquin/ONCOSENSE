import { useCommunityStore } from '../communityStore';
import { useSelfCheckStore } from '../selfCheckStore';

describe('self-check store', () => {
  beforeEach(() =>
    useSelfCheckStore.setState({ lastDone: {}, snoozedUntil: null, savedGuides: [] }),
  );

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

  it('saves and unsaves a guide', () => {
    const { toggleSavedGuide } = useSelfCheckStore.getState();
    toggleSavedGuide('skin');
    toggleSavedGuide('oral');
    expect(useSelfCheckStore.getState().savedGuides).toEqual(['skin', 'oral']);
    toggleSavedGuide('skin');
    expect(useSelfCheckStore.getState().savedGuides).toEqual(['oral']);
  });
});

describe('community store', () => {
  it('posts anonymously by default', () => {
    expect(useCommunityStore.getState().anonymousByDefault).toBe(true);
  });
});
