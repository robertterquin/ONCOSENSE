import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';
import {
  appNotificationFromStorage,
  appNotificationToStorage,
  type AppNotification,
} from '@/types/appNotification';
import type { Row } from '@/types/row';

// Port of lib/services/notification_storage_service.dart: the notification center's
// history, kept on the device under `stored_notifications` (newest first, at most 50).

const MAX_STORED = 50;

export type NewNotification = {
  title: string;
  body: string;
  type: string;
  payload?: string | null;
  iconName?: string | null;
  /** Defaults to `<milliseconds>_<type>` like Flutter. An existing ID is replaced. */
  id?: string;
  timestamp?: Date;
};

type NotificationHistoryState = {
  notifications: AppNotification[];
  /** The Home screen's sample notifications were added (only ever once). */
  samplesAdded: boolean;
  add: (notification: NewNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
  clearRead: () => void;
  setSamplesAdded: () => void;
};

const newestFirst = (a: AppNotification, b: AppNotification) =>
  b.timestamp.getTime() - a.timestamp.getTime();

function fromStorage(rows: unknown): AppNotification[] {
  if (!Array.isArray(rows)) return [];
  const notifications: AppNotification[] = [];
  for (const row of rows) {
    try {
      const notification = appNotificationFromStorage(row as Row);
      if (!Number.isNaN(notification.timestamp.getTime())) notifications.push(notification);
    } catch {
      // Skip entries that can't be read rather than losing the whole history.
    }
  }
  return notifications.sort(newestFirst);
}

export const useNotificationHistory = create<NotificationHistoryState>()(
  persist(
    (set) => ({
      notifications: [],
      samplesAdded: false,
      add: (input) =>
        set((state) => {
          const timestamp = input.timestamp ?? new Date();
          const notification: AppNotification = {
            id: input.id ?? `${timestamp.getTime()}_${input.type}`,
            title: input.title,
            body: input.body,
            type: input.type,
            timestamp,
            isRead: false,
            payload: input.payload ?? null,
            iconName: input.iconName ?? null,
          };
          const others = state.notifications.filter((n) => n.id !== notification.id);
          return {
            notifications: [notification, ...others].sort(newestFirst).slice(0, MAX_STORED),
          };
        }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.isRead ? n : { ...n, isRead: true })),
        })),
      remove: (id) =>
        set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
      clearAll: () => set({ notifications: [] }),
      clearRead: () =>
        set((state) => ({ notifications: state.notifications.filter((n) => !n.isRead) })),
      setSamplesAdded: () => set({ samplesAdded: true }),
    }),
    {
      name: 'stored_notifications',
      storage: persistStorage,
      partialize: (state) => ({
        notifications: state.notifications.map(appNotificationToStorage),
        samplesAdded: state.samplesAdded,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as { notifications?: unknown; samplesAdded?: unknown };
        return {
          ...current,
          notifications: fromStorage(saved.notifications),
          samplesAdded: saved.samplesAdded === true,
        };
      },
    },
  ),
);

export const useUnreadNotificationCount = () =>
  useNotificationHistory((state) => state.notifications.filter((n) => !n.isRead).length);
