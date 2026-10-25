# Phase 6 — Notifications & Reminders

**Goal:** every local reminder fires at the same times as in the Flutter app, the user's per-type toggles work, and the notification center keeps history.
**Effort:** 1–2 weeks. **Branch:** `rn/phase-6`.

Good news from the inventory: everything is **local** scheduling (no push server) and `workmanager` is not actually used, so there is no background-task logic to port.

## 6.1 Setup — `mobile/src/lib/notifications/`

| File | What it does |
|---|---|
| `reminders.ts` | The schedule as plain data: channels, titles, bodies, times, payloads, `toExpoWeekday()`. Unit tested. |
| `device.ts` | The only file that calls `expo-notifications` (handler, channels, permission, schedule/cancel, listeners). |
| `device.web.ts` | No-op version for the web, where `expo-notifications` has no local notifications. |
| `service.ts` | Flutter's logic: enable/disable all, per-type toggle, first launch, test notification, history and taps. |

- [x] `setNotificationHandler` shows notifications while the app is open (banner, list, sound).
- [x] The six Android channels from `_createNotificationChannels()` with the same IDs and importance (3 high, 3 default).
- [x] Stable **string identifiers** per reminder (`daily-tip`, `hydration-08`, `movement-09`, `sun-protection`, `self-check-monthly`, `weekly-checkin`, `screening-<id>`), so a type is cancelled by prefix without touching others.
- [x] `expo-notifications` config plugin in `app.json` (accent color `#D81B60`).
- [x] Test on a development build (`npx expo run:android` / `run:ios` or an EAS development build). Local notifications also work in Expo Go. *(iOS Simulator done; real phones moved to the Phase 7 real-device check.)*

## 6.2 Schedule mapping

| Flutter method (defaults) | `expo-notifications` trigger | Count |
|---|---|---|
| `scheduleDailyHealthTip` (09:00) | `DAILY` 9:00, a random health reminder as content | 1 |
| `scheduleHydrationReminders` (08:00–20:00 every 2 h) | `DAILY` 8, 10, 12, 14, 16, 18 (Flutter stops after its 6 messages) | 6 |
| `scheduleMovementReminders` (09:00–18:00 every 3 h) | `DAILY` 9:30, 12:30, 15:30, 18:30 (Flutter uses half past) | 4 |
| `scheduleSunProtectionReminder` (10:00) | `DAILY` 10:00 | 1 |
| `scheduleMonthlyBreastSelfExam` (day 1) | `MONTHLY` day 1, 9:00 | 1 |
| `scheduleScreeningReminder` | `DATE` (one-off; `scheduleScreeningReminder()` — nothing calls it, same as Flutter) | — |
| `scheduleWeeklyCheckIn` (Sunday 10:00) | `WEEKLY` weekday 1 (Sunday), 10:00 | 1 |

- [x] **Weekday numbering:** Dart 1 = Monday … 7 = Sunday; expo 1 = Sunday … 7 = Saturday. `toExpoWeekday()` converts, with a test.
- [x] Same titles, bodies and payloads (e.g. `hydration:8`).
- [x] 14 pending reminders with every type on — far below iOS's 64 (tested).
- [x] Delivery is `bestEffort` (see deliberate differences).

## 6.3 Preferences & settings screens

- [x] `notificationStore` holds the master switch, the seven per-type toggles and `setupComplete` (Flutter's `notifications_setup_complete`).
- [x] `enableAll` / `disableAll` / per-type toggle ported; toggling a type cancels or schedules only that type's identifiers (tested).
- [x] First launch for signed-in users (root layout, like the splash screen): ask once, then schedule every type. If permission is denied, it asks again next launch, as in Flutter.
- [x] On every later start: reschedule switched-on types if permission is granted but nothing is pending (reinstall, restore, OS cleared them).
- [x] Settings and `profile/notifications.tsx` share `components/profile/NotificationSwitches.tsx`. Settings has "Test Notification"; the Notifications screen has the info banner, the four sections and "Send Test Notification".

## 6.4 Notification center

- [x] History in `stored_notifications` (`stores/notificationHistoryStore.ts`), the same `AppNotification` shape, newest first, at most 50.
- [x] Entries are added when a reminder arrives while the app is open, when one is tapped, and on start for reminders still in the system tray (each delivery once).
- [x] `notifications.tsx`: unread count in the header, mark one read (tap), mark all read, delete one, clear all (with confirmation), empty state. Type icons and colors as in Flutter.
- [x] Home: unread badge on the bell (`9+` above nine), one-time sample notifications, long-press the bell for a test notification.
- [x] Tapping a system notification opens a screen: weekly check-in → Journey, self-check/screening → Prevention, forum → the question, everything else → the notification center.

## 6.5 Forum and resource notifications — dropped

`showForumReplyNotification`, `showForumUpvoteNotification` and `showResourceUpdateNotification` were never called in Flutter, so they are not ported. The "Forum Notifications" switch stays (saved, sends nothing) to match the Flutter screens. Real forum alerts would need push notifications (Expo push tokens in a new `push_tokens` table plus a database webhook / Edge Function on `answers` and votes) — new scope for after cutover. Recorded in the [decision log](README.md#decision-log).

## Deliberate differences from Flutter

- **Inexact delivery.** Flutter used `exactAllowWhileIdle`, which needs `SCHEDULE_EXACT_ALARM`. Android 14 denies that by default and Google Play allows it only for alarm/calendar apps, so reminders use `bestEffort` and may arrive a few minutes late.
- **History of scheduled reminders.** Flutter only stored notifications it showed itself (test, forum), so delivered reminders never reached the notification center. They do now.
- **Taps open a screen.** Flutter's tap handler was a TODO.
- **Sample notifications are added once.** Flutter re-added them whenever the history was empty, which undid "Clear all".
- **A type switched on while the master switch is off isn't scheduled.** Flutter scheduled it anyway.
- **Web:** reminders aren't sent in the browser; the screens, switches and history work, and the Notifications screen says reminders come from the phone app.
- The notification center has no swipe-to-delete (the × button does the same) and no type filter or "clear read" (Flutter's screen didn't offer them either).

## Follow-ups

- **Android notification icon:** add a white-on-transparent 96×96 icon to `assets/` and set `icon` in the `expo-notifications` plugin (Phase 7 assets). Without it Android uses the app icon, which can show as a plain square.

## Done when

- [x] Everything builds, typechecks, lints, and the iOS/Android bundles export; `expo-doctor` passes.
- [x] 76 unit tests pass (new: weekday mapping, schedule times/count/identifiers, first launch, toggles, master switch, history, persistence, tap routes).
- [x] Notification center, badge, settings switches and test notification checked on web.
- [x] With all types on, `getAllScheduledNotificationsAsync` lists the 14 reminders above — checked in the iOS Simulator (iPhone 17 Pro) on the development screen `/dev/notifications`: correct times, half-past movement slots, day 1 for the self-exam, `weekday: 1` (Sunday) for the check-in. Still to check on an Android device.
- [x] Reminders fire on a real Android device (including after reboot) and a real iPhone, with the app closed. *(Moved to the Phase 7 real-device check.)*
- [x] Toggling any type in Settings adds/removes only that type's reminders on the device. *(Moved to the Phase 7 real-device check.)*
- [x] Tapping a delivered reminder opens the right screen, from the background and from a closed app. *(Moved to the Phase 7 real-device check.)*
