import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';

// Reminder preferences (started from settings_screen.dart's SharedPreferences keys).
// src/lib/notifications/service.ts schedules the reminders from these values. Since
// redesign Phase 6 each reminder has its own time, set in Settings.

export const NOTIFICATION_TYPES = [
  'self_check',
  'daily_checkin',
  'appointments',
  'weekly_tip',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** When a reminder fires. `weekday` (Dart numbering: 1 = Monday … 7 = Sunday) is for weekly ones. */
export type ReminderTime = { hour: number; minute: number; weekday?: number };

/** On when reminders are first turned on; the weekly tip is opt-in. */
export const DEFAULT_TYPES: Record<NotificationType, boolean> = {
  self_check: true,
  daily_checkin: true,
  appointments: true,
  weekly_tip: false,
};

export const DEFAULT_TIMES: Record<NotificationType, ReminderTime> = {
  /** On the due day. */
  self_check: { hour: 9, minute: 0 },
  daily_checkin: { hour: 20, minute: 0 },
  /** The evening before. */
  appointments: { hour: 18, minute: 0 },
  weekly_tip: { weekday: 7, hour: 10, minute: 0 },
};

type NotificationPrefsState = {
  /** Master switch ("Reminders"). */
  enabled: boolean;
  types: Record<NotificationType, boolean>;
  times: Record<NotificationType, ReminderTime>;
  setEnabled: (enabled: boolean) => void;
  setType: (type: NotificationType, enabled: boolean) => void;
  setTime: (type: NotificationType, time: ReminderTime) => void;
  /** On: the defaults (the weekly tip stays off). Off: every type off. */
  setAllTypes: (enabled: boolean) => void;
  /** First-launch permission request done and defaults scheduled. */
  setupComplete: boolean;
  setSetupComplete: () => void;
};

const allOff = () =>
  Object.fromEntries(NOTIFICATION_TYPES.map((type) => [type, false])) as Record<
    NotificationType,
    boolean
  >;

/**
 * Saved preferences from earlier versions: drops the reminder types the redesign removed,
 * carries the weekly check-in over to the daily one (Phase 4), and adds the Phase 6
 * types and times.
 */
export function migrateNotificationPrefs(persisted: unknown, version: number): unknown {
  if (version >= 3 || !persisted || typeof persisted !== 'object') return persisted;
  const state = persisted as { types?: Record<string, unknown> };
  const old = state.types ?? {};
  const types = { ...DEFAULT_TYPES };
  if (typeof old.self_check === 'boolean') types.self_check = old.self_check;
  const checkIn = old.daily_checkin ?? old.weekly_checkin;
  if (typeof checkIn === 'boolean') types.daily_checkin = checkIn;
  return { ...state, types, times: { ...DEFAULT_TIMES } };
}

export const useNotificationPrefs = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      enabled: true,
      types: { ...DEFAULT_TYPES },
      times: { ...DEFAULT_TIMES },
      setEnabled: (enabled) => set({ enabled }),
      setType: (type, enabled) => set((state) => ({ types: { ...state.types, [type]: enabled } })),
      setTime: (type, time) => set((state) => ({ times: { ...state.times, [type]: time } })),
      setAllTypes: (enabled) => set({ types: enabled ? { ...DEFAULT_TYPES } : allOff() }),
      setupComplete: false,
      setSetupComplete: () => set({ setupComplete: true }),
    }),
    {
      name: 'notification-prefs',
      storage: persistStorage,
      version: 3,
      migrate: (persisted, version) =>
        migrateNotificationPrefs(persisted, version) as NotificationPrefsState,
    },
  ),
);
