# Phase 6 — Getting Started, Profile and Settings

**Goal:** the welcome and sign-in flow, profile, and one Settings screen that holds display, reminders, community and account options.
**Effort:** 1 week. **Branch:** `redesign/phase-6`.

Artboards: **Welcome**, **Sign in**, **Profile**, **Settings and reminders**.

## 6.1 Getting started

- [ ] **Welcome:** night-violet screen with the large ribbon mark, "OncoSense", one-line purpose, Create an account, Sign in, "Look around without an account", and "General health information, not medical advice."
- [ ] **Sign in:** visible labels, password Show/Hide, "Keep me signed in" (the existing remember-me), Forgot password, guest option, "New to OncoSense? Create an account".
- [ ] **Create account:** same fields and rules as today (password checklist, terms), restyled; continues to the focus screen (Phase 4).
- [ ] **Forgot password:** restyled; same Supabase flow.
- [ ] First launch for signed-in users still asks for notification permission once (the first-launch logic from migration Phase 6), now after the focus screen so the right reminders are offered.

## 6.2 Profile — `/profile`

- [ ] Initials or photo, name, email, Edit profile.
- [ ] Focus card ("The app is set up for Going through treatment", Change).
- [ ] Rows: Saved (count), Reminders (how many on), Settings; About OncoSense, Privacy and terms, Medical disclaimer.
- [ ] Log out (signed in) or Sign in (guest); version number.
- [ ] **Edit profile** and **Change password** restyled; behavior unchanged.

## 6.3 Settings — `/profile/settings`

- [ ] **Display:** Theme (Light, Dark, Phone) and Text size (Default, Large, Larger), from Phase 2 stores.
- [ ] **Reminders**, each with a switch and a time (tap the row to change it):
  - Monthly self-check (day of month and time; which guides)
  - Daily check-in (time; only for Journey focuses)
  - Treatments and appointments (the day before, time)
  - Weekly health tip (day and time; off by default)
  - The notifications service takes these times instead of fixed defaults; changing one reschedules only that type.
- [ ] **Community:** "Post anonymously by default" (device setting).
- [ ] **Account:** Change password, Delete account (existing Edge Function, confirmation dialog).
- [ ] Remove the old Settings and Profile screens and components.

## Done when

- [ ] The four artboards match on web and the iOS Simulator, light and dark, at Default and Larger text.
- [ ] Unit tests: reminder time changes reschedule only their type; theme and text-size migrations.
- [ ] Full flows with a test account: sign up → focus → permission → Today; sign out; sign in; forgot password email arrives; delete account (with `delete-account` deployed).
