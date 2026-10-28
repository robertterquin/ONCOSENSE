import { toDbTimestamp } from '@/lib/dates';
import { focusFromMetadata, focusSubtitle, usesJourney } from '@/lib/focus';
import {
  lastSevenDays,
  sevenDayTrend,
  weekStrip,
  weekSummaryText,
  weekThreadText,
} from '@/lib/journey';
import {
  appointmentReminder,
  appointmentReminderDate,
  isCurrentReminder,
} from '@/lib/notifications/reminders';
import { buildSummary, summaryHtml, summarySections } from '@/lib/summary';
import {
  appointmentFromRow,
  appointmentToRow,
  appointmentWithinDay,
  upcomingAppointments,
  type Appointment,
} from '@/types/appointment';
import type { JourneyEntry } from '@/types/journeyEntry';
import type { Treatment } from '@/types/treatment';

const user = (metadata: Record<string, unknown>) => ({ user_metadata: metadata }) as never;

const entry = (date: Date, fields: Partial<JourneyEntry> = {}): JourneyEntry => ({
  id: String(date.getTime()),
  date,
  moodLevel: 3,
  painLevel: 2,
  energyLevel: 6,
  sleepQuality: 3,
  symptoms: [],
  notes: null,
  appointmentNotes: null,
  hasAppointment: false,
  ...fields,
});

const now = new Date(2026, 9, 24, 14, 30); // Saturday, October 24

describe('week thread and trends', () => {
  it('reads the week as one sentence', () => {
    const days = weekStrip(
      [entry(new Date(2026, 9, 19, 9)), entry(new Date(2026, 9, 20, 9)), entry(now)],
      now,
    );
    expect(weekThreadText(days)).toBe(
      'This week: checked in Monday, Tuesday and Saturday. 3 of 7 days.',
    );
    expect(weekThreadText(weekStrip([], now))).toBe('This week: no check-ins yet. 0 of 7 days.');
  });

  it('compares the last 7 days with the 7 before', () => {
    const before = entry(new Date(2026, 9, 14, 9), { energyLevel: 4, painLevel: 3 });
    const recent = entry(new Date(2026, 9, 22, 9), { energyLevel: 6, painLevel: 3.2 });
    expect(sevenDayTrend([before, recent], 'averageEnergy', now)).toEqual({
      value: 6,
      detail: 'of 10, up from 4',
    });
    expect(sevenDayTrend([before, recent], 'averagePain', now).detail).toBe('of 10, steady');
    expect(sevenDayTrend([recent], 'averageEnergy', now).detail).toBe('of 10');
    expect(sevenDayTrend([], 'averagePain', now)).toEqual({
      value: null,
      detail: 'No check-ins in the last 7 days',
    });
  });
});

describe('focus', () => {
  it('reads the saved focus', () => {
    expect(focusFromMetadata(user({ journey_focus: 'caring' }))).toBe('caring');
  });

  it('works one out for accounts from before the redesign', () => {
    expect(focusFromMetadata(user({ journey_started: true }))).toBe('treatment');
    expect(
      focusFromMetadata(user({ journey_started: true, cancer_free_date: '2025-03-01T00:00:00' })),
    ).toBe('finished');
    expect(focusFromMetadata(user({}))).toBeNull();
    expect(focusFromMetadata(user({ journey_focus: 'something-else' }))).toBeNull();
    expect(focusFromMetadata(null)).toBeNull();
  });

  it('uses Journey for every focus but Learning', () => {
    expect(usesJourney('learning')).toBe(false);
    expect(usesJourney(null)).toBe(false);
    expect(usesJourney('finished')).toBe(true);
  });

  it('describes the focus with its dates', () => {
    expect(focusSubtitle('treatment', new Date(2026, 6, 3), null)).toBe(
      'In treatment since July 2026',
    );
    expect(focusSubtitle('finished', null, new Date(2025, 2, 1))).toBe(
      'Treatment finished March 2025',
    );
  });
});

