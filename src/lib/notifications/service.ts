import { router } from 'expo-router';
import { Platform } from 'react-native';

import { userAge, userGender } from '@/api/auth';
import { getTipOfTheDay } from '@/api/healthTips';
import type { HealthTip } from '@/types/healthTip';
import { queryKeys } from '@/hooks/queryKeys';
import { parseDbTimestamp } from '@/lib/dates';
import { focusFromMetadata, usesJourney } from '@/lib/focus';
import { queryClient } from '@/lib/queryClient';
import { checkItems } from '@/lib/checks';
import { cancerAppliesToSex, defaultFollowed } from '@/lib/screening';
import { chosenGuides, isSnoozed, selfCheckReminderDate } from '@/lib/selfCheck';
import { useAuthStore } from '@/stores/authStore';
import {
  useNotificationPrefs,
  type NotificationType,
  type ReminderTime,
} from '@/stores/notificationStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';
import { lightPalette } from '@/theme/palette';
import type { Appointment } from '@/types/appointment';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

import * as device from './device';
import type { DeliveredNotification } from './device';
import {
  IDENTIFIER_PREFIX,
  NotificationKind,
  SCHEDULED_PREF_TYPES,
  appointmentReminder,
  appointmentReminderDate,
  isCurrentReminder,
  isScheduledPrefType,
  remindersForType,
  screeningReminder,
  type ScheduledPrefType,
  type SelfCheckPlan,
} from './reminders';

// Scheduling started as a port of lib/services/notification_service.dart and the
// splash screen's `_initializeNotifications`. The in-app notification center was
// removed in the redesign: the phone's own notification list is enough.

/** Local reminders only exist in the iOS and Android apps. */
export const REMINDERS_SUPPORTED = Platform.OS !== 'web';

async function cancelType(type: ScheduledPrefType): Promise<void> {
  const prefix = IDENTIFIER_PREFIX[type];
  const identifiers = (await device.scheduledIdentifiers()).filter((id) => id.startsWith(prefix));
  await device.cancelReminders(identifiers);
}

/**
 * The soonest of the person's checks (design refresh Phase 24: the body check, a test or
 * the signs check), once the guides have loaded.
 */
function selfCheckPlan(now: Date = new Date()): SelfCheckPlan | null {
  const guides = queryClient.getQueryData<SelfCheckGuide[]>(queryKeys.selfCheckGuides);
  if (!guides?.length) return null;
  const state = useSelfCheckStore.getState();
  const user = useAuthStore.getState().user;
  const sex = userGender(user);
  const age = userAge(user);
  // shortcut: a survivor's own cancer isn't left out here (the cancer list may not be
  // loaded); it only affects which check the reminder names, if they follow it.
  const followed = (state.followed ?? defaultFollowed(sex, age)).filter((key) =>
    cancerAppliesToSex(key, sex),
  );
  const soonest = checkItems({
    guides: chosenGuides(guides, followed),
    followed,
    age,
    answers: state.answers,
    sex,
    state,
    now,
  }).find((item) => item.due !== null);
  if (!soonest?.due) return null;
  const snoozed = isSnoozed(state, now) ? parseDbTimestamp(state.snoozedUntil!) : null;
  return {
    guideTitle: soonest.title,
    date: selfCheckReminderDate(
      soonest.due,
      snoozed,
      now,
      useNotificationPrefs.getState().times.self_check,
    ),
  };
}

/** The check-in reminder is for Journey users only (Treatment daily, Finished weekly). */
function wantsCheckInReminder(): boolean {
  const { user } = useAuthStore.getState();
  return user !== null && usesJourney(focusFromMetadata(user));
}

/** Check reminders aren't for people in treatment: their checks are their care team's. */
function wantsSelfCheckReminder(): boolean {
  return focusFromMetadata(useAuthStore.getState().user) !== 'treatment';
}

/** Appointments already loaded for the signed-in person (Journey), soonest first. */
function cachedAppointments(): Appointment[] {
  const userId = useAuthStore.getState().user?.id ?? null;
  return queryClient.getQueryData<Appointment[]>(queryKeys.appointments(userId)) ?? [];
}

