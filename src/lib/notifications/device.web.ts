import type { ReminderRequest } from './reminders';

// Web version of device.ts. expo-notifications doesn't support local notifications in
// the browser, so reminders are only scheduled on iOS and Android.

export type DeliveredNotification = {
  identifier: string;
  date: Date;
  title: string;
  body: string;
  type: string | null;
  payload: string | null;
};

export async function configureNotifications(): Promise<void> {}

export async function hasPermission(): Promise<boolean> {
  return false;
}

export async function requestPermission(): Promise<boolean> {
  return false;
}

export async function scheduleReminder(_request: ReminderRequest): Promise<void> {}

export async function presentNow(_request: Omit<ReminderRequest, 'trigger'>): Promise<boolean> {
  return false;
}

export async function scheduledIdentifiers(): Promise<string[]> {
  return [];
}

export async function scheduledSummary(): Promise<{ identifier: string; trigger: string }[]> {
  return [];
}

export async function cancelReminders(_identifiers: string[]): Promise<void> {}

export async function cancelAllReminders(): Promise<void> {}

export function onNotificationTapped(
  _listener: (notification: DeliveredNotification) => void,
): () => void {
  return () => {};
}
