import { useEffect } from 'react';

import { userAge, userGender } from '@/api/auth';
import { checkItems } from '@/lib/checks';
import { rescheduleSelfCheckReminder } from '@/lib/notifications/service';
import { parseDbTimestamp } from '@/lib/dates';
import { cancerKeyword } from '@/lib/help';
import {
  actionsFor,
  cancerAppliesToSex,
  defaultFollowed,
  nextDueAfter,
  screeningId,
  SIGNS_EVERY_MONTHS,
  signsId,
  type CancerKey,
  type ScreeningTest,
} from '@/lib/screening';
import {
  chosenGuides,
  dueLabel,
  historyFor,
  isDue,
  isSnoozed,
  lastDoneDate,
  nextDue,
  type CheckEntry,
} from '@/lib/selfCheck';
import { useUser } from '@/stores/authStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';
import type { CancerType } from '@/types/cancerType';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

import { useCancerTypes } from './useCancerInfo';
import { useFocus, useMyCancerId } from './useFocus';
import { useSelfCheckGuides } from './usePrevention';

export type GuideStatus = {
  guide: SelfCheckGuide;
  due: Date;
  isDue: boolean;
  label: string;
  lastDone: Date | null;
  /** Finished checks, newest first. */
  history: CheckEntry[];
  /** When the latest check noted a change; null when it was normal or never done. */
  changeNoted: Date | null;
};

/** A followed cancer's screening test or warning signs, and when it's next due. */
export type FollowStatus = {
  /** The `self_check_progress` row it's kept in ("screening:hpv", "signs:ovarian"). */
  historyId: string;
  cancer: CancerType | null;
  cancerKey: CancerKey;
  /** The test, or null for a warning-signs prompt. */
  test: ScreeningTest | null;
  lastDone: Date | null;
  /** Null when done for good (the one-off talk with a doctor). */
  due: Date | null;
  isDue: boolean;
  history: CheckEntry[];
  changeNoted: Date | null;
};

let reminderSynced = false;

/**
 * The cancers someone follows (their own list, or the defaults for their sex and age). A
 * survivor's own cancer is left out: its follow-up is set by their care team, not the
 * average-risk schedule.
 */
export function useFollowedCancers(): { followed: CancerKey[]; careTeamCancer: CancerKey | null } {
  const user = useUser();
  const gender = userGender(user);
  const age = userAge(user);
  const chosen = useSelfCheckStore((state) => state.followed);
  const focus = useFocus();
  const myCancerId = useMyCancerId();
  const myCancer = (useCancerTypes().data ?? []).find((cancer) => cancer.id === myCancerId);
  const careTeamCancer = focus === 'finished' && myCancer ? cancerKeyword(myCancer.name) : null;
  const followed = (chosen ?? defaultFollowed(gender, age)).filter(
    (key) => cancerAppliesToSex(key, gender) && key !== careTeamCancer,
  );
  return { followed, careTeamCancer };
}

/** The person's self-checks with their due status, and Today's next step. */
export function useSelfChecks(now: Date = new Date()) {
  const guides = useSelfCheckGuides();
  const user = useUser();
  const gender = userGender(user);
  const age = userAge(user);
  const state = useSelfCheckStore();

  // The reminder is scheduled at start-up before the guides load; once they have,
  // move it to the real due day (once per app session).
  useEffect(() => {
    if (guides.data?.length && !reminderSynced) {
      reminderSynced = true;
      void rescheduleSelfCheckReminder();
    }
  }, [guides.data]);

  const all = (guides.data ?? []).filter((guide) =>
    cancerAppliesToSex(cancerKeyword(guide.cancerType), gender),
  );
  const cancers = useCancerTypes().data ?? [];
  const { followed, careTeamCancer } = useFollowedCancers();

  const status = (guide: SelfCheckGuide): GuideStatus => {
    const lastDone = lastDoneDate(state, guide.id);
    const due = nextDue(guide, lastDone, now);
    const history = historyFor(state, guide.id);
    const changeNoted = history[0]?.changed ? parseDbTimestamp(history[0].date) : null;
    return {
      guide,
      due,
      isDue: isDue(guide, lastDone, now),
      label: dueLabel(due, now),
      lastDone,
      history,
      changeNoted,
    };
  };
  const mine = chosenGuides(all, followed);

  // Screening tests and warning signs for the followed cancers (design refresh Phase 23).
  const followStatus = (
    historyId: string,
    cancerKey: CancerKey,
    test: ScreeningTest | null,
    months: number | null,
  ): FollowStatus => {
    const lastDone = lastDoneDate(state, historyId);
    const due = nextDueAfter(lastDone, months, now);
    const history = historyFor(state, historyId);
    return {
      historyId,
      cancer: cancers.find((cancer) => cancerKeyword(cancer.name) === cancerKey) ?? null,
      cancerKey,
      test,
      lastDone,
      due,
      isDue: due !== null && due.getTime() <= now.getTime(),
      history,
      changeNoted: history[0]?.changed ? parseDbTimestamp(history[0].date) : null,
    };
  };
  const follows = followed.flatMap((cancerKey) =>
    actionsFor(cancerKey, age, state.answers, gender).flatMap((action) =>
      action.kind === 'screening'
        ? [followStatus(screeningId(action.test), cancerKey, action.test, action.test.months(age))]
        : action.kind === 'signs'
          ? [followStatus(signsId(cancerKey), cancerKey, null, SIGNS_EVERY_MONTHS)]
          : [],
    ),
  );

  return {
    query: guides,
    all: all.map(status),
    mine: mine.map(status),
    /** The cancers the person follows (their own list, or the defaults). */
    followed,
    /** A survivor's own cancer, whose follow-up comes from their care team. */
    careTeamCancer,
    /** Screening tests for the followed cancers. */
    screenings: follows.filter((item) => item.test),
    /** Warning-signs prompts for followed cancers with no check or test. */
    signs: follows.filter((item) => !item.test),
    /** Everything above bundled for Today: one body check, each test, one signs check. */
    items: checkItems({
      guides: mine,
      followed,
      age,
      answers: state.answers,
      sex: gender,
      state,
      now,
    }),
    /** A due check was put off with "Remind me tomorrow". */
    snoozed: isSnoozed(state, now),
    status,
  };
}

/**
 * Marks a guide done (noting whether the person saw a change) and moves the reminder;
 * returns the next due date for the screen.
 */
export function markSelfCheckDone(
  guide: SelfCheckGuide,
  changed = false,
  now: Date = new Date(),
): Date {
  useSelfCheckStore.getState().markDone(guide.id, now, changed);
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
