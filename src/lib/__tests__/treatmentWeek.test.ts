import { treatmentWeek } from '@/lib/treatmentWeek';
import type { Appointment } from '@/types/appointment';
import type { Treatment } from '@/types/treatment';

// Monday, November 2, 2026, 6 p.m.
const now = new Date(2026, 10, 2, 18);

const appointment = (
  id: string,
  startsAt: Date,
  treatmentId: string | null = null,
): Appointment => ({
  id,
  title: id,
  startsAt,
  location: null,
  notes: null,
  treatmentId,
});

const chemo: Treatment = {
  id: 'chemo',
  name: 'Chemotherapy',
  type: 'chemotherapy',
  startDate: new Date(2026, 8, 1),
  endDate: null,
  doctorName: null,
  hospitalName: null,
  notes: null,
  totalSessions: 6,
  completedSessions: 3,
  sideEffects: [],
  isActive: true,
};

describe('treatmentWeek', () => {
  it("shows this week's check-ins with nothing coming up", () => {
    const week = treatmentWeek(
      [appointment('past', new Date(2026, 10, 1, 9))],
      [],
      [new Date(2026, 10, 2, 9)],
      now,
    );
    expect(week.thisWeek).toBe(true);
    expect(week.listed).toEqual([]);
    expect(week.days[1].marks).toEqual(['checkIn']);
  });

  it("marks this week's sessions, appointments and check-ins, keeping this morning's", () => {
    const week = treatmentWeek(
      [
        appointment('Session 4', new Date(2026, 10, 5, 9), 'chemo'),
        appointment('Blood test', new Date(2026, 10, 4, 8)),
        appointment('This morning', new Date(2026, 10, 2, 8)),
        appointment('Next week', new Date(2026, 10, 10, 9)),
      ],
      [chemo],
      [new Date(2026, 10, 1, 20), new Date(2026, 10, 2, 9)],
      now,
    );
    expect(week.thisWeek).toBe(true);
    expect(week.listed.map((item) => item.title)).toEqual([
      'This morning',
      'Blood test',
      'Session 4',
    ]);
    expect(week.listed[2].treatment?.id).toBe('chemo');
    // Sunday Nov 1 to Saturday Nov 7.
    expect(week.days.map((day) => day.marks)).toEqual([
      ['checkIn'],
      ['appointment', 'checkIn'],
      [],
      ['appointment'],
      ['treatment'],
      [],
      [],
    ]);
  });

  it('shows the week of the next appointment when this week is clear', () => {
    const week = treatmentWeek([appointment('Scan', new Date(2026, 10, 18, 10))], [], [], now);
    expect(week.thisWeek).toBe(false);
    expect(week.days[0].date).toEqual(new Date(2026, 10, 15));
    expect(week.days[3].marks).toEqual(['appointment']);
  });
});
