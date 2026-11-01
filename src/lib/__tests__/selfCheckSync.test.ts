import type { User } from '@supabase/supabase-js';

import { useAuthStore } from '@/stores/authStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';

import { mergeSelfChecks } from '../selfCheckSync';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/lib/notifications/service', () => ({ rescheduleSelfCheckReminder: jest.fn() }));

describe('mergeSelfChecks', () => {
  it('keeps the later "done" and every saved guide, and uploads what the account lacks', () => {
    const local = {
      lastDone: { skin: '2026-10-20T09:00:00.000', oral: '2026-10-01T09:00:00.000' },
      savedGuides: ['skin'],
    };
    const cloud = [
      { guide_id: 'oral', last_done: '2026-10-10T08:00:00+00:00', saved: true },
      { guide_id: 'breast', last_done: '2026-09-30T07:00:00+00:00', saved: false },
    ];
    const merged = mergeSelfChecks(local, cloud);

    expect(merged.lastDone).toEqual({
      skin: '2026-10-20T09:00:00.000',
      oral: '2026-10-10T08:00:00+00:00',
      breast: '2026-09-30T07:00:00+00:00',
    });
    expect(merged.savedGuides.sort()).toEqual(['oral', 'skin']);
    // Only the guest's skin check is new to the account.
    expect(merged.upload).toEqual([
      { guide_id: 'skin', last_done: '2026-10-20T09:00:00.000', saved: true },
    ]);
  });
});

describe('self-check storage on the phone', () => {
  const written = () => {
    const raw = localStorage.getItem('self-checks');
    return raw ? JSON.parse(raw).state : null;
  };

  it('keeps history and saved guides off the phone while signed in', () => {
    useAuthStore.setState({ user: { id: 'u1' } as User });
    useSelfCheckStore.getState().markDone('skin', new Date(2026, 9, 25, 9, 0));
    expect(written()).not.toHaveProperty('lastDone');
    expect(written()).not.toHaveProperty('savedGuides');

    useAuthStore.setState({ user: null });
    useSelfCheckStore.getState().toggleSavedGuide('oral');
    expect(written()).toMatchObject({ savedGuides: ['oral'] });
  });
});
