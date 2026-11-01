import { parseDbTimestamp, toDbTimestamp } from '@/lib/dates';

import { optionalString, requireString, type Row } from './row';

/** A dated appointment in Journey (`journey_appointments`, redesign Phase 4). */
export type Appointment = {
  id: string;
  title: string;
  /** Local wall-clock time, like the other journey dates. */
  startsAt: Date;
  location: string | null;
  notes: string | null;
  /** The treatment it belongs to, if any. */
  treatmentId: string | null;
};

export function appointmentFromRow(row: Row): Appointment {
  return {
    id: requireString(row, 'id'),
    title: requireString(row, 'title'),
    startsAt: parseDbTimestamp(requireString(row, 'starts_at')),
    location: optionalString(row, 'location'),
    notes: optionalString(row, 'notes'),
    treatmentId: optionalString(row, 'treatment_id'),
  };
}

/** Columns for `journey_appointments`; the API layer adds `user_id`. */
export function appointmentToRow(appointment: Appointment): Row {
  return {
    id: appointment.id,
    title: appointment.title,
    starts_at: toDbTimestamp(appointment.startsAt),
    location: appointment.location,
    notes: appointment.notes,
    treatment_id: appointment.treatmentId,
  };
}

/** Appointments from now on, soonest first. */
export function upcomingAppointments(list: Appointment[], now: Date = new Date()): Appointment[] {
  return list
    .filter((appointment) => appointment.startsAt.getTime() >= now.getTime())
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

/** The first appointment within the next 24 hours (Today's next step), if any. */
export function appointmentWithinDay(
  list: Appointment[],
  now: Date = new Date(),
): Appointment | null {
  const next = upcomingAppointments(list, now)[0];
  return next && next.startsAt.getTime() - now.getTime() <= 86_400_000 ? next : null;
}
