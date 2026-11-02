import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/ui';
import { addDays, formatShortMonthDay, formatTime, isSameDay } from '@/lib/dates';
import { formatMonth, formatWeekdayDate, startOfDay } from '@/lib/selfCheck';
import { treatmentWeek, type WeekAppointment, type WeekMark } from '@/lib/treatmentWeek';
import type { Appointment } from '@/types/appointment';
import { treatmentTypeLabel, type Treatment } from '@/types/treatment';

import { CalendarCard, CalendarRow, calendarStyles, WeekStrip, type DotKind } from './CalendarCard';

// Today's treatment week for people in treatment (design refresh Phase 26), the calendar
// card the checks card has: treatment sessions, appointments and check-in days, and the
// week's appointments underneath. With nothing coming up, this week's check-ins and a
// way to add the next session.

const MAX_LISTED = 3;

const KINDS: DotKind<WeekMark>[] = [
  { kind: 'treatment', color: 'sun', label: 'Treatment' },
  { kind: 'appointment', color: 'onPanelAccent', label: 'Appointment' },
  { kind: 'checkIn', color: 'help', label: 'Checked in' },
];

const openAppointment = (appointment: Appointment) =>
  router.push({ pathname: '/journey/appointment', params: { id: appointment.id } });

type TreatmentWeekCardProps = {
  appointments: Appointment[];
  treatments: Treatment[];
  checkIns: Date[];
  now: Date;
};

export function TreatmentWeekCard({
  appointments,
  treatments,
  checkIns,
  now,
}: TreatmentWeekCardProps) {
  const week = treatmentWeek(appointments, treatments, checkIns, now);
  const today = startOfDay(now);
  const first: WeekAppointment | undefined = week.listed[0];
  const soon = (appointment: WeekAppointment) =>
    isSameDay(appointment.startsAt, today)
      ? 'Today'
      : isSameDay(appointment.startsAt, addDays(today, 1))
        ? 'Tomorrow'
        : null;
  const where = (appointment: WeekAppointment) =>
    `${formatTime(appointment.startsAt)}${appointment.location ? `, ${appointment.location}` : ''}`;
  // A course with sessions counted ("Chemotherapy: 3 of 6 sessions done").
  const course = treatments.find((treatment) => treatment.isActive && treatment.totalSessions > 0);

  const progress = course
    ? `${treatmentTypeLabel(course.type)}: ${course.completedSessions} of ${course.totalSessions} sessions done.`
    : null;

  const title = !first
    ? 'Nothing scheduled'
    : soon(first)
      ? `${soon(first)}: ${first.title}`
      : week.thisWeek
        ? `${week.listed.length} appointment${week.listed.length === 1 ? '' : 's'} this week`
        : `Next: ${first.title}`;
  const body = !first
    ? `${progress ? `${progress} ` : ''}Add your next session or appointment to see it here.`
    : soon(first)
      ? `At ${where(first)}. Bring your questions and any notes.`
      : (progress ?? `On ${formatWeekdayDate(first.startsAt)}.`);

  return (
    <CalendarCard title={title} body={body}>
      <WeekStrip
        days={week.days}
        kinds={KINDS}
        highlight={week.thisWeek || !first ? today : startOfDay(first.startsAt)}
        caption={
          week.thisWeek || !first ? undefined : `Next appointment · ${formatMonth(first.startsAt)}`
        }
        accessibilityLabel={
          week.listed
            .map(
              (appointment) => `${appointment.title}, ${formatShortMonthDay(appointment.startsAt)}`,
            )
            .join('; ') || 'No appointments this week'
        }
      />
      <View>
        {week.listed.slice(0, MAX_LISTED).map((appointment) => (
          <CalendarRow
            key={appointment.id}
            color={appointment.treatment ? 'sun' : 'onPanelAccent'}
            title={appointment.title}
            detail={[
              `${soon(appointment) ?? formatShortMonthDay(appointment.startsAt)}, ${where(appointment)}`,
              // Tiredness is the most common side effect of chemotherapy (ACS).
              appointment.treatment?.type === 'chemotherapy' ? 'Plan some rest after' : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            highlighted={soon(appointment) !== null}
            accessibilityLabel={`${appointment.title}, ${formatShortMonthDay(appointment.startsAt)} at ${formatTime(appointment.startsAt)}`}
            onPress={() => openAppointment(appointment)}
          />
        ))}
        {week.listed.length > MAX_LISTED ? (
          <Button
            title={`${week.listed.length - MAX_LISTED} more`}
            variant="onPanelAccent"
            small
            style={calendarStyles.link}
            onPress={() => router.navigate('/journey')}
          />
        ) : null}
      </View>
      <Button
        title="Add an appointment"
        variant="onPanelAccent"
        small
        style={calendarStyles.link}
        onPress={() => router.push('/journey/appointment')}
      />
    </CalendarCard>
  );
}
