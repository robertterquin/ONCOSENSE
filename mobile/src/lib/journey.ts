import type { JourneyEntry } from '@/types/journeyEntry';
import {
  DAYS_FREE_MILESTONES,
  STREAK_MILESTONE_DAYS,
  TREATMENT_MILESTONES,
  type Milestone,
} from '@/types/milestone';
import { treatmentProgress, type Treatment } from '@/types/treatment';

import { addDays, differenceInWholeDays, isSameDay } from './dates';

// Journey calculations ported from lib/services/journey_service.dart. Pure functions,
// so they're easy to test and share between hooks and screens.

export function entryForDate(entries: JourneyEntry[], date: Date): JourneyEntry | undefined {
  return entries.find((entry) => isSameDay(entry.date, date));
}

/** Consecutive days with an entry, counting back from today (or yesterday if today has none yet). */
export function currentStreak(entries: JourneyEntry[], now: Date = new Date()): number {
  if (entries.length === 0) return 0;
  let streak = 0;
  let checkDate = now;
  for (let i = 0; i < 365; i++) {
    if (entryForDate(entries, checkDate)) {
      streak++;
      checkDate = addDays(checkDate, -1);
    } else if (i === 0) {
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }
  }
  return streak;
}

function recentEntries(entries: JourneyEntry[], days: number, now: Date): JourneyEntry[] {
  const since = now.getTime() - days * 86_400_000;
  return entries.filter((entry) => entry.date.getTime() > since);
}

export function averageMood(entries: JourneyEntry[], days: number, now: Date = new Date()): number {
  const recent = recentEntries(entries, days, now);
  if (recent.length === 0) return 0;
  return recent.reduce((sum, entry) => sum + entry.moodLevel, 0) / recent.length;
}

export function averagePain(entries: JourneyEntry[], days: number, now: Date = new Date()): number {
  const recent = recentEntries(entries, days, now);
  if (recent.length === 0) return 0;
  return recent.reduce((sum, entry) => sum + entry.painLevel, 0) / recent.length;
}

export type TrendPoint = { date: Date; mood: number; pain: number; energy: number };

/** One point per day for the last `days` days, oldest first; days without an entry are 0. */
export function moodTrend(
  entries: JourneyEntry[],
  days: number,
  now: Date = new Date(),
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(now, -i);
    const entry = entryForDate(entries, date);
    points.push({
      date,
      mood: entry?.moodLevel ?? 0,
      pain: entry?.painLevel ?? 0,
      energy: entry?.energyLevel ?? 0,
    });
  }
  return points;
}

/** Top 10 symptoms by how many entries mention them. */
export function mostCommonSymptoms(entries: JourneyEntry[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const symptom of entry.symptoms) {
      counts.set(symptom, (counts.get(symptom) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
}

export function daysSince(date: Date | null, now: Date = new Date()): number {
  return date ? differenceInWholeDays(now, date) : 0;
}

// ---- Milestones ----

/** Flutter skips a milestone if one with the same title was already achieved that day. */
export function isDuplicateMilestone(existing: Milestone[], milestone: Milestone): boolean {
  return existing.some(
    (m) => m.title === milestone.title && isSameDay(m.dateAchieved, milestone.dateAchieved),
  );
}

function newMilestone(
  id: string,
  fields: Pick<Milestone, 'title' | 'description' | 'type'> & Partial<Milestone>,
  now: Date,
): Milestone {
  return {
    id,
    dateAchieved: now,
    isCelebrated: false,
    iconName: null,
    daysCount: null,
    ...fields,
  };
}

export function journeyStartedMilestone(now: Date = new Date()): Milestone {
  return newMilestone(
    `${now.getTime()}_journey_start`,
    {
      title: 'Journey Started 🌟',
      description: 'You started tracking your cancer journey. Stay strong!',
      type: 'personal',
    },
    now,
  );
}

/** The streak milestone earned by the current streak, if it's exactly a milestone length. */
export function streakMilestone(entries: JourneyEntry[], now: Date = new Date()): Milestone | null {
  const streak = currentStreak(entries, now);
  if (!STREAK_MILESTONE_DAYS.includes(streak)) return null;
  return newMilestone(
    `${now.getTime()}_streak_${streak}`,
    {
      title: `${streak} Day Logging Streak! 🔥`,
      description: `You've logged your journey for ${streak} consecutive days!`,
      type: 'personal',
      daysCount: streak,
    },
    now,
  );
}

/** The progress milestone (25/50/75/100%) a treatment just reached, if any. */
export function treatmentMilestone(treatment: Treatment, now: Date = new Date()): Milestone | null {
  if (treatment.totalSessions === 0) return null;
  const progress = treatmentProgress(treatment);
  const template = TREATMENT_MILESTONES.find(
    (t) => progress >= t.percent && progress < t.percent + 1,
  );
  if (!template) return null;
  return newMilestone(
    `${now.getTime()}_treatment_${treatment.id}_${template.percent}`,
    {
      title: template.title,
      description: `${treatment.name}: ${template.description}`,
      type: 'sessionComplete',
    },
    now,
  );
}

/** Days-free milestones reached since the cancer-free date that haven't been recorded yet. */
export function cancerFreeMilestones(
  cancerFreeDate: Date | null,
  existing: Milestone[],
  now: Date = new Date(),
): Milestone[] {
  if (!cancerFreeDate) return [];
  const days = daysSince(cancerFreeDate, now);
  return DAYS_FREE_MILESTONES.filter(
    (template) =>
      days >= template.days &&
      !existing.some((m) => m.type === 'daysFree' && m.daysCount === template.days),
  ).map((template) =>
    newMilestone(
      `${now.getTime()}_free_${template.days}`,
      {
        title: template.title,
        description: template.description,
        type: 'daysFree',
        daysCount: template.days,
      },
      now,
    ),
  );
}
