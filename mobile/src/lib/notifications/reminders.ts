import { formatTime } from '@/lib/dates';
import type { NotificationType as PrefType } from '@/stores/notificationStore';

// The reminder schedule, as pure data so it can be unit tested; device.ts hands it to
// expo-notifications. Started as a port of lib/services/notification_service.dart; the
// redesign (docs/redesign) dropped the daily tip, hydration, movement and sun
// reminders, keeping only reminders about checking yourself and checking in.

/** `data.type` on each notification; decides which screen a tap opens. */
export const NotificationKind = {
  selfCheck: 'self_check',
  screening: 'screening',
  appointment: 'appointment',
  /** Before redesign Phase 4; still routed for notifications already delivered. */
  weeklyCheckIn: 'weekly_check_in',
  dailyCheckIn: 'daily_check_in',
  test: 'test',
} as const;

export type ChannelImportance = 'high' | 'default';

/** Android channels, with the IDs the Flutter app used. */
export const CHANNELS = [
  {
    id: 'health_reminders',
    name: 'Health Reminders',
    description: 'Health tips and cancer prevention reminders',
    importance: 'high',
  },
  {
    id: 'screening_reminders',
    name: 'Screening Reminders',
    description: 'Self-check and screening appointment reminders',
    importance: 'high',
  },
  {
    id: 'wellness_check_in',
    name: 'Wellness Check-in',
    description: 'Check-in reminders',
    importance: 'default',
  },
] as const satisfies readonly {
  id: string;
  name: string;
  description: string;
  importance: ChannelImportance;
}[];

/** Channels created by earlier versions; removed from Android settings on start. */
export const OBSOLETE_CHANNEL_IDS = [
  'hydration_reminders',
  'movement_reminders',
  'forum_notifications',
] as const;

export type ChannelId = (typeof CHANNELS)[number]['id'];

export type ReminderTrigger =
  | { kind: 'daily'; hour: number; minute: number }
  /** `weekday` uses Dart numbering: 1 = Monday … 7 = Sunday. */
  | { kind: 'weekly'; weekday: number; hour: number; minute: number }
  | { kind: 'monthly'; day: number; hour: number; minute: number }
  | { kind: 'date'; date: Date };

export type ReminderRequest = {
  /** Stable ID, so one reminder can be cancelled or replaced without touching others. */
  identifier: string;
  title: string;
  body: string;
  channelId: ChannelId;
  /** Android accent color. */
  color: string;
  /** Notification kind and payload string. */
  data: { type: string; payload: string };
  trigger: ReminderTrigger;
};

/** Dart weekday (1 = Monday … 7 = Sunday) → expo-notifications weekday (1 = Sunday … 7 = Saturday). */
export function toExpoWeekday(dartWeekday: number): number {
  if (!Number.isInteger(dartWeekday) || dartWeekday < 1 || dartWeekday > 7) {
    throw new RangeError(`Invalid weekday: ${dartWeekday}`);
  }
  return (dartWeekday % 7) + 1;
}

export function monthlySelfExamReminder(dayOfMonth = 1): ReminderRequest {
  return {
    identifier: 'self-check-monthly',
    title: '🩺 Monthly Self-Exam Reminder',
    body: "It's time for your monthly breast self-examination. Early detection saves lives!",
    channelId: 'screening_reminders',
    color: '#D81B60',
    data: { type: NotificationKind.selfCheck, payload: NotificationKind.selfCheck },
    trigger: { kind: 'monthly', day: dayOfMonth, hour: 9, minute: 0 },
  };
}

/** The next self-check, on the day it is due (redesign Phase 3). */
export function selfCheckReminder(guideTitle: string, date: Date): ReminderRequest {
  return {
    identifier: 'self-check-next',
    title: 'Time for a self-check',
    body: `${guideTitle} is due today. It takes about 10 minutes.`,
    channelId: 'screening_reminders',
    color: '#D81B60',
    data: { type: NotificationKind.selfCheck, payload: NotificationKind.selfCheck },
    trigger: { kind: 'date', date },
  };
}

