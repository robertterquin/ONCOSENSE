import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancerFreeDateFromMetadata,
  diagnosisDateFromMetadata,
  hasCompletedJourneySetup,
  saveJourneySetupStatus,
} from '@/api/auth';
import {
  deleteJourneyEntry,
  deleteMilestone,
  deleteTreatment,
  fetchJourneyEntries,
  fetchMilestones,
  fetchTreatments,
  saveJourneyEntry,
  saveMilestone,
  saveTreatment,
} from '@/api/journey';
import {
  cancerFreeMilestones,
  isDuplicateMilestone,
  journeyStartedMilestone,
  streakMilestone,
  treatmentMilestone,
} from '@/lib/journey';
import { useUser, useUserId } from '@/stores/authStore';
import type { JourneyEntry } from '@/types/journeyEntry';
import type { Milestone } from '@/types/milestone';
import type { Treatment } from '@/types/treatment';

import { queryKeys } from './queryKeys';

// Replaces lib/providers/journey_provider.dart (and the parts of journey_service.dart
// that created milestones automatically).

export function useJourneyEntries() {
  const userId = useUserId();
  return useQuery({ queryKey: queryKeys.journeyEntries(userId), queryFn: fetchJourneyEntries });
}

export function useTreatments() {
  const userId = useUserId();
  return useQuery({ queryKey: queryKeys.treatments(userId), queryFn: fetchTreatments });
}

export function useMilestones() {
  const userId = useUserId();
  return useQuery({ queryKey: queryKeys.milestones(userId), queryFn: fetchMilestones });
}

/** Journey setup from user metadata, so it's the same on every device. */
export function useJourneySetup() {
  const user = useUser();
  return {
    journeyStarted: hasCompletedJourneySetup(user),
    diagnosisDate: diagnosisDateFromMetadata(user),
    cancerFreeDate: cancerFreeDateFromMetadata(user),
  };
}

function useJourneyCache() {
  const queryClient = useQueryClient();
  const userId = useUserId();
  const keys = {
    entries: queryKeys.journeyEntries(userId),
    treatments: queryKeys.treatments(userId),
    milestones: queryKeys.milestones(userId),
  };

  /** Saves a milestone unless one with the same title was already achieved that day. */
  const addMilestoneIfNew = async (milestone: Milestone) => {
    const existing: Milestone[] =
      queryClient.getQueryData<Milestone[]>(keys.milestones) ??
      (await queryClient.fetchQuery({ queryKey: keys.milestones, queryFn: fetchMilestones }));
    if (isDuplicateMilestone(existing, milestone)) return;
    await saveMilestone(milestone);
    queryClient.setQueryData<Milestone[]>(keys.milestones, (list = []) =>
      [milestone, ...list].sort((a, b) => b.dateAchieved.getTime() - a.dateAchieved.getTime()),
    );
  };

  return { queryClient, keys, addMilestoneIfNew };
}

// ---- Setup ----

export function useStartJourney() {
  const { addMilestoneIfNew } = useJourneyCache();
  return useMutation({
    mutationFn: async (setup: { diagnosisDate: Date; cancerFreeDate?: Date | null }) => {
      // Updating metadata also refreshes the signed-in user in the auth store.
      await saveJourneySetupStatus({ journeyStarted: true, ...setup });
      await addMilestoneIfNew(journeyStartedMilestone());
    },
  });
}

export function useSetCancerFreeDate() {
  return useMutation({
    mutationFn: (cancerFreeDate: Date) =>
      saveJourneySetupStatus({ journeyStarted: true, cancerFreeDate }),
  });
}

/** Records any days-free milestones reached since the cancer-free date. */
export function useCheckCancerFreeMilestones() {
  const { queryClient, keys, addMilestoneIfNew } = useJourneyCache();
  const { cancerFreeDate } = useJourneySetup();
  return useMutation({
    mutationFn: async () => {
      const existing = queryClient.getQueryData<Milestone[]>(keys.milestones) ?? [];
      for (const milestone of cancerFreeMilestones(cancerFreeDate, existing)) {
        await addMilestoneIfNew(milestone);
      }
    },
  });
}

