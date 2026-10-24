import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';

// Notification preferences from settings_screen.dart (SharedPreferences keys
// `notifications_enabled`, `notification_<type>` and `notifications_setup_complete`).
// src/lib/notifications/service.ts schedules the reminders from these values.
// The redesign kept only the self-check and check-in reminders (docs/redesign).

export const NOTIFICATION_TYPES = ['self_check', 'daily_checkin'] as const;

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

/**
 * Saved preferences from earlier versions: drops the reminder types the redesign removed
 * and carries the weekly check-in choice over to the daily check-in (Phase 4).
 */
export function migrateNotificationPrefs(persisted: unknown, version: number): unknown {
  if (version >= 2 || !persisted || typeof persisted !== 'object') return persisted;
  const state = persisted as { types?: Record<string, unknown> };
  const old = state.types ?? {};
  const types = allTypes(true);
  if (typeof old.self_check === 'boolean') types.self_check = old.self_check;
  const checkIn = old.daily_checkin ?? old.weekly_checkin;
  if (typeof checkIn === 'boolean') types.daily_checkin = checkIn;
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
      version: 2,
      migrate: (persisted, version) =>
        migrateNotificationPrefs(persisted, version) as NotificationPrefsState,
    },
  ),
);
