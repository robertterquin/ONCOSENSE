import type { NotificationType as PrefType } from '@/stores/notificationStore';

// The reminder schedule from lib/services/notification_service.dart: same channels,
// titles, bodies, times and payloads. Pure data, so it can be unit tested; device.ts
// hands it to expo-notifications.

/** Notification types stored in the history (Flutter's `NotificationType`). */
export const HistoryType = {
  healthTip: 'health_tip',
  hydration: 'hydration',
  movement: 'movement',
  sunProtection: 'sun_protection',
  selfCheck: 'self_check',
  screening: 'screening',
  forumReply: 'forum_reply',
  forumUpvote: 'forum_upvote',
  weeklyCheckIn: 'weekly_check_in',
  resourceUpdate: 'resource_update',
} as const;

export type ChannelImportance = 'high' | 'default';

/** Android channels from `_createNotificationChannels()`, with the same IDs. */
export const CHANNELS = [
  {
    id: 'health_reminders',
    name: 'Health Reminders',
    description: 'Daily health tips and cancer prevention reminders',
    importance: 'high',
  },
  {
    id: 'hydration_reminders',
    name: 'Hydration Reminders',
    description: 'Drink water reminders throughout the day',
    importance: 'default',
  },
  {
    id: 'movement_reminders',
    name: 'Movement Reminders',
    description: 'Reminders to stay active and take walks',
    importance: 'default',
  },
  {
    id: 'forum_notifications',
    name: 'Forum Notifications',
    description: 'Replies and upvotes on your questions',
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
    description: 'Weekly wellness check-in reminders',
    importance: 'default',
  },
] as const satisfies readonly {
  id: string;
  name: string;
  description: string;
  importance: ChannelImportance;
}[];

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
  /** History type and the Flutter payload string. */
  data: { type: string; payload: string; historyId?: string };
  trigger: ReminderTrigger;
};

/** Dart weekday (1 = Monday … 7 = Sunday) → expo-notifications weekday (1 = Sunday … 7 = Saturday). */
export function toExpoWeekday(dartWeekday: number): number {
  if (!Number.isInteger(dartWeekday) || dartWeekday < 1 || dartWeekday > 7) {
    throw new RangeError(`Invalid weekday: ${dartWeekday}`);
  }
  return (dartWeekday % 7) + 1;
}

const pad = (hour: number) => String(hour).padStart(2, '0');

/** Hours from `start` to `end` every `interval`, at most `max` (Flutter stops when it runs out of messages). */
function hourSlots(start: number, end: number, interval: number, max: number): number[] {
  const hours: number[] = [];
  for (let hour = start; hour <= end && hours.length < max; hour += interval) hours.push(hour);
  return hours;
}

export const HYDRATION_MESSAGES = [
  "💧 Don't forget to drink water!",
  '💧 Stay hydrated - have a glass of water',
  '💧 Time for a water break',
  '💧 Keep sipping! Hydration is key',
  '💧 Water time! Your body will thank you',
  '💧 Drink 8 glasses of water daily',
];

export const MOVEMENT_MESSAGES = [
  '🏃 Take a short walk to stay active!',
  '🏃 Time to stretch! Simple stretches reduce tension',
  '🏃 Stand up and move every hour',
  '🏃 Take the stairs instead of elevator',
  '🏃 A 3-minute walk break does wonders!',
];

/** The tip shown by the daily health tip (one of the health reminders). */
export type DailyTip = { id: string; title: string; message: string };

export function dailyHealthTip(tip: DailyTip, hour = 9, minute = 0): ReminderRequest {
  return {
    identifier: 'daily-tip',
    title: `💡 ${tip.title}`,
    body: tip.message,
    channelId: 'health_reminders',
    color: '#D81B60',
    data: { type: HistoryType.healthTip, payload: `${HistoryType.healthTip}:${tip.id}` },
    trigger: { kind: 'daily', hour, minute },
  };
}

export function hydrationReminders(
  startHour = 8,
  endHour = 20,
  intervalHours = 2,
): ReminderRequest[] {
  return hourSlots(startHour, endHour, intervalHours, HYDRATION_MESSAGES.length).map(
    (hour, index) => ({
      identifier: `hydration-${pad(hour)}`,
      title: '💧 Hydration Reminder',
      body: HYDRATION_MESSAGES[index],
      channelId: 'hydration_reminders',
      color: '#2196F3',
      data: { type: HistoryType.hydration, payload: `${HistoryType.hydration}:${hour}` },
      trigger: { kind: 'daily', hour, minute: 0 },
    }),
  );
}

