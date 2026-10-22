# Phase 7 — QA, Parity Check & Release

**Goal:** prove the React Native app does everything the Flutter app does, then release it to testers and the stores.
**Effort:** 1–2 weeks. **Branch:** `rn/phase-7-release`.

## 7.1 Feature parity

- [ ] Walk through every row of the [inventory](00-inventory.md) (screens, tables, notifications, local settings) and mark it ✅ in a copy of the inventory: `docs/react-native-migration/parity-checklist.md`.
- [ ] Anything not ported is either fixed or written down as an accepted difference in the decision log.
- [ ] Visual comparison of every screen against the Phase 0 screenshots, light and dark, on a small phone and a large phone.

## 7.2 Testing

- [ ] Unit + component tests pass in CI.
- [ ] Maestro end-to-end flows: register → onboarding → add journey entry → ask question → answer → upvote → bookmark → view saved → change theme → sign out.
- [ ] Real devices: at least one older Android (Android 10/11), one current Android, one iPhone.
- [ ] Offline / bad network: every screen shows an error or cached data, never a blank screen or crash.
- [ ] Accessibility: screen reader labels on icons and buttons, text scales with system font size, color contrast on the pink palette.
- [ ] Performance: cold start time and scrolling on the Forum and Journey lists are no worse than Flutter.

## 7.3 Production configuration

- [ ] `production` EAS profile points to the **production** Supabase project; `EXPO_PUBLIC_*` values set as EAS environment variables, not in git.
- [ ] Any SQL added during the migration (e.g. for Edge Functions) applied to production, additive only.
- [ ] Edge Functions `news` and `delete-account` deployed to production with their secrets.
- [ ] Crash reporting added (e.g. `sentry-expo` / `@sentry/react-native`) so release issues are visible.
- [ ] Privacy policy URL and data-safety / privacy-label answers updated (camera, photo library, notifications, account data).

## 7.4 Staged release

1. [ ] **Internal testing:** EAS Build `production` from `react-native-migration` → Google Play internal testing + TestFlight. Team uses it for at least one week.
2. [ ] **Closed beta:** a small group of real users; collect feedback and crashes.
3. [ ] **Store release — after the [Phase 8](09-phase-8-cutover.md) merge into `main`, built from `main`:** Play Store staged rollout (start at 10–20%), App Store phased release.
4. [ ] If the app ID matches the old Flutter release, users get it as a normal update. Signed-in sessions don't carry over (different storage), so users sign in once — mention this in release notes.

## Done when

- [ ] Parity checklist is 100% ✅ or documented exceptions.
- [ ] Crash-free sessions stay at or above 99% during the beta.
- [ ] Release is live in both stores at 100% rollout.
