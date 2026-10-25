import { fetchSelfCheckProgress, saveSelfCheckProgress, type SelfCheckRow } from '@/api/selfChecks';
import { useAuthStore } from '@/stores/authStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';

import { parseDbTimestamp } from './dates';
import { rescheduleSelfCheckReminder } from './notifications/service';

// Signed in, self-check history and saved guides live in the account: loaded at sign-in,
// saved on every change, and cleared from the phone at sign-out (the store doesn't write
// them to disk while signed in). Guests keep them on the phone; they're uploaded when
// the guest signs in.

type Progress = { lastDone: Record<string, string>; savedGuides: string[] };

const time = (value: string | undefined | null) => (value ? parseDbTimestamp(value).getTime() : 0);

const rowFor = (progress: Progress, guideId: string): SelfCheckRow => ({
  guide_id: guideId,
  last_done: progress.lastDone[guideId] ?? null,
  saved: progress.savedGuides.includes(guideId),
});

/**
 * The phone's and the account's self-checks combined: the later "done" wins and a guide
 * saved on either stays saved. `upload` holds the rows the account is missing.
 */
export function mergeSelfChecks(
  local: Progress,
  cloud: SelfCheckRow[],
): Progress & { upload: SelfCheckRow[] } {
  const lastDone = { ...local.lastDone };
  const saved = new Set(local.savedGuides);
  for (const row of cloud) {
    if (row.last_done && time(row.last_done) > time(lastDone[row.guide_id])) {
      lastDone[row.guide_id] = row.last_done;
    }
    if (row.saved) saved.add(row.guide_id);
  }
  const merged = { lastDone, savedGuides: [...saved] };
  const ids = new Set([...Object.keys(lastDone), ...saved]);
  const upload = [...ids]
    .map((id) => rowFor(merged, id))
    .filter((row) => {
      const current = cloud.find((c) => c.guide_id === row.guide_id);
      return (
        !current || current.saved !== row.saved || time(current.last_done) !== time(row.last_done)
      );
    });
  return { ...merged, upload };
}

let applying = false;
const apply = (state: Partial<Progress & { snoozedUntil: null }>) => {
  applying = true;
  useSelfCheckStore.setState(state);
  applying = false;
};

/** At sign-in (and launch while signed in): load the account's self-checks. */
export async function syncSelfChecks(): Promise<void> {
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

/** At sign-out: the account's history leaves the phone. */
export function clearSelfChecks(): void {
  apply({ lastDone: {}, savedGuides: [], snoozedUntil: null });
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
          state.savedGuides.includes(id) !== previous.savedGuides.includes(id),
      )
      .map((id) => rowFor(state, id));
    saveSelfCheckProgress(changed).catch(() =>
      showToast("Couldn't save to your account. Check your connection.", 'error'),
    );
  });
}
