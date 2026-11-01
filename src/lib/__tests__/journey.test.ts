import {
  currentStreak,
  isDuplicateMilestone,
  journeyStartedMilestone,
  mostCommonSymptoms,
  streakMilestone,
  treatmentMilestone,
} from '@/lib/journey';
import type { JourneyEntry } from '@/types/journeyEntry';
import type { Treatment } from '@/types/treatment';

const now = new Date(2026, 9, 22, 18, 0);

function entry(daysAgo: number, overrides: Partial<JourneyEntry> = {}): JourneyEntry {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(9);
  return {
    id: `e${daysAgo}`,
    date,
    moodLevel: 3,
    painLevel: 2,
    energyLevel: 5,
    sleepQuality: 3,
    symptoms: [],
    notes: null,
    appointmentNotes: null,
    hasAppointment: false,
    ...overrides,
  };
}

const days = (count: number, start = 0) =>
  Array.from({ length: count }, (_, i) => entry(start + i));

describe('currentStreak', () => {
  it('counts consecutive days including today', () => {
    expect(currentStreak(days(3), now)).toBe(3);
  });

  it('starts from yesterday when today has no entry yet', () => {
    expect(currentStreak(days(2, 1), now)).toBe(2);
  });

  it('stops at the first gap', () => {
    expect(currentStreak([entry(0), entry(1), entry(3)], now)).toBe(2);
    expect(currentStreak([entry(2)], now)).toBe(0);
    expect(currentStreak([], now)).toBe(0);
  });
});

describe('statistics', () => {
  it('ranks symptoms by frequency', () => {
    const entries = [
      entry(0, { symptoms: ['Fatigue', 'Nausea'] }),
      entry(1, { symptoms: ['Fatigue'] }),
    ];
    expect(mostCommonSymptoms(entries)).toEqual([
      ['Fatigue', 2],
      ['Nausea', 1],
    ]);
  });
});

describe('milestones', () => {
  it('awards a streak milestone only on exact milestone lengths', () => {
    expect(streakMilestone(days(7), now)?.title).toBe('7-day check-in streak');
    expect(streakMilestone(days(7), now)?.daysCount).toBe(7);
    expect(streakMilestone(days(8), now)).toBeNull();
  });

  it('awards treatment progress milestones at 25/50/75/100%', () => {
    const treatment: Treatment = {
      id: 't1',
      name: 'Chemo',
      type: 'chemotherapy',
      startDate: now,
      endDate: null,
      doctorName: null,
      hospitalName: null,
      notes: null,
      totalSessions: 8,
      completedSessions: 4,
      sideEffects: [],
      isActive: true,
    };
    expect(treatmentMilestone(treatment, now)?.description).toBe('Chemo: Halfway there.');
    expect(treatmentMilestone({ ...treatment, completedSessions: 5 }, now)).toBeNull();
    expect(treatmentMilestone({ ...treatment, totalSessions: 0 }, now)).toBeNull();
  });

  it('treats same title on the same day as a duplicate', () => {
    const started = journeyStartedMilestone(now);
    const later = new Date(now);
    later.setHours(23);
    expect(isDuplicateMilestone([started], { ...started, id: 'x', dateAchieved: later })).toBe(
      true,
    );
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    expect(isDuplicateMilestone([started], { ...started, id: 'x', dateAchieved: nextDay })).toBe(
      false,
    );
  });
});
