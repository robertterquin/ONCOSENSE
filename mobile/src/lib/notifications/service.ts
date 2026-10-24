import { router } from 'expo-router';
import { Platform } from 'react-native';

import { useAuthStore } from '@/stores/authStore';
import { useNotificationPrefs, type NotificationType } from '@/stores/notificationStore';
import { showToast } from '@/stores/toastStore';

import * as device from './device';
import type { DeliveredNotification } from './device';
import {
  IDENTIFIER_PREFIX,
  NotificationKind,
  SCHEDULED_PREF_TYPES,
  isCurrentReminder,
  isScheduledPrefType,
  remindersForType,
  screeningReminder,
  type ScheduledPrefType,
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

/** Replaces a type's reminders with its default schedule. */
async function scheduleType(type: ScheduledPrefType): Promise<void> {
  await cancelType(type);
  for (const reminder of remindersForType(type)) await device.scheduleReminder(reminder);
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

/** Every type on and scheduled. */
async function enableAll(): Promise<void> {
  useNotificationPrefs.getState().setAllTypes(true);
  for (const type of SCHEDULED_PREF_TYPES) await scheduleType(type);
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
      showToast('✅ Notifications enabled successfully!', 'success');
    } else {
      showToast('Please enable notifications in your device settings', 'error');
    }
  } catch (error) {
    console.warn('Failed to update notifications', error);
    showToast('Could not update notifications. Please try again.', 'error');
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
        title: '🧪 Test Notification',
        body: 'OncoSense notifications are working!',
        channelId: 'health_reminders',
        color: '#D81B60',
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
export function routeForNotification(type: string | null): '/journey' | '/learn' | '/today' {
  switch (type) {
    case NotificationKind.weeklyCheckIn:
      return '/journey';
    case NotificationKind.selfCheck:
    case NotificationKind.screening:
      return '/learn';
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
  device.configureNotifications().catch((error) => console.warn(error));
  return device.onNotificationTapped(handleNotificationTap);
}
