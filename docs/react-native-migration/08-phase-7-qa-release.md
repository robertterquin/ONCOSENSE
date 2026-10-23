# Phase 7 — QA, Parity Check & Release

**Goal:** prove the React Native app does everything the Flutter app does, then release it to testers and the stores.
**Effort:** 1–2 weeks. **Branch:** `rn/phase-7` (in-repo work); the release steps happen outside git.

## 7.1 Feature parity

- [x] Walk through every row of the [inventory](00-inventory.md) (screens, tables, notifications, local settings) and mark it ✅ in a copy of the inventory: [`parity-checklist.md`](parity-checklist.md). Remaining 🟡 rows need a signed-in or device check.
- [ ] Anything not ported is either fixed or written down as an accepted difference in the decision log.
- [ ] Visual comparison of every screen against the Phase 0 screenshots, light and dark, on a small phone and a large phone.

## 7.2 Testing

- [x] Unit tests run in CI (`.github/workflows/mobile.yml`: lint, typecheck, tests on every PR and push to `main`).
- [ ] Maestro end-to-end flows, written in `mobile/.maestro/` (not run yet — Maestro isn't installed here):
  - `guest-tour.yaml`: guest sign-in, notification center, every tab, Settings. Writes nothing.
  - `signed-in.yaml`: login → journal entry → ask → answer → upvote → bookmark → saved → theme → log out, with a throwaway test account. Registration is left out so test runs don't create accounts in the production project.
- [ ] Real devices: at least one older Android (Android 10/11), one current Android, one iPhone.
  - iOS Simulator (iPhone 17 Pro, development build via `npx expo run:ios`): app builds and runs; welcome, login, guest Home, Settings, Notifications screens render; permission prompt, master switch, 14 scheduled reminders and the test notification (recorded once in the notification center) all work.
  - Noticed once in the simulator: after the iOS permission prompt closed, the app stepped back two screens (the screens had been opened with `simctl openurl` deep links). Watch for this on a device; it may be a development-client deep-link effect.
  - Native switches on iOS respond to a swipe in simulator automation; check taps on a real iPhone.
- [ ] Offline / bad network: every screen shows an error or cached data, never a blank screen or crash.
  - Code review done: every data screen has an error state. The Journey tab showed an empty journey when loading failed; it now shows an error with Retry. Still to try with airplane mode on a device.
- [ ] Accessibility: screen reader labels on icons and buttons, text scales with system font size, color contrast on the pink palette.
  - [x] Every button has a role, and icon-only buttons have labels; chips, tabs and options announce selected/checked.
  - [x] No text opts out of system font scaling.
  - [x] Contrast: light-mode secondary text was Flutter's `#BDBDBD` (1.9:1 on white) — now `#757575` (4.6:1); other gray text and the tab bar's inactive labels too; the blue test-notification button darkened to 4.6:1.
  - [ ] Known: white text on the brand pink `#E91E63` is 4.35:1, just under AA's 4.5:1 for normal-size text. Left as the brand color; revisit with the designer.
  - [ ] VoiceOver / TalkBack pass on a device.
- [ ] Performance: cold start time and scrolling on the Forum and Journey lists are no worse than Flutter.

## 7.3 Production configuration

- [x] Each `eas.json` profile reads the EAS environment of the same name (`development` / `preview` / `production`); the commands to set `EXPO_PUBLIC_SUPABASE_*` are in `mobile/README.md`.
- [ ] Set those EAS variables (needs the Expo account; run `npx eas-cli@latest init` once to link the project).
- [x] Android notification icon: white ribbon, `assets/images/notification-icon.png` (from `scripts/make-notification-icon.py`), set in the `expo-notifications` plugin.
- [x] `ios/` and `android/` are generated and ignored by git.
- [ ] Any SQL added during the migration (e.g. for Edge Functions) applied to production, additive only.
- [ ] Edge Functions `news` and `delete-account` deployed to production with their secrets.
- [ ] Crash reporting added (e.g. `sentry-expo` / `@sentry/react-native`) so release issues are visible.
- [ ] Privacy policy URL and data-safety / privacy-label answers updated (camera, photo library, notifications, account data).

## 7.4 Staged release

1. [ ] **Internal testing:** EAS Build `production` from `main` → Google Play internal testing + TestFlight. Team uses it for at least one week.
2. [ ] **Closed beta:** a small group of real users; collect feedback and crashes.
3. [ ] **Store release (built from `main`):** Play Store staged rollout (start at 10–20%), App Store phased release.
4. [ ] If the app ID matches the old Flutter release, users get it as a normal update. Signed-in sessions don't carry over (different storage), so users sign in once — mention this in release notes.

## Done when

- [ ] Parity checklist is 100% ✅ or documented exceptions.
- [ ] Crash-free sessions stay at or above 99% during the beta.
- [ ] Release is live in both stores at 100% rollout.
