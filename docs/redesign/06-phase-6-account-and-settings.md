# Phase 6 — Getting Started, Profile and Settings

**Goal:** the welcome and sign-in flow, profile, and one Settings screen that holds display, reminders, community and account options.
**Effort:** 1 week. **Branch:** `redesign/phase-6`.

Artboards: **Welcome**, **Sign in**, **Profile**, **Settings and reminders**.

## 6.1 Getting started

- [x] **Welcome:** night-violet screen with the large ribbon mark, "OncoSense", one-line purpose, Create an account, Sign in, "Look around without an account", and "General health information, not medical advice."
- [x] **Sign in:** visible labels, password Show/Hide, "Keep me signed in" (the existing remember-me), Forgot password, guest option, "New to OncoSense? Create an account".
- [x] **Create account:** same fields and rules as today (password checklist, terms), restyled; continues to the focus screen (Phase 4).
- [x] **Forgot password:** restyled; same Supabase flow.
- [x] First launch for signed-in users still asks for notification permission once (the first-launch logic from migration Phase 6), now after the focus screen so the right reminders are offered.

## 6.2 Profile — `/profile`

- [x] Initials or photo, name, email, Edit profile.
- [x] Focus card ("The app is set up for Going through treatment", Change).
- [x] Rows: Saved (count), Reminders (how many on), Settings; About OncoSense, Privacy and terms, Medical disclaimer.
- [x] Log out (signed in) or Sign in (guest); version number.
- [x] **Edit profile** and **Change password** restyled; behavior unchanged.

## 6.3 Settings — `/profile/settings`

- [x] **Display:** Theme (Light, Dark, Phone) and Text size (Default, Large, Larger), from Phase 2 stores.
- [x] **Reminders**, each with a switch and a time (tap the row to change it):
  - Self-checks (time on the due day, and which guides; the due day comes from each guide's frequency, so there is no day-of-month setting)
  - Daily check-in (time; only for Journey focuses)
  - Treatments and appointments (the day before, time)
  - Weekly health tip (day and time; off by default)
  - The notifications service takes these times instead of fixed defaults; changing one reschedules only that type.
- [x] **Community:** "Post anonymously by default" (device setting).
- [x] **Account:** Change password, Delete account (existing Edge Function, confirmation dialog).
- [x] Remove the old Settings and Profile screens and components.

## Done when

- [x] The four artboards match on web and the iOS Simulator, light and dark, at Default and Larger text.
- [x] Unit tests: reminder time changes reschedule only their type; theme and text-size migrations.
- [ ] Full flows with a test account: sign up → focus → permission → Today; edit the profile and photo; change the password; sign out; sign in (also with an account made in the old Flutter app: same name, age and gender); forgot password email arrives; delete account (`delete-account` is deployed).

## Notes from building it

- **Not tested with an account:** sign up, sign in, sign out, the reset email, edit profile, change password and delete account need a test account and the deployed `delete-account` function. Checked as a guest: every screen renders on web and iOS, form validation, the reminder sheets and times, and dark mode.
- **Reminders:** `stores/notificationStore.ts` now has four types (self-checks, daily check-in, appointments, weekly tip, which is off by default) and a time for each (version 3, migrated from 2). `setReminderTime` saves a time and reschedules only that type (tested). Appointments and the check-in only show in Settings for Journey focuses; on the web Settings says reminders are phone-only.
- **Permission:** signed-in people are asked for notification permission once they have a focus (after "What brings you here?"), not right after sign-up.
- **Shared fixes:** buttons wrap to two lines instead of cutting off; the iOS date and time picker now opens from anywhere on the field (it used to open only from a small hidden label) and shows a calendar or a wheel below it; the appointment form stacks date and time.
- **Removed:** `AuthLayout`, `FormField`, `InputField`, `PasswordChecklist`, `Checkbox`, `PinkSwitch`, `ProfileMenu`, `InfoDialog`, `ComingSoon` and `NotificationSwitches`. The old `AppHeader`, `Card`, `Button` and `Screen` remain only for the dev screens (Phase 7 removes them).
