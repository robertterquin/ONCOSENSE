import { useEffect } from 'react';

import { userGender } from '@/api/auth';
import { rescheduleSelfCheckReminder } from '@/lib/notifications/service';
import {
  chooseNextStep,
  chosenGuides,
  dueLabel,
  isDue,
  isSnoozed,
  lastDoneDate,
  nextDue,
} from '@/lib/selfCheck';
import { useUser } from '@/stores/authStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

import { useSelfCheckGuides } from './usePrevention';

export type GuideStatus = {
  guide: SelfCheckGuide;
  due: Date;
  isDue: boolean;
  label: string;
  lastDone: Date | null;
};

let reminderSynced = false;

/** The person's self-checks with their due status, and Today's next step. */
export function useSelfChecks(now: Date = new Date()) {
  const guides = useSelfCheckGuides();
  const gender = userGender(useUser());
  const state = useSelfCheckStore();

  // The reminder is scheduled at start-up before the guides load; once they have,
  // move it to the real due day (once per app session).
  useEffect(() => {
    if (guides.data?.length && !reminderSynced) {
      reminderSynced = true;
      void rescheduleSelfCheckReminder();
    }
  }, [guides.data]);

  const all = guides.data ?? [];
  const status = (guide: SelfCheckGuide): GuideStatus => {
    const lastDone = lastDoneDate(state, guide.id);
    const due = nextDue(guide, lastDone, now);
    return { guide, due, isDue: isDue(guide, lastDone, now), label: dueLabel(due, now), lastDone };
  };
  const mine = chosenGuides(all, state.chosen, gender);

  return {
    query: guides,
    all: all.map(status),
    mine: mine.map(status),
    nextStep: chooseNextStep(mine, state, now),
    /** A due check was put off with "Remind me tomorrow". */
    snoozed: isSnoozed(state, now),
    status,
  };
}

/** Marks a guide done and moves the reminder; returns the next due date for the screen. */
export function markSelfCheckDone(guide: SelfCheckGuide, now: Date = new Date()): Date {
  useSelfCheckStore.getState().markDone(guide.id, now);
  const next = nextDue(guide, now, now);
  void rescheduleSelfCheckReminder();
  return next;
}

/** "Remind me tomorrow" on Today. */
export function snoozeSelfCheck(): void {
  useSelfCheckStore.getState().snoozeUntilTomorrow();
  showToast("We'll remind you tomorrow.");
  void rescheduleSelfCheckReminder();
}