export function movementReminders(
  startHour = 9,
  endHour = 18,
  intervalHours = 3,
): ReminderRequest[] {
  return hourSlots(startHour, endHour, intervalHours, MOVEMENT_MESSAGES.length).map(
    (hour, index) => ({
      identifier: `movement-${pad(hour)}`,
      title: '🏃 Movement Reminder',
      body: MOVEMENT_MESSAGES[index],
      channelId: 'movement_reminders',
      color: '#4CAF50',
      data: { type: HistoryType.movement, payload: `${HistoryType.movement}:${hour}` },
      // Flutter schedules movement reminders at half past the hour.
      trigger: { kind: 'daily', hour, minute: 30 },
    }),
  );
}

export function sunProtectionReminder(hour = 10): ReminderRequest {
  return {
    identifier: 'sun-protection',
    title: '☀️ Sun Protection Reminder',
    body: 'Avoid sun exposure from 10AM–3PM. Apply SPF 30+ sunscreen!',
    channelId: 'health_reminders',
    color: '#FFC107',
    data: { type: HistoryType.sunProtection, payload: HistoryType.sunProtection },
    trigger: { kind: 'daily', hour, minute: 0 },
  };
}

export function monthlySelfExamReminder(dayOfMonth = 1): ReminderRequest {
  return {
    identifier: 'self-check-monthly',
    title: '🩺 Monthly Self-Exam Reminder',
    body: "It's time for your monthly breast self-examination. Early detection saves lives!",
    channelId: 'screening_reminders',
    color: '#D81B60',
    data: { type: HistoryType.selfCheck, payload: HistoryType.selfCheck },
    trigger: { kind: 'monthly', day: dayOfMonth, hour: 9, minute: 0 },
  };
}

/** `dayOfWeek` uses Dart numbering (7 = Sunday). */
export function weeklyCheckInReminder(dayOfWeek = 7, hour = 10): ReminderRequest {
  return {
    identifier: 'weekly-checkin',
    title: '💗 Weekly Wellness Check-in',
    body: 'How are you feeling today? Take a moment to reflect on your well-being.',
    channelId: 'wellness_check_in',
    color: '#9C27B0',
    data: { type: HistoryType.weeklyCheckIn, payload: HistoryType.weeklyCheckIn },
    trigger: { kind: 'weekly', weekday: dayOfWeek, hour, minute: 0 },
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
    data: { type: HistoryType.screening, payload: `${HistoryType.screening}:${id}` },
    trigger: { kind: 'date', date },
  };
}

/** Preference types that schedule reminders (forum notifications are never sent; see the decision log). */
export const SCHEDULED_PREF_TYPES = [
  'health_tips',
  'hydration',
  'movement',
  'sun_protection',
  'self_check',
  'weekly_checkin',
] as const satisfies readonly PrefType[];

export type ScheduledPrefType = (typeof SCHEDULED_PREF_TYPES)[number];

export function isScheduledPrefType(type: PrefType): type is ScheduledPrefType {
  return (SCHEDULED_PREF_TYPES as readonly PrefType[]).includes(type);
}

/** The reminders a preference type schedules with Flutter's defaults. */
export function remindersForType(type: ScheduledPrefType, tip: DailyTip): ReminderRequest[] {
  switch (type) {
    case 'health_tips':
      return [dailyHealthTip(tip)];
    case 'hydration':
      return hydrationReminders();
    case 'movement':
      return movementReminders();
    case 'sun_protection':
      return [sunProtectionReminder()];
    case 'self_check':
      return [monthlySelfExamReminder()];
    case 'weekly_checkin':
      return [weeklyCheckInReminder()];
  }
}

/** Identifier prefixes per type, to cancel a type's reminders without the full list. */
export const IDENTIFIER_PREFIX: Record<ScheduledPrefType, string> = {
  health_tips: 'daily-tip',
  hydration: 'hydration-',
  movement: 'movement-',
  sun_protection: 'sun-protection',
  self_check: 'self-check-',
  weekly_checkin: 'weekly-checkin',
};

/** iOS keeps at most 64 pending local notifications per app. */
export const IOS_PENDING_LIMIT = 64;
