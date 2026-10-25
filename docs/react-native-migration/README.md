# OncoSense: Flutter → React Native Migration

This folder is the single source of truth for moving OncoSense from Flutter to React Native (Expo + TypeScript).
Read this page first, then work through the phase documents in order.

## Why this is a rewrite, not a conversion

No tool converts Dart to TypeScript. Every screen, provider and service in `lib/` is rebuilt by hand.
What does **not** change is the backend: the same Supabase project, tables, RPC functions, storage bucket and auth users are reused by the new app.

## Safety rules (how we avoid damaging the codebase)

These rules apply for the whole migration. Breaking one needs a team decision recorded in [Decision log](#decision-log).

1. **The Flutter app stays untouched and releasable until cutover.** No edits to `lib/`, `android/`, `ios/`, `web/`, `pubspec.yaml` or `pubspec.lock` during Phases 1–7. The only planned exception is the GNews key fix in [Phase 0](01-phase-0-preparation.md), shipped as its own small PR.
2. **The React Native app lives in its own folder, `mobile/`.** Nothing is moved or renamed at the repo root until [Phase 8](09-phase-8-cutover.md).
3. **Each phase is a short-lived branch merged into `main`, then deleted.** Because the new app lives only in `mobile/`, merging it into `main` never affects the Flutter app. `main` is never force-pushed.
4. **The database changes only additively while both apps exist.** Both apps talk to the same Supabase project, so no table/column renames, no drops, no changes to RLS policies or RPC signatures that the Flutter app depends on. New columns must be nullable or have defaults.
5. **Develop against a non-production Supabase project when possible.** Test sign-ups, forum posts and journey entries should not land in real user data.
6. **Secrets never go into git.** `mobile/.env` is git-ignored; only `mobile/.env.example` is committed.
7. **Before cutover, the Flutter code is tagged**, so it can always be restored (`git checkout flutter-final`).

## Target stack

| Concern | Choice |
|---|---|
| Framework | Expo (latest stable SDK at setup time), development builds — not Expo Go |
| Language | TypeScript, `strict: true` |
| Navigation | Expo Router (file-based) |
| Backend client | `@supabase/supabase-js` + `expo-sqlite`'s `localStorage` for session persistence |
| Server data (fetch/cache) | TanStack Query |
| App state (theme, settings, auth session) | Zustand |
| Forms & validation | `react-hook-form` + `zod` |
| Styling | `StyleSheet` + a typed theme (tokens ported from `lib/utils/theme.dart`) |
| Local notifications | `expo-notifications` |
| Images / files | `expo-image-picker`, `expo-image` |
| Links | `expo-linking`, `expo-web-browser` |
| Fonts / splash / icon | `expo-font`, `expo-splash-screen`, app config icons |
| Dates | `date-fns` |
| Tests | Jest + React Native Testing Library; Maestro for end-to-end flows |
| Builds & releases | EAS Build + EAS Submit |

## Phases

| # | Phase | Doc | Est. effort | Status |
|---|---|---|---|---|
| — | Inventory of the current app | [00-inventory.md](00-inventory.md) | — | Done |
| 0 | Preparation & safety net | [01-phase-0-preparation.md](01-phase-0-preparation.md) | 2–3 days | Done except the GNews key revoke and a schema backup |
| 1 | Project setup | [02-phase-1-setup.md](02-phase-1-setup.md) | 3–5 days | Done except EAS setup and an Android build (Phase 7) |
| 2 | Foundation (types, services, state, theme) | [03-phase-2-foundation.md](03-phase-2-foundation.md) | 1–2 weeks | Done |
| 3 | Auth & app shell | [04-phase-3-auth-shell.md](04-phase-3-auth-shell.md) | 1 week | Done (account checks in redesign Phase 6) |
| 4 | Content features (Home, Info, Prevention, Forum, Resources) | [05-phase-4-content.md](05-phase-4-content.md) | 2–3 weeks | Done |
| 5 | Personal features (Journey, Profile, Saved items, Settings) | [06-phase-5-personal.md](06-phase-5-personal.md) | 2–3 weeks | Done (`delete-account` deployed 2026-10-25) |
| 6 | Notifications & reminders | [07-phase-6-notifications.md](07-phase-6-notifications.md) | 1–2 weeks | Done (device checks in Phase 7) |
| 7 | QA, parity check & release | [08-phase-7-qa-release.md](08-phase-7-qa-release.md) | 1–2 weeks | In progress: device checks and store release left |
| 8 | Cutover & Flutter retirement | [09-phase-8-cutover.md](09-phase-8-cutover.md) | 2–3 days | In progress (Flutter removed; release and cleanup after it) |

Estimates assume one developer working full time. Update the **Status** column (`Not started` / `In progress` / `Done`) as each phase finishes.

## Branching

```
main ──●────────●────────●────────●──── …   (Flutter app + mobile/ growing phase by phase)
        \      /  \      /  \      /
   rn/phase-1-setup  rn/phase-2-…  rn/phase-3-…   (one short branch per phase; deleted after merge)
```

- Each phase (or screen group) gets a short branch **from `main`**, e.g. `rn/phase-4-forum`, merged **into `main`** and then deleted.
- Flutter fixes (like the GNews key fix in Phase 0) work the same way on their own branch, e.g. `fix/gnews-key`.
- Optional: turn on GitHub **Settings → General → Automatically delete head branches** so merged branches are removed for you.

## How to work through a phase

1. Read the phase doc fully before starting.
2. Start from the latest `main`:
   ```bash
   git checkout main && git pull && git checkout -b rn/phase-N-short-name
   ```
3. Work through the checklist; tick boxes in the doc in the same branch.
4. A phase is done only when every item in its **Done when** section is true and the `mobile/` checks (lint, typecheck, tests) pass.
5. Merge into `main` (PR, or from the terminal), push, and delete the branch:
   ```bash
   git checkout main && git pull && git merge --no-ff rn/phase-N-short-name && git push
   git branch -d rn/phase-N-short-name && git push origin --delete rn/phase-N-short-name
   ```
6. Update the status table above and start the next phase.

## Decision log

Record every decision that changes this plan. Add new rows at the bottom.

| Date | Decision | Why | Who |
|---|---|---|---|
| 2026-10-22 | Rewrite in Expo + TypeScript, keep Supabase backend | Backend is framework-neutral; only the client changes | — |
| 2026-10-22 | React Native app lives in `mobile/` in this repo | Keeps history and SQL/docs together; Flutter stays untouched until cutover | — |
| 2026-10-22 | All migration work on `react-native-migration`, merged into `main` once at the end (not force-pushed) | Keeps `main` purely Flutter until the new app is ready; merging keeps both histories | — |
| 2026-10-23 | App ID / bundle ID `com.oncosense.app` (Android and iOS) | Google Play rejects `com.example.*`; the Flutter app was never published under another ID | Robert |
| 2026-10-23 | Develop against the current (production) Supabase project for now | Simplest start; switch by changing `mobile/.env` if a dev project is created later. Clean up test data made during development | Robert |
| 2026-10-23 | Expo SDK 58 (React Native 0.88, React 19.3, TypeScript 6) | Latest stable at setup time | — |
| 2026-10-23 | Session and local data stored with `expo-sqlite`'s `localStorage`, not AsyncStorage | Expo's current Supabase guide recommends it; one storage API on iOS, Android and web | — |
| 2026-10-23 | Dates are written and read as local wall-clock time without a time zone (`src/lib/dates.ts`) | That's what the Flutter app does; anything else shifts days for rows shared between the two apps | — |
| 2026-10-23 | Journey deletes remove the Supabase row; saves write only the changed row | Flutter's deletes only affected the device, so deleted items reappeared | — |
| 2026-10-23 | Notification storage and preferences move to Phase 6 | They only matter once notifications are scheduled | — |
| 2026-10-23 | Poppins from `@expo-google-fonts/poppins` (4 weights), loaded at startup; Material icons from `@expo/vector-icons` | Flutter used Google Fonts Poppins and Material icons; the database stores Material icon names | — |
| 2026-10-23 | Keep Flutter's "Continue as Guest": guests can open the tabs until the app is closed | Existing behavior; screens that need an account handle signed-out users | — |
| 2026-10-23 | Home tab route is `/home` (not `/`); `/` is the launch redirect | Matches Flutter's `/home` route and avoids two screens at `/` | — |
| 2026-10-23 | No extra 3-second animated splash; the native splash shows until fonts and session are ready | Faster start; same logo-on-white look | — |
| 2026-10-23 | Forum filters as chips; dead Home buttons removed; "Learn More" opens Info; readable article dates; guests asked to sign in when bookmarking | Small UX fixes where Flutter had no-op buttons or silent failures (details in Phase 4 doc) | — |
| 2026-10-23 | Sign-out lives on the Profile placeholder (reached from the Home avatar) until Phase 5 | Home now shows real content | — |
| 2026-10-23 | Real account deletion through a `delete-account` Edge Function | App store requirement; Flutter only cleared local data | — |
| 2026-10-23 | Guests see a sign-in prompt on the Journey tab | Journey data is saved per account | — |
| 2026-10-23 | Notification preferences stored now (Phase 5); scheduling in Phase 6 | Settings needs the switches; reminders come with expo-notifications | — |
| 2026-10-23 | Replaces the 2026-10-22 `react-native-migration` branch decision: each phase branch merges straight into `main` and is deleted; the `react-native-migration` branch is removed | Simpler; no long-lived branch to keep in sync. Safe because `mobile/` is separate from the Flutter code | Robert |
| 2026-10-23 | `react-hook-form` / `zod` / `@hookform/resolvers` installed in Phase 3, not Phase 1 | `@hookform/resolvers` 6 has a peer-dependency conflict today; forms aren't needed until Phase 3 | — |
| 2026-10-23 | Drop Flutter's forum/resource notification methods; keep the Forum switch | They were never called; real forum alerts need push notifications, which is new scope for after cutover | — |
| 2026-10-23 | Reminders use `bestEffort` delivery instead of exact alarms | Exact alarms need `SCHEDULE_EXACT_ALARM`, denied by default on Android 14 and limited by Google Play; reminders may be a few minutes late | — |
| 2026-10-23 | Delivered reminders are kept in the notification center, and tapping one opens a related screen | Flutter never stored scheduled reminders and its tap handler was a TODO | — |
| 2026-10-23 | Light-mode secondary text darkened from Flutter's `#BDBDBD` to `#757575` | `#BDBDBD` on white is 1.9:1; WCAG AA needs 4.5:1 | — |
| 2026-10-23 | `mobile/ios` and `mobile/android` are generated (Continuous Native Generation) and not committed | Native settings live in `app.json`; avoids hand-edited native projects drifting | — |
| 2026-10-23 | Maestro's signed-in flow starts from login with a test account; registration isn't automated | Development uses the production Supabase project, so each run would create a real account | — |
| 2026-10-23 | Cut over (remove Flutter from `main`) before the React Native release, not two weeks after it | Robert's call. Flutter stays restorable from the `flutter-final` tag and `archive/flutter` branch; any Flutter hotfix is built there until the new app ships | Robert |
| 2026-10-23 | After cutover the app stays in `mobile/` | No path changes for CI, EAS or docs; room for `supabase/` alongside | Robert |
| 2026-10-23 | The `news` Edge Function moves to `main` in Phase 8; `fix/gnews-key`'s Flutter change is dropped | The React Native app calls `news`; the Flutter service it changed no longer exists on `main` | — |