/** Replaces a type's reminders with its current schedule, at the time set in Settings. */
async function scheduleType(type: ScheduledPrefType): Promise<void> {
  await cancelType(type);
  if (type === 'daily_checkin' && !wantsCheckInReminder()) return;
  if (type === 'self_check' && !wantsSelfCheckReminder()) return;
  const now = new Date();
  const reminders = remindersForType(type, {
    now,
    times: useNotificationPrefs.getState().times,
    selfCheckPlan: type === 'self_check' ? selfCheckPlan(now) : null,
    appointments: type === 'appointments' ? cachedAppointments() : undefined,
    tip: type === 'weekly_tip' ? withSource(getTipOfTheDay(now)) : undefined,
    weeklyCheckIn: focusFromMetadata(useAuthStore.getState().user) === 'finished',
  });
  for (const reminder of reminders) await device.scheduleReminder(reminder);
}

const withSource = ({ tip, source }: HealthTip) => `${tip} (Source: ${source})`;

/** Changes when one reminder fires; only that type is rescheduled. */
export async function setReminderTime(type: NotificationType, time: ReminderTime): Promise<void> {
  useNotificationPrefs.getState().setTime(type, time);
  const prefs = useNotificationPrefs.getState();
  if (!REMINDERS_SUPPORTED || !prefs.enabled || !prefs.types[type] || !isScheduledPrefType(type)) {
    return;
  }
  try {
    if (await device.hasPermission()) await scheduleType(type);
  } catch (error) {
    console.warn(`Failed to move the ${type} reminder`, error);
  }
}

/** Adds or removes the check-in and self-check reminders after the focus changes (if on). */
export async function rescheduleForFocus(): Promise<void> {
  const prefs = useNotificationPrefs.getState();
  if (!REMINDERS_SUPPORTED || !prefs.enabled) return;
  try {
    if (!(await device.hasPermission())) return;
    if (prefs.types.daily_checkin) await scheduleType('daily_checkin');
    if (prefs.types.self_check) await scheduleType('self_check');
  } catch (error) {
    console.warn('Failed to update the reminders for the focus', error);
  }
}

/** Moves the self-check reminder after a check is done or snoozed (if it is on). */
export async function rescheduleSelfCheckReminder(): Promise<void> {
  const prefs = useNotificationPrefs.getState();
  if (!REMINDERS_SUPPORTED || !prefs.enabled || !prefs.types.self_check) return;
  try {
    if (await device.hasPermission()) await scheduleType('self_check');
  } catch (error) {
    console.warn('Failed to reschedule the self-check reminder', error);
  }
}

/** Schedules every type that is switched on. */
async function scheduleFromPrefs(): Promise<void> {
  const { types } = useNotificationPrefs.getState();
  for (const type of SCHEDULED_PREF_TYPES) {
    if (types[type]) await scheduleType(type);
  }
}

/** Cancels reminders from removed types still scheduled on this phone. */
async function cancelRemovedReminders(): Promise<void> {
  const stale = (await device.scheduledIdentifiers()).filter((id) => !isCurrentReminder(id));
  if (stale.length) await device.cancelReminders(stale);
}

/** The default types on and scheduled (the weekly tip stays off until chosen). */
async function enableAll(): Promise<void> {
  useNotificationPrefs.getState().setAllTypes(true);
  await scheduleFromPrefs();
}

/** Everything cancelled and every type off. */
async function disableAll(): Promise<void> {
  useNotificationPrefs.getState().setAllTypes(false);
  await device.cancelAllReminders();
}

/** The "Push Notifications" master switch. */
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  useNotificationPrefs.getState().setEnabled(enabled);
  try {
    if (!enabled) {
      await disableAll();
      return;
    }
    if (!REMINDERS_SUPPORTED) {
      useNotificationPrefs.getState().setAllTypes(true);
      return;
    }
    if (await device.requestPermission()) {
      await enableAll();
      showToast('Notifications turned on', 'success');
    } else {
      showToast("Turn on notifications in your phone's Settings.", 'error');
    }
  } catch (error) {
    console.warn('Failed to update notifications', error);
    showToast("Couldn't update notifications. Try again.", 'error');
  }
}