describe('week strip and the last 7 days', () => {
  const entries = [
    entry(new Date(2026, 9, 19, 20), { painLevel: 4, energyLevel: 4, symptoms: ['Fatigue'] }),
    entry(new Date(2026, 9, 22, 20), {
      painLevel: 2,
      energyLevel: 7,
      symptoms: ['Fatigue', 'Nausea'],
    }),
    entry(new Date(2026, 9, 24, 9), { painLevel: 0, energyLevel: 8 }),
    entry(new Date(2026, 9, 10, 9)), // outside both windows
  ];

  it('runs Monday to Sunday, marks today and the check-in days', () => {
    const week = weekStrip(entries, now);
    expect(week.map((day) => day.label)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(week.map((day) => day.checkedIn)).toEqual([
      true,
      false,
      false,
      true,
      false,
      true,
      false,
    ]);
    expect(week.findIndex((day) => day.isToday)).toBe(5);
  });

  it('averages only the days with a check-in', () => {
    const summary = lastSevenDays(entries, now);
    expect(summary.days).toHaveLength(7);
    expect(summary.days.map((day) => day.pain)).toEqual([null, 4, null, null, 2, null, 0]);
    expect(summary.checkIns).toBe(3);
    expect(summary.averageEnergy).toBe(6.3);
    expect(summary.averagePain).toBe(2);
    expect(summary.topSymptoms).toEqual([
      ['Fatigue', 2],
      ['Nausea', 1],
    ]);
    expect(weekSummaryText(summary)).toBe(
      'Last 7 days, 3 check-ins: energy averaged 6.3 of 10 and pain 2 of 10.',
    );
    expect(weekSummaryText(lastSevenDays([], now))).toBe('No check-ins in the last 7 days.');
  });
});

describe('appointments', () => {
  const appointment: Appointment = {
    id: '1729_appt',
    title: 'Oncology check-up',
    startsAt: new Date(2026, 9, 27, 9, 30),
    location: 'PGH, Room 4',
    notes: null,
    treatmentId: null,
  };

  it('maps rows both ways in local wall-clock time', () => {
    const row = appointmentToRow(appointment);
    expect(row).toEqual({
      id: '1729_appt',
      title: 'Oncology check-up',
      starts_at: toDbTimestamp(appointment.startsAt),
      location: 'PGH, Room 4',
      notes: null,
      treatment_id: null,
    });
    expect(appointmentFromRow({ ...row, starts_at: '2026-10-27T09:30:00+00:00' })).toEqual(
      appointment,
    );
  });

  it('lists upcoming ones and finds one within a day', () => {
    const past = { ...appointment, id: 'past', startsAt: new Date(2026, 9, 20, 9) };
    const soon = { ...appointment, id: 'soon', startsAt: new Date(2026, 9, 25, 9) };
    expect(upcomingAppointments([appointment, past, soon], now).map((a) => a.id)).toEqual([
      'soon',
      '1729_appt',
    ]);
    expect(appointmentWithinDay([appointment, soon], now)?.id).toBe('soon');
    expect(appointmentWithinDay([appointment], now)).toBeNull();
  });

  it('reminds at 6 PM the evening before, never in the past', () => {
    expect(appointmentReminderDate(appointment.startsAt, now)).toEqual(new Date(2026, 9, 26, 18));
    expect(appointmentReminderDate(new Date(2026, 9, 24, 20), now)).toBeNull();
    const reminder = appointmentReminder(appointment, new Date(2026, 9, 26, 18));
    expect(reminder.identifier).toBe('appointment-1729_appt');
    expect(reminder.body).toBe('Oncology check-up, 9:30 AM at PGH, Room 4.');
    expect(isCurrentReminder(reminder.identifier)).toBe(true);
  });
});

describe('summary for the doctor', () => {
  const treatment: Treatment = {
    id: 't1',
    name: 'Chemotherapy',
    type: 'chemotherapy',
    startDate: new Date(2026, 6, 1),
    endDate: null,
    doctorName: null,
    hospitalName: null,
    notes: null,
    totalSessions: 6,
    completedSessions: 3,
    sideEffects: [],
    isActive: true,
  };
  const entries = [
    entry(new Date(2026, 9, 1), { painLevel: 6, energyLevel: 3, symptoms: ['Nausea'] }),
    entry(new Date(2026, 9, 5), { painLevel: 5, energyLevel: 4, symptoms: ['Nausea', 'Fatigue'] }),
    entry(new Date(2026, 9, 15), { painLevel: 2, energyLevel: 7, notes: 'Felt <better> today' }),
    entry(new Date(2026, 9, 20), { painLevel: 1, energyLevel: 8, moodLevel: 5 }),
    entry(new Date(2026, 7, 1), { painLevel: 9 }), // before the 30 days
  ];
  const input = {
    name: 'Ana Reyes',
    focus: 'treatment' as const,
    days: 30,
    now,
    entries,
    treatments: [treatment],
    appointments: [
      {
        id: 'a1',
        title: 'Blood test',
        startsAt: new Date(2026, 9, 28, 8),
        location: null,
        notes: null,
        treatmentId: 't1',
      },
    ],
    includeNotes: false,
  };

  it('has the right content', () => {
    expect(summarySections(buildSummary(input))).toEqual([
      {
        title: 'About',
        lines: [
          'Ana Reyes',
          'Going through treatment',
          'Covers September 25, 2026 to October 24, 2026',
        ],
      },
      {
        title: 'Check-ins',
        lines: [
          '4 check-ins',
          'Mood: 3.5 of 5 on average (good)',
          'Pain: 3.5 of 10 on average',
          'Energy: 5.5 of 10 on average',
          'Sleep: 3 of 5 on average (fair)',
          'Pain over the period: better',
          'Energy over the period: better',
        ],
      },
      { title: 'Most common symptoms', lines: ['Nausea: 2 days', 'Fatigue: 1 day'] },
      {
        title: 'Treatments',
        lines: ['Chemotherapy: Chemotherapy, started Jul 1, 2026, 3 of 6 sessions'],
      },
      { title: 'Upcoming appointments', lines: ['Blood test: October 28, 2026, 8:00 AM'] },
    ]);
  });

  it('leaves notes out unless asked, and escapes them in the PDF', () => {
    const withNotes = buildSummary({ ...input, includeNotes: true });
    expect(summarySections(withNotes).at(-1)).toEqual({
      title: 'Notes',
      lines: ['Oct 15, 2026: Felt <better> today'],
    });
    expect(summaryHtml(withNotes)).toContain('Felt &lt;better&gt; today');
    expect(summaryHtml(buildSummary(input))).not.toContain('Felt');
  });

  it('includes patient questions for the doctor when provided', () => {
    const withQuestions = buildSummary({
      ...input,
      questions: ['How can I manage peripheral neuropathy?', 'Is fatigue normal after cycle 3?'],
    });
    const sections = summarySections(withQuestions);
    const questionsSection = sections.find((s) => s.title === 'Questions for my doctor');
    expect(questionsSection).toBeDefined();
    expect(questionsSection?.lines).toEqual([
      'How can I manage peripheral neuropathy?',
      'Is fatigue normal after cycle 3?',
    ]);

    const html = summaryHtml(withQuestions);
    expect(html).toContain('Key Questions for the Doctor');
    expect(html).toContain('How can I manage peripheral neuropathy?');
    expect(html).toContain('Average Pain');
    expect(html).toContain('Average Energy');
  });
});
