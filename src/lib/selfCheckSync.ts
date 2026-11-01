import { fetchSelfCheckProgress, saveSelfCheckProgress, type SelfCheckRow } from '@/api/selfChecks';
import { useAuthStore } from '@/stores/authStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';

import { parseDbTimestamp } from './dates';
import { historyFor, mergeHistory, type CheckEntry } from './selfCheck';
import { rescheduleSelfCheckReminder } from './notifications/service';

// Signed in, self-check history and saved guides live in the account: loaded at sign-in,
// saved on every change, and cleared from the phone at sign-out (the store doesn't write
// them to disk while signed in). Guests keep them on the phone; they're uploaded when
// the guest signs in.

type Progress = {
  lastDone: Record<string, string>;
  history?: Record<string, CheckEntry[]>;
  savedGuides: string[];
};

const time = (value: string | undefined | null) => (value ? parseDbTimestamp(value).getTime() : 0);

const rowFor = (progress: Progress, guideId: string): SelfCheckRow => ({
  guide_id: guideId,
  last_done: progress.lastDone[guideId] ?? null,
  saved: progress.savedGuides.includes(guideId),
  history: historyFor({ ...progress, snoozedUntil: null }, guideId),
});

/**
 * The phone's and the account's self-checks combined: the later "done" wins, histories
 * are joined, and a guide saved on either stays saved. `upload` holds the rows the
 * account is missing.
 */
export function mergeSelfChecks(
  local: Progress,
  cloud: SelfCheckRow[],
): Progress & { upload: SelfCheckRow[] } {
  const lastDone = { ...local.lastDone };
  const localState = { ...local, snoozedUntil: null };
  const history: Record<string, CheckEntry[]> = {};
  for (const id of Object.keys(lastDone)) history[id] = historyFor(localState, id);
  const saved = new Set(local.savedGuides);
  // A row from before the history column counts its last check as its only entry.
  const cloudHistory = (row: SelfCheckRow): CheckEntry[] =>
    row.history?.length
      ? row.history
      : row.last_done
        ? [{ date: row.last_done, changed: false }]
        : [];
  for (const row of cloud) {
    if (row.last_done && time(row.last_done) > time(lastDone[row.guide_id])) {
      lastDone[row.guide_id] = row.last_done;
    }
    history[row.guide_id] = mergeHistory(history[row.guide_id] ?? [], cloudHistory(row));
    if (row.saved) saved.add(row.guide_id);
  }
  const merged = { lastDone, history, savedGuides: [...saved] };
  const ids = new Set([...Object.keys(lastDone), ...saved]);
  const upload = [...ids]
    .map((id) => rowFor(merged, id))
    .filter((row) => {
      const current = cloud.find((c) => c.guide_id === row.guide_id);
      return (
        !current ||
        current.saved !== row.saved ||
        time(current.last_done) !== time(row.last_done) ||
        cloudHistory(current).length !== row.history.length
      );
    });
  return { ...merged, upload };
}

let applying = false;
const apply = (
  state: Partial<
    Progress & {
      snoozedUntil: null;
      ownerId: string | null;
      followed: string[] | null;
      answers: Record<string, never>;
    }
  >,
) => {
  applying = true;
  useSelfCheckStore.setState(state);
  applying = false;
};

/** At sign-in (and launch while signed in): load the account's self-checks. */
export async function syncSelfChecks(): Promise<void> {
  const userId = useAuthStore.getState().user?.id ?? null;
  const current = useSelfCheckStore.getState();
  // Switching accounts on the same phone resets followed cancers and answers to the new user's defaults.
  if (current.ownerId && current.ownerId !== userId) {
    apply({ followed: null, answers: {}, ownerId: userId });
  } else if (current.ownerId !== userId) {
    apply({ ownerId: userId });
  }
  try {
    const cloud = await fetchSelfCheckProgress();
    if (!cloud) return;
    const { upload, ...merged } = mergeSelfChecks(useSelfCheckStore.getState(), cloud);
    apply(merged);
    await saveSelfCheckProgress(upload);
    void rescheduleSelfCheckReminder();
  } catch {
    showToast("Couldn't load your self-checks. Check your connection.", 'error');
  }
}

/** At sign-out: the account's history and followed choices leave the phone. */
export function clearSelfChecks(): void {
  apply({
    lastDone: {},
    history: {},
    savedGuides: [],
    snoozedUntil: null,
    ownerId: null,
    followed: null,
    answers: {},
  });
  void rescheduleSelfCheckReminder();
}

/** Saves each change to the account while signed in. Returns a cleanup function. */
export function startSelfCheckSync(): () => void {
  return useSelfCheckStore.subscribe((state, previous) => {
    if (applying || !useAuthStore.getState().user) return;
    const ids = new Set([
      ...Object.keys(state.lastDone),
      ...state.savedGuides,
      ...previous.savedGuides,
    ]);
    const changed = [...ids]
      .filter(
        (id) =>
          state.lastDone[id] !== previous.lastDone[id] ||
          state.history?.[id] !== previous.history?.[id] ||
          state.savedGuides.includes(id) !== previous.savedGuides.includes(id),
      )
      .map((id) => rowFor(state, id));
    saveSelfCheckProgress(changed).catch(() =>
      showToast("Couldn't save to your account. Check your connection.", 'error'),
    );
  });
}
