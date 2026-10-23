import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';

// Notification preferences from settings_screen.dart (SharedPreferences keys
// `notifications_enabled`, `notification_<type>` and `notifications_setup_complete`).
// src/lib/notifications/service.ts schedules the reminders from these values.

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
  /** Turns every type on or off (Flutter's enableAll/disableAllNotifications). */
  setAllTypes: (enabled: boolean) => void;
  /** First-launch permission request done and defaults scheduled. */
  setupComplete: boolean;
  setSetupComplete: () => void;
};

const allTypes = (enabled: boolean) =>
  Object.fromEntries(NOTIFICATION_TYPES.map((type) => [type, enabled])) as Record<
    NotificationType,
    boolean
  >;

export const useNotificationPrefs = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      // Flutter defaults every switch to on.
      enabled: true,
      types: allTypes(true),
      setEnabled: (enabled) => set({ enabled }),
      setType: (type, enabled) => set((state) => ({ types: { ...state.types, [type]: enabled } })),
      setAllTypes: (enabled) => set({ types: allTypes(enabled) }),
      setupComplete: false,
      setSetupComplete: () => set({ setupComplete: true }),
    }),
    { name: 'notification-prefs', storage: persistStorage },
  ),
);
