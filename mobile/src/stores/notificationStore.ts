import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';

// Notification preferences from settings_screen.dart (SharedPreferences keys
// `notifications_enabled` and `notification_<type>`). Phase 6 schedules the actual
// reminders from these values.

export const NOTIFICATION_TYPES = [
  'health_tips',
  'hydration',
  'movement',
  'sun_protection',
  'self_check',
  'weekly_checkin',
  'forum',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

type NotificationPrefsState = {
  /** Master switch ("Push Notifications"). */
  enabled: boolean;
  types: Record<NotificationType, boolean>;
  setEnabled: (enabled: boolean) => void;
  setType: (type: NotificationType, enabled: boolean) => void;
};

const allOn = Object.fromEntries(NOTIFICATION_TYPES.map((type) => [type, true])) as Record<
  NotificationType,
  boolean
>;

export const useNotificationPrefs = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      // Flutter defaults every switch to on.
      enabled: true,
      types: allOn,
      setEnabled: (enabled) => set({ enabled }),
      setType: (type, enabled) => set((state) => ({ types: { ...state.types, [type]: enabled } })),
    }),
    { name: 'notification-prefs', storage: persistStorage },
  ),
);
