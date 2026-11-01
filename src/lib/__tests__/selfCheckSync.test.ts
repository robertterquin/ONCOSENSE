import type { User } from '@supabase/supabase-js';

import { useAuthStore } from '@/stores/authStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';

import { clearSelfChecks, mergeSelfChecks } from '../selfCheckSync';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/lib/notifications/service', () => ({ rescheduleSelfCheckReminder: jest.fn() }));

describe('mergeSelfChecks', () => {
  it('keeps the later "done" and every saved guide, and uploads what the account lacks', () => {
    const local = {
      lastDone: { skin: '2026-10-20T09:00:00.000', oral: '2026-10-01T09:00:00.000' },
      savedGuides: ['skin'],
    };
    const cloud = [
      { guide_id: 'oral', last_done: '2026-10-10T08:00:00+00:00', saved: true, history: [] },
      { guide_id: 'breast', last_done: '2026-09-30T07:00:00+00:00', saved: false, history: [] },
    ];
    const merged = mergeSelfChecks(local, cloud);

    expect(merged.lastDone).toEqual({
      skin: '2026-10-20T09:00:00.000',
      oral: '2026-10-10T08:00:00+00:00',
      breast: '2026-09-30T07:00:00+00:00',
    });
    expect(merged.savedGuides.sort()).toEqual(['oral', 'skin']);
    expect(merged.history?.oral).toEqual([
      { date: '2026-10-10T08:00:00+00:00', changed: false },
      { date: '2026-10-01T09:00:00.000', changed: false },
    ]);
    // The guest's skin check is new to the account, and so is the earlier oral check.
    expect(merged.upload.map((row) => row.guide_id).sort()).toEqual(['oral', 'skin']);
  });

  it('joins histories, keeping a noted change', () => {
    const local = {
      lastDone: { skin: '2026-10-20T09:00:00.000' },
      history: { skin: [{ date: '2026-10-20T09:00:00.000', changed: true }] },
      savedGuides: [],
    };
    const cloud = [
      {
        guide_id: 'skin',
        last_done: '2026-10-20T09:00:00.000',
        saved: false,
        history: [
          { date: '2026-10-20T09:00:00.000', changed: false },
          { date: '2026-09-20T09:00:00.000', changed: false },
        ],
      },
    ];
    expect(mergeSelfChecks(local, cloud).history?.skin).toEqual([
      { date: '2026-10-20T09:00:00.000', changed: true },
      { date: '2026-09-20T09:00:00.000', changed: false },
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

  it('clears followed cancers and risk answers on sign-out', () => {
    useSelfCheckStore.getState().setFollowed(['liver', 'thyroid']);
    useSelfCheckStore.getState().setAnswer('hepatitis', 'yes');
    clearSelfChecks();
    expect(useSelfCheckStore.getState()).toMatchObject({
      followed: null,
      answers: {},
      ownerId: null,
    });
  });
});