// ---- Entries ----

/** Adds or updates an entry, then records a streak milestone if one was reached. */
export function useSaveJourneyEntry() {
  const { queryClient, keys, addMilestoneIfNew } = useJourneyCache();
  return useMutation({
    mutationFn: async (entry: JourneyEntry) => {
      await saveJourneyEntry(entry);
      const entries = [
        entry,
        ...(queryClient.getQueryData<JourneyEntry[]>(keys.entries) ?? []).filter(
          (e) => e.id !== entry.id,
        ),
      ].sort((a, b) => b.date.getTime() - a.date.getTime());
      queryClient.setQueryData(keys.entries, entries);

      const milestone = streakMilestone(entries);
      if (milestone) await addMilestoneIfNew(milestone);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.entries }),
  });
}

export function useDeleteJourneyEntry() {
  const { queryClient, keys } = useJourneyCache();
  return useMutation({
    mutationFn: deleteJourneyEntry,
    onSuccess: (_result, entryId) =>
      queryClient.setQueryData<JourneyEntry[]>(keys.entries, (list) =>
        list?.filter((entry) => entry.id !== entryId),
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.entries }),
  });
}

// ---- Treatments ----

/** Adds or updates a treatment, then records a progress milestone if one was reached. */
export function useSaveTreatment() {
  const { queryClient, keys, addMilestoneIfNew } = useJourneyCache();
  return useMutation({
    mutationFn: async (treatment: Treatment) => {
      const existed = (queryClient.getQueryData<Treatment[]>(keys.treatments) ?? []).some(
        (t) => t.id === treatment.id,
      );
      await saveTreatment(treatment);
      queryClient.setQueryData<Treatment[]>(keys.treatments, (list = []) =>
        existed ? list.map((t) => (t.id === treatment.id ? treatment : t)) : [...list, treatment],
      );
      // Flutter only checks progress milestones when an existing treatment changes.
      const milestone = existed ? treatmentMilestone(treatment) : null;
      if (milestone) await addMilestoneIfNew(milestone);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.treatments }),
  });
}

/** Marks one more session as completed (up to the total). */
export function useIncrementSession() {
  const save = useSaveTreatment();
  return {
    ...save,
    increment: (treatment: Treatment) => {
      if (treatment.completedSessions >= treatment.totalSessions) return;
      save.mutate({ ...treatment, completedSessions: treatment.completedSessions + 1 });
    },
  };
}

export function useDeleteTreatment() {
  const { queryClient, keys } = useJourneyCache();
  return useMutation({
    mutationFn: deleteTreatment,
    onSuccess: (_result, treatmentId) =>
      queryClient.setQueryData<Treatment[]>(keys.treatments, (list) =>
        list?.filter((treatment) => treatment.id !== treatmentId),
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.treatments }),
  });
}

// ---- Milestones ----

export function useAddMilestone() {
  const { queryClient, keys, addMilestoneIfNew } = useJourneyCache();
  return useMutation({
    mutationFn: addMilestoneIfNew,
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.milestones }),
  });
}

export function useCelebrateMilestone() {
  const { queryClient, keys } = useJourneyCache();
  return useMutation({
    mutationFn: async (milestone: Milestone) => {
      const celebrated = { ...milestone, isCelebrated: true };
      await saveMilestone(celebrated);
      queryClient.setQueryData<Milestone[]>(keys.milestones, (list) =>
        list?.map((m) => (m.id === milestone.id ? celebrated : m)),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.milestones }),
  });
}

export function useDeleteMilestone() {
  const { queryClient, keys } = useJourneyCache();
  return useMutation({
    mutationFn: deleteMilestone,
    onSuccess: (_result, milestoneId) =>
      queryClient.setQueryData<Milestone[]>(keys.milestones, (list) =>
        list?.filter((m) => m.id !== milestoneId),
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.milestones }),
  });
}
