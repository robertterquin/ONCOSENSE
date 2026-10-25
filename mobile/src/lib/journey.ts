import type { JourneyEntry } from '@/types/journeyEntry';
import { STREAK_MILESTONE_DAYS, TREATMENT_MILESTONES, type Milestone } from '@/types/milestone';
import { treatmentProgress, type Treatment } from '@/types/treatment';

import { addDays, isSameDay } from './dates';

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

export function averagePain(entries: JourneyEntry[], days: number, now: Date = new Date()): number {
  const recent = recentEntries(entries, days, now);
  if (recent.length === 0) return 0;
  return recent.reduce((sum, entry) => sum + entry.painLevel, 0) / recent.length;
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

// ---- Dashboard (redesign Phase 4) ----

type WeekDay = { date: Date; label: string; isToday: boolean; checkedIn: boolean };

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Monday to Sunday of this week, marking today and the days with a check-in. */
export function weekStrip(entries: JourneyEntry[], now: Date = new Date()): WeekDay[] {
  const sinceMonday = (now.getDay() + 6) % 7;
  const monday = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), -sinceMonday);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    return {
      date,
      label: SHORT_DAYS[date.getDay()],
      isToday: isSameDay(date, now),
      checkedIn: entryForDate(entries, date) !== undefined,
    };
  });
}

export type WeekSummary = {
  /** One point per day, oldest first; `null` on days without a check-in. */
  days: { date: Date; energy: number | null; pain: number | null }[];
  checkIns: number;
  averageEnergy: number | null;
  averagePain: number | null;
  /** Up to three, most common first. */
  topSymptoms: [string, number][];
};

/** Energy, pain and symptoms over the last 7 days (today included). */
export function lastSevenDays(entries: JourneyEntry[], now: Date = new Date()): WeekSummary {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(now, index - 6);
    const entry = entryForDate(entries, date);
    return { date, energy: entry?.energyLevel ?? null, pain: entry?.painLevel ?? null, entry };
  });
  const logged = days.filter((day) => day.entry).map((day) => day.entry!);
  const average = (values: number[]) =>
    values.length
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : null;
  return {
    days: days.map(({ date, energy, pain }) => ({ date, energy, pain })),
    checkIns: logged.length,
    averageEnergy: average(logged.map((entry) => entry.energyLevel)),
    averagePain: average(logged.map((entry) => entry.painLevel)),
    topSymptoms: mostCommonSymptoms(logged).slice(0, 3),
  };
}

/** The chart in words, for screen readers and anyone who prefers text. */
export function weekSummaryText(summary: WeekSummary): string {
  if (summary.checkIns === 0) return 'No check-ins in the last 7 days.';
  const checkIns = `${summary.checkIns} check-in${summary.checkIns === 1 ? '' : 's'}`;
  return (
    `Last 7 days, ${checkIns}: energy averaged ${summary.averageEnergy} of 10 ` +
    `and pain ${summary.averagePain} of 10.`
  );
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
