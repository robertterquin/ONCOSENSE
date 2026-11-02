import type { Appointment } from '@/types/appointment';
import type { Treatment } from '@/types/treatment';

import { addDays, isSameDay } from './dates';
import { startOfDay } from './selfCheck';

// Today's treatment week (design refresh Phase 26): like the checks card, a week strip
// with the person's appointments, treatment sessions (appointments linked to a treatment)
// and the days they checked in. This week when something is on it (or nothing is coming
// up), otherwise the week of the next appointment.

export type WeekMark = 'treatment' | 'appointment' | 'checkIn';

export type WeekAppointment = Appointment & { treatment: Treatment | null };

export type TreatmentWeek = {
  days: { date: Date; marks: WeekMark[] }[];
  /** The week's appointments from today on, soonest first. */
  listed: WeekAppointment[];
  thisWeek: boolean;
};

export function treatmentWeek(
  appointments: Appointment[],
  treatments: Treatment[],
  checkIns: Date[],
  now: Date,
): TreatmentWeek {
  const today = startOfDay(now);
  // From the start of today, so this morning's appointment still shows.
  const upcoming = appointments
    .filter((appointment) => appointment.startsAt.getTime() >= today.getTime())
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const sunday = addDays(today, -today.getDay());
  const next = upcoming.length ? startOfDay(upcoming[0].startsAt) : today;
  const thisWeek = next.getTime() < addDays(sunday, 7).getTime();
  const weekStart = thisWeek ? sunday : addDays(next, -next.getDay());
  const weekEnd = addDays(weekStart, 7);
  const listed = upcoming
    .filter((appointment) => appointment.startsAt.getTime() < weekEnd.getTime())
    .map((appointment) => ({
      ...appointment,
      treatment: treatments.find((treatment) => treatment.id === appointment.treatmentId) ?? null,
    }));

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const onDay = listed.filter((appointment) => isSameDay(appointment.startsAt, date));
    const marks: WeekMark[] = [];
    if (onDay.some((appointment) => appointment.treatment)) marks.push('treatment');
    if (onDay.some((appointment) => !appointment.treatment)) marks.push('appointment');
    if (checkIns.some((day) => isSameDay(day, date))) marks.push('checkIn');
    return { date, marks };
  });
  return { days, listed, thisWeek };
}
