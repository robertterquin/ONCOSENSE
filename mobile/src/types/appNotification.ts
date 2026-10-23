import { formatTimeAgo } from '@/lib/dates';

import { booleanOr, optionalString, requireString, type Row } from './row';

/** A notification kept in the in-app notification center (stored on the device). */
export type AppNotification = {
  id: string;
  title: string;
  body: string;
  /** health_tip, hydration, movement, forum_reply, … */
  type: string;
  timestamp: Date;
  isRead: boolean;
  payload: string | null;
  iconName: string | null;
};

/** Stored in camelCase with an ISO timestamp, the same shape the Flutter app used. */
export function appNotificationFromStorage(row: Row): AppNotification {
  return {
    id: requireString(row, 'id'),
    title: requireString(row, 'title'),
    body: requireString(row, 'body'),
    type: requireString(row, 'type'),
    timestamp: new Date(requireString(row, 'timestamp')),
    isRead: booleanOr(row, 'isRead', false),
    payload: optionalString(row, 'payload'),
    iconName: optionalString(row, 'iconName'),
  };
}

export function appNotificationToStorage(notification: AppNotification): Row {
  return { ...notification, timestamp: notification.timestamp.toISOString() };
}

export function appNotificationTimeAgo(notification: AppNotification, now?: Date): string {
  return formatTimeAgo(notification.timestamp, now);
}

const TYPE_ICONS: Record<string, string> = {
  health_tip: 'lightbulb',
  hydration: 'water_drop',
  movement: 'directions_walk',
  sun_protection: 'wb_sunny',
  self_check: 'health_and_safety',
  screening: 'calendar_today',
  forum_reply: 'reply',
  forum_upvote: 'thumb_up',
  weekly_check_in: 'check_circle',
};

/** Material icon name. */
export function appNotificationIcon(notification: AppNotification): string {
  return notification.iconName ?? TYPE_ICONS[notification.type] ?? 'notifications';
}

const TYPE_COLORS: Record<string, string> = {
  health_tip: '#FFB300',
  hydration: '#2196F3',
  movement: '#4CAF50',
  sun_protection: '#FF9800',
  self_check: '#D81B60',
  screening: '#9C27B0',
  forum_reply: '#00BCD4',
  forum_upvote: '#8BC34A',
  weekly_check_in: '#3F51B5',
};

/** Accent color for the notification center card. */
export function appNotificationColor(notification: AppNotification): string {
  return TYPE_COLORS[notification.type] ?? '#D81B60';
}
