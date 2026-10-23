import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { CHANNELS, toExpoWeekday, type ReminderRequest, type ReminderTrigger } from './reminders';

// The only module that talks to expo-notifications (device.web.ts replaces it on the web,
// where local notifications aren't supported). Replaces flutter_local_notifications.

/** A notification that was shown on the device. */
export type DeliveredNotification = {
  /** The request identifier (e.g. `hydration-08`); one per reminder slot. */
  identifier: string;
  date: Date;
  title: string;
  body: string;
  type: string | null;
  payload: string | null;
  /** Set on one-off notifications that were already added to the history when sent. */
  historyId: string | null;
};

let configured = false;

/** Shows notifications while the app is open and creates the Android channels. */
export async function configureNotifications(): Promise<void> {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Promise.all(
      CHANNELS.map((channel) =>
        Notifications.setNotificationChannelAsync(channel.id, {
          name: channel.name,
          description: channel.description,
          importance:
            channel.importance === 'high' ? AndroidImportance.HIGH : AndroidImportance.DEFAULT,
          enableVibrate: true,
        }),
      ),
    );
  }
}

export async function hasPermission(): Promise<boolean> {
  return (await Notifications.getPermissionsAsync()).granted;
}

export async function requestPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

function toTrigger(
  trigger: ReminderTrigger,
  channelId: string,
): Notifications.NotificationTriggerInput {
  // Delivery stays 'bestEffort' (inexact): exact alarms need SCHEDULE_EXACT_ALARM, which
  // Android 14 denies by default and Google Play limits to alarm and calendar apps.
  switch (trigger.kind) {
    case 'daily':
      return {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: trigger.hour,
        minute: trigger.minute,
        channelId,
      };
    case 'weekly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: toExpoWeekday(trigger.weekday),
        hour: trigger.hour,
        minute: trigger.minute,
        channelId,
      };
    case 'monthly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: trigger.day,
        hour: trigger.hour,
        minute: trigger.minute,
        channelId,
      };
    case 'date':
      return {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger.date,
        channelId,
      };
  }
}

/** Schedules (or replaces, by identifier) one reminder. */
export async function scheduleReminder(request: ReminderRequest): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: request.identifier,
    content: {
      title: request.title,
      body: request.body,
      data: request.data,
      color: request.color,
      sound: 'default',
    },
    trigger: toTrigger(request.trigger, request.channelId),
  });
}

/** Shows a notification now (test notification). Returns false where that isn't possible. */
export async function presentNow(request: Omit<ReminderRequest, 'trigger'>): Promise<boolean> {
  await Notifications.scheduleNotificationAsync({
    identifier: request.identifier,
    content: {
      title: request.title,
      body: request.body,
      data: request.data,
      color: request.color,
      sound: 'default',
    },
    // A channel-only trigger delivers right away on that Android channel.
    trigger: Platform.OS === 'android' ? { channelId: request.channelId } : null,
  });
  return true;
}

export async function scheduledIdentifiers(): Promise<string[]> {
  const requests = await Notifications.getAllScheduledNotificationsAsync();
  return requests.map((request) => request.identifier);
}

/** Pending reminders with a readable trigger, for the development check screen. */
export async function scheduledSummary(): Promise<{ identifier: string; trigger: string }[]> {
  const requests = await Notifications.getAllScheduledNotificationsAsync();
  return requests.map((request) => {
    const { channelId: _channelId, ...trigger } = (request.trigger ?? {}) as Record<
      string,
      unknown
    >;
    return { identifier: request.identifier, trigger: JSON.stringify(trigger) };
  });
}

export async function cancelReminders(identifiers: string[]): Promise<void> {
  await Promise.all(
    identifiers.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier)),
  );
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function toDelivered(notification: Notifications.Notification): DeliveredNotification {
  const { content, identifier } = notification.request;
  const data = (content.data ?? {}) as Record<string, unknown>;
  return {
    identifier,
    date: new Date(notification.date),
    title: content.title ?? '',
    body: content.body ?? '',
    type: typeof data.type === 'string' ? data.type : null,
    payload: typeof data.payload === 'string' ? data.payload : null,
    historyId: typeof data.historyId === 'string' ? data.historyId : null,
  };
}

/** Notifications still in the system tray (delivered while the app was closed). */
export async function presentedNotifications(): Promise<DeliveredNotification[]> {
  return (await Notifications.getPresentedNotificationsAsync()).map(toDelivered);
}

/** Calls `listener` for each notification received while the app is open. */
export function onNotificationReceived(
  listener: (notification: DeliveredNotification) => void,
): () => void {
  const subscription = Notifications.addNotificationReceivedListener((notification) =>
    listener(toDelivered(notification)),
  );
  return () => subscription.remove();
}

/** Calls `listener` when the user taps a notification, including the one that opened the app. */
export function onNotificationTapped(
  listener: (notification: DeliveredNotification) => void,
): () => void {
  const handle = (response: Notifications.NotificationResponse) => {
    if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      listener(toDelivered(response.notification));
    }
  };
  let active = true;
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (active && response) {
      handle(response);
      Notifications.clearLastNotificationResponseAsync();
    }
  });
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  return () => {
    active = false;
    subscription.remove();
  };
}