/** One type's switch: schedules or cancels only that type. */
export async function setNotificationTypeEnabled(
  type: NotificationType,
  enabled: boolean,
): Promise<void> {
  useNotificationPrefs.getState().setType(type, enabled);
  if (!REMINDERS_SUPPORTED || !isScheduledPrefType(type)) return;
  try {
    if (!enabled) {
      await cancelType(type);
    } else if (useNotificationPrefs.getState().enabled && (await device.hasPermission())) {
      await scheduleType(type);
    }
  } catch (error) {
    console.warn(`Failed to update ${type} reminders`, error);
  }
}

/** Sets (or moves) the reminder the evening before an appointment. */
export async function scheduleAppointmentReminder(appointment: Appointment): Promise<void> {
  const prefs = useNotificationPrefs.getState();
  if (!REMINDERS_SUPPORTED || !prefs.enabled) return;
  try {
    await device.cancelReminders([`appointment-${appointment.id}`]);
    if (!prefs.types.appointments) return;
    const date = appointmentReminderDate(
      appointment.startsAt,
      new Date(),
      prefs.times.appointments,
    );
    if (date && (await device.hasPermission())) {
      await device.scheduleReminder(appointmentReminder(appointment, date));
    }
  } catch (error) {
    console.warn('Failed to schedule the appointment reminder', error);
  }
}

export async function cancelAppointmentReminder(appointmentId: string): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  try {
    await device.cancelReminders([`appointment-${appointmentId}`]);
  } catch (error) {
    console.warn('Failed to cancel the appointment reminder', error);
  }
}

/** A one-off screening reminder (`scheduleScreeningReminder`). */
export async function scheduleScreeningReminder(
  id: string,
  title: string,
  message: string,
  date: Date,
): Promise<void> {
  if (!REMINDERS_SUPPORTED || !(await device.hasPermission())) return;
  await device.scheduleReminder(screeningReminder(id, title, message, date));
}

/** Shows a notification now (development screen only). */
export async function sendTestNotification(): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  try {
    if (await device.requestPermission()) {
      await device.presentNow({
        identifier: `test-${Date.now()}`,
        title: 'Test notification',
        body: 'OncoSense notifications are working!',
        channelId: 'health_reminders',
        color: lightPalette.action,
        data: { type: NotificationKind.test, payload: NotificationKind.test },
      });
    }
  } catch (error) {
    console.warn('Failed to show test notification', error);
  }
}

/**
 * Runs once the user is signed in (the splash screen's `_initializeNotifications`):
 * the first time, asks for permission and schedules the defaults; after that,
 * cancels reminders from removed types and reschedules if the OS dropped them
 * (reinstall, restore, cleared data).
 */
export async function initializeNotifications(): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  try {
    await device.configureNotifications();
    await cancelRemovedReminders();
    const prefs = useNotificationPrefs.getState();
    if (!prefs.setupComplete) {
      if (await device.requestPermission()) {
        await enableAll();
        prefs.setSetupComplete();
      }
      return;
    }
    if (!prefs.enabled || !(await device.hasPermission())) return;
    if ((await device.scheduledIdentifiers()).length === 0) await scheduleFromPrefs();
  } catch (error) {
    console.warn('Failed to initialize notifications', error);
  }
}

/** The screen a notification opens. */
export function routeForNotification(type: string | null): '/journey' | '/today' {
  switch (type) {
    case NotificationKind.weeklyCheckIn:
    case NotificationKind.dailyCheckIn:
    case NotificationKind.appointment:
      return '/journey';
    // Due self-checks and screenings show on Today, with a Start button.
    default:
      return '/today';
  }
}

/** Opens the screen related to a tapped notification. */
export function handleNotificationTap(notification: DeliveredNotification): void {
  const { user, isGuest } = useAuthStore.getState();
  if (!user && !isGuest) return;
  router.push(routeForNotification(notification.type));
}

/** Listeners for the root layout. Returns a cleanup function. */
export function startNotificationListeners(): () => void {
  if (!REMINDERS_SUPPORTED) return () => {};
  // Also for guests: they can switch reminders on in Settings without signing in.
  device
    .configureNotifications()
    .then(cancelRemovedReminders)
    .catch((error) => console.warn(error));
  return device.onNotificationTapped(handleNotificationTap);
}
