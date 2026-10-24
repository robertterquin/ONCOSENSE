import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';

// Notification preferences from settings_screen.dart (SharedPreferences keys
// `notifications_enabled`, `notification_<type>` and `notifications_setup_complete`).
// src/lib/notifications/service.ts schedules the reminders from these values.
// The redesign kept only the self-check and check-in reminders (docs/redesign).

export const NOTIFICATION_TYPES = ['self_check', 'weekly_checkin'] as const;

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

/** Saved preferences from before the redesign: drops the removed reminder types. */
export function migrateNotificationPrefs(persisted: unknown, version: number): unknown {
  if (version >= 1 || !persisted || typeof persisted !== 'object') return persisted;
  const state = persisted as { types?: Record<string, unknown> };
  const types = allTypes(true);
  for (const type of NOTIFICATION_TYPES) {
    if (typeof state.types?.[type] === 'boolean') types[type] = state.types[type] as boolean;
  }
  return { ...state, types };
}

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
    {
      name: 'notification-prefs',
      storage: persistStorage,
      version: 1,
      migrate: (persisted, version) =>
        migrateNotificationPrefs(persisted, version) as NotificationPrefsState,
    },
  ),
);
