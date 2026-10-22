# Phase 6 — Notifications & Reminders

**Goal:** every local reminder fires at the same times as in the Flutter app, the user's per-type toggles work, and the notification center keeps history.
**Effort:** 1–2 weeks. **Branch:** `rn/phase-6-notifications`.

Good news from the inventory: everything is **local** scheduling (no push server) and `workmanager` is not actually used, so there is no background-task logic to port.

## 6.1 Setup — `src/lib/notifications/`

- [ ] `setup.ts`: `Notifications.setNotificationHandler`, permission request (replaces `requestPermissions` / `permission_handler`), Android channels via `setNotificationChannelAsync`.
- [ ] Re-create the six Android channels from `_createNotificationChannels()` with the same importance levels (3 high, 3 default). Keep the same channel IDs.
- [ ] Use stable **string identifiers** per reminder (`daily-tip`, `hydration-08`, `self-check-monthly`, …) instead of Flutter's integer IDs, so a reminder can be cancelled/rescheduled without touching others.
- [ ] Test on a development build, not Expo Go.

## 6.2 Schedule mapping

| Flutter method (defaults) | `expo-notifications` trigger |
|---|---|
| `scheduleDailyHealthTip` (09:00) | `DAILY` `{ hour: 9, minute: 0 }` |
| `scheduleHydrationReminders` (08:00–20:00 every 2 h) | one `DAILY` trigger per hour slot |
| `scheduleMovementReminders` (09:00–18:00 every 3 h) | one `DAILY` trigger per hour slot |
| `scheduleSunProtectionReminder` (10:00) | `DAILY` `{ hour: 10, minute: 0 }` |
| `scheduleMonthlyBreastSelfExam` (day 1) | `MONTHLY` `{ day, hour, minute }` |
| `scheduleScreeningReminder` | `DATE` (one-off) |
| `scheduleWeeklyCheckIn` (Sunday 10:00) | `WEEKLY` `{ weekday, hour, minute }` |

- [ ] **Weekday numbering differs.** Dart uses 1 = Monday … 7 = Sunday; `expo-notifications` uses 1 = Sunday … 7 = Saturday. Write one `toExpoWeekday()` helper with a unit test.
- [ ] Keep the same titles, bodies and payloads (e.g. `hydration:<hour>`) so the notification center and tap handling behave the same.
- [ ] iOS allows at most 64 pending local notifications. Count the total when every type is on and keep it under the limit.

## 6.3 Preferences & settings screens

- [ ] `notificationStore` (Zustand + AsyncStorage) holds the master switch, health-reminders switch and the seven per-type toggles (`health_tips`, `hydration`, `movement`, `sun_protection`, `self_check`, `weekly_checkin`, `forum`).
- [ ] Port `enableAllNotifications`, `disableAllNotifications` and `toggleNotificationType` — toggling a type cancels or schedules only that type's identifiers.
- [ ] First-launch flow (`notifications_setup_complete` in the splash screen): ask for permission once, then schedule defaults.
- [ ] Wire the switches in `profile/settings.tsx` and `profile/notifications.tsx`, plus "Send test notification".
- [ ] Reschedule everything on app start if permission is granted but nothing is pending (covers reinstall and OS clearing).

## 6.4 Notification center — `notification_center_screen.dart`, `notification_storage_service.dart`

- [ ] Store history in AsyncStorage under `stored_notifications` with the same `AppNotification` shape.
- [ ] Add a history entry when a notification is received (`addNotificationReceivedListener`) and when shown in-app.
- [ ] `notifications.tsx`: list, filter by type, mark one/all as read, delete one, clear all, clear read. Unread badge on the Home header.
- [ ] Tapping a notification (`addNotificationResponseReceivedListener`) opens the relevant screen.

## 6.5 Decide: forum and resource notifications

`showForumReplyNotification`, `showForumUpvoteNotification` and `showResourceUpdateNotification` exist but are never called. Record one choice in the [decision log](README.md#decision-log):

- **Drop them** (matches current behaviour), or
- **Make them real** with push notifications: Expo push tokens saved to a new `push_tokens` table + a Supabase database webhook / Edge Function on `answers` and vote inserts. This is new scope — schedule it after cutover.

## Done when

- [ ] With all types on, the pending list (`getAllScheduledNotificationsAsync`) matches the Flutter schedule (times and count).
- [ ] Reminders fire on a real Android device (including after reboot) and a real iPhone, with the app closed.
- [ ] Toggling any type in Settings adds/removes only that type's reminders.
- [ ] Notification center history, read state and badge work.