/** What the self-check reminder needs: the soonest chosen guide and when to remind. */
export type SelfCheckPlan = { guideTitle: string; date: Date };

/** Every evening for Journey users (redesign Phase 4; replaced the weekly check-in). */
export function dailyCheckInReminder(hour = 20): ReminderRequest {
  return {
    identifier: 'daily-checkin',
    title: 'How was today?',
    body: 'A one-minute check-in helps you and your doctor see how things change.',
    channelId: 'wellness_check_in',
    color: '#5236B5',
    data: { type: NotificationKind.dailyCheckIn, payload: NotificationKind.dailyCheckIn },
    trigger: { kind: 'daily', hour, minute: 0 },
  };
}

/** A one-off screening reminder (`scheduleScreeningReminder`). */
export function screeningReminder(
  id: string,
  title: string,
  message: string,
  date: Date,
): ReminderRequest {
  return {
    identifier: `screening-${id}`,
    title: `🏥 ${title}`,
    body: message,
    channelId: 'screening_reminders',
    color: '#E91E63',
    data: { type: NotificationKind.screening, payload: `${NotificationKind.screening}:${id}` },
    trigger: { kind: 'date', date },
  };
}

/** 6:00 PM the day before an appointment, or null when that time has passed. */
export function appointmentReminderDate(startsAt: Date, now: Date = new Date()): Date | null {
  const at = new Date(startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate() - 1, 18, 0);
  return at.getTime() > now.getTime() ? at : null;
}

/** The evening before an appointment (redesign Phase 4). */
export function appointmentReminder(
  appointment: { id: string; title: string; startsAt: Date; location: string | null },
  date: Date,
): ReminderRequest {
  const where = appointment.location ? ` at ${appointment.location}` : '';
  return {
    identifier: `appointment-${appointment.id}`,
    title: 'Appointment tomorrow',
    body: `${appointment.title}, ${formatTime(appointment.startsAt)}${where}.`,
    channelId: 'screening_reminders',
    color: '#5236B5',
    data: {
      type: NotificationKind.appointment,
      payload: `${NotificationKind.appointment}:${appointment.id}`,
    },
    trigger: { kind: 'date', date },
  };
}

/** Preference types that schedule reminders. */
export const SCHEDULED_PREF_TYPES = [
  'self_check',
  'daily_checkin',
] as const satisfies readonly PrefType[];

export type ScheduledPrefType = (typeof SCHEDULED_PREF_TYPES)[number];

export function isScheduledPrefType(type: PrefType): type is ScheduledPrefType {
  return (SCHEDULED_PREF_TYPES as readonly PrefType[]).includes(type);
}

/**
 * The reminders a preference type schedules. Self-checks remind on the next due day
 * when the guides are known, else on the 1st of each month.
 */
export function remindersForType(
  type: ScheduledPrefType,
  selfCheckPlan: SelfCheckPlan | null = null,
): ReminderRequest[] {
  switch (type) {
    case 'self_check':
      return [
        selfCheckPlan
          ? selfCheckReminder(selfCheckPlan.guideTitle, selfCheckPlan.date)
          : monthlySelfExamReminder(),
      ];
    case 'daily_checkin':
      return [dailyCheckInReminder()];
  }
}

/** Identifier prefixes per type, to cancel a type's reminders without the full list. */
export const IDENTIFIER_PREFIX: Record<ScheduledPrefType, string> = {
  self_check: 'self-check-',
  daily_checkin: 'daily-checkin',
};

/**
 * True for reminders this version still schedules. Anything else on the device (the
 * removed hydration, movement, sun and daily-tip reminders) gets cancelled on start.
 */
export function isCurrentReminder(identifier: string): boolean {
  return (
    Object.values(IDENTIFIER_PREFIX).some((prefix) => identifier.startsWith(prefix)) ||
    identifier.startsWith('screening-') ||
    identifier.startsWith('appointment-')
  );
}

/** iOS keeps at most 64 pending local notifications per app. */
export const IOS_PENDING_LIMIT = 64;
