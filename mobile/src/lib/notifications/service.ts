import { router } from 'expo-router';
import { Platform } from 'react-native';

import { fetchActiveReminders } from '@/api/healthReminders';
import { DEFAULT_REMINDERS } from '@/constants/defaultReminders';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationHistory } from '@/stores/notificationHistoryStore';
import { useNotificationPrefs, type NotificationType } from '@/stores/notificationStore';
import { showToast } from '@/stores/toastStore';

import * as device from './device';
import type { DeliveredNotification } from './device';
import {
  HistoryType,
  IDENTIFIER_PREFIX,
  SCHEDULED_PREF_TYPES,
  isScheduledPrefType,
  remindersForType,
  screeningReminder,
  type DailyTip,
  type ScheduledPrefType,
} from './reminders';

// Port of the scheduling side of lib/services/notification_service.dart and the
// splash screen's `_initializeNotifications`.

/** Local reminders only exist in the iOS and Android apps. */
export const REMINDERS_SUPPORTED = Platform.OS !== 'web';

async function pickDailyTip(): Promise<DailyTip> {
  const reminders = await fetchActiveReminders();
  const pool = reminders.length ? reminders : DEFAULT_REMINDERS;
  const tip = pool[Math.floor(Math.random() * pool.length)];
  return { id: tip.id, title: tip.title, message: tip.message };
}

async function cancelType(type: ScheduledPrefType): Promise<void> {
  const prefix = IDENTIFIER_PREFIX[type];
  const identifiers = (await device.scheduledIdentifiers()).filter((id) => id.startsWith(prefix));
  await device.cancelReminders(identifiers);
}

/** Replaces a type's reminders with Flutter's default schedule. */
async function scheduleType(type: ScheduledPrefType): Promise<void> {
  await cancelType(type);
  const tip = type === 'health_tips' ? await pickDailyTip() : { id: '', title: '', message: '' };
  for (const reminder of remindersForType(type, tip)) await device.scheduleReminder(reminder);
}

/** Schedules every type that is switched on. */
async function scheduleFromPrefs(): Promise<void> {
  const { types } = useNotificationPrefs.getState();
  for (const type of SCHEDULED_PREF_TYPES) {
    if (types[type]) await scheduleType(type);
  }
}

/** `enableAllNotifications`: every type on and scheduled. */
async function enableAll(): Promise<void> {
  useNotificationPrefs.getState().setAllTypes(true);
  for (const type of SCHEDULED_PREF_TYPES) await scheduleType(type);
}

/** `disableAllNotifications`: everything cancelled and every type off. */
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

/** One type's switch (`toggleNotificationType`): schedules or cancels only that type. */
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

/**
 * `showTestNotification`: shows a notification now and adds it to the notification
 * center. On the web only the history entry is added.
 */
export async function sendTestNotification(): Promise<void> {
  const historyId = `test-${Date.now()}`;
  const title = '🧪 Test Notification';
  const body = 'OncoSense notifications are working!';
  useNotificationHistory
    .getState()
    .add({ id: historyId, title, body, type: HistoryType.healthTip, payload: 'test' });
  if (!REMINDERS_SUPPORTED) return;
  try {
    if (await device.requestPermission()) {
      await device.presentNow({
        identifier: historyId,
        title,
        body,
        channelId: 'health_reminders',
        color: '#D81B60',
        data: { type: HistoryType.healthTip, payload: 'test', historyId },
      });
    }
  } catch (error) {
    console.warn('Failed to show test notification', error);
  }
}

/**
 * Runs once the user is signed in (the splash screen's `_initializeNotifications`):
 * the first time, asks for permission and schedules the defaults; after that,
 * reschedules if the OS dropped the reminders (reinstall, restore, cleared data).
 */
export async function initializeNotifications(): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  try {
    await device.configureNotifications();
    await recordPresentedNotifications();
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

/**
 * The Home screen's sample notifications (`_addSampleNotifications`), so the
 * notification center isn't empty on first use. Flutter re-added them whenever the
 * history was empty, which undid "Clear all"; here they are only added once.
 */
export function addSampleNotificationsOnce(): void {
  const history = useNotificationHistory.getState();
  if (history.samplesAdded) return;
  history.setSamplesAdded();
  if (history.notifications.length > 0) return;
  const samples = [
    {
      title: '💡 Daily Health Tip',
      body: 'Drink at least 8 glasses of water daily to help reduce cancer risk and maintain overall health.',
      type: HistoryType.healthTip,
    },
    {
      title: '💧 Hydration Reminder',
      body: 'Time to drink water! Stay hydrated throughout the day.',
      type: HistoryType.hydration,
    },
    {
      title: '🚶 Movement Reminder',
      body: 'Take a 5-minute walk break. Regular movement helps reduce cancer risk!',
      type: HistoryType.movement,
    },
  ];
  const now = Date.now();
  // Flutter added them in this order, so the last one is newest.
  samples.forEach((sample, index) => history.add({ ...sample, timestamp: new Date(now + index) }));
}

// --- History and taps -------------------------------------------------------------

function historyIdFor(notification: DeliveredNotification): string {
  return notification.historyId ?? `${notification.identifier}@${notification.date.getTime()}`;
}

/** Adds a delivered notification to the notification center (once). */
export function recordDelivered(notification: DeliveredNotification): string {
  const id = historyIdFor(notification);
  const history = useNotificationHistory.getState();
  if (!history.notifications.some((n) => n.id === id)) {
    history.add({
      id,
      title: notification.title,
      body: notification.body,
      type: notification.type ?? HistoryType.healthTip,
      payload: notification.payload,
      timestamp: notification.date,
    });
  }
  return id;
}

/** Reminders delivered while the app was closed are still in the system tray. */
async function recordPresentedNotifications(): Promise<void> {
  for (const notification of await device.presentedNotifications()) recordDelivered(notification);
}

/** The screen a notification opens (Flutter only logged taps). */
export function routeForNotification(
  type: string | null,
  payload: string | null,
): '/notifications' | '/journey' | '/prevention' | `/forum/${string}` {
  switch (type) {
    case HistoryType.weeklyCheckIn:
      return '/journey';
    case HistoryType.selfCheck:
    case HistoryType.screening:
      return '/prevention';
    case HistoryType.forumReply:
    case HistoryType.forumUpvote: {
      const questionId = payload?.split(':')[1];
      return questionId ? `/forum/${questionId}` : '/notifications';
    }
    default:
      return '/notifications';
  }
}

/** Records it, marks it read and opens the related screen. */
export function handleNotificationTap(notification: DeliveredNotification): void {
  const id = recordDelivered(notification);
  useNotificationHistory.getState().markAsRead(id);
  const { user, isGuest } = useAuthStore.getState();
  if (!user && !isGuest) return;
  router.push(routeForNotification(notification.type, notification.payload));
}

/** Listeners for the root layout. Returns a cleanup function. */
export function startNotificationListeners(): () => void {
  if (!REMINDERS_SUPPORTED) return () => {};
  device.configureNotifications().catch((error) => console.warn(error));
  const stopReceived = device.onNotificationReceived(recordDelivered);
  const stopTapped = device.onNotificationTapped(handleNotificationTap);
  return () => {
    stopReceived();
    stopTapped();
  };
}
