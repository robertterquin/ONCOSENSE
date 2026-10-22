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
3. **All migration work lives on the `react-native-migration` branch until it's finished.** `main` keeps only the Flutter app (plus urgent Flutter fixes) and is never committed to directly. The migration branch is merged into `main` once, in [Phase 8](09-phase-8-cutover.md) — never force-pushed over it.
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
| Backend client | `@supabase/supabase-js` + `@react-native-async-storage/async-storage` for session persistence |
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
| 0 | Preparation & safety net | [01-phase-0-preparation.md](01-phase-0-preparation.md) | 2–3 days | Not started |
| 1 | Project setup | [02-phase-1-setup.md](02-phase-1-setup.md) | 3–5 days | Not started |
| 2 | Foundation (types, services, state, theme) | [03-phase-2-foundation.md](03-phase-2-foundation.md) | 1–2 weeks | Not started |
| 3 | Auth & app shell | [04-phase-3-auth-shell.md](04-phase-3-auth-shell.md) | 1 week | Not started |
| 4 | Content features (Home, Info, Prevention, Forum, Resources) | [05-phase-4-content.md](05-phase-4-content.md) | 2–3 weeks | Not started |
| 5 | Personal features (Journey, Profile, Saved items, Settings) | [06-phase-5-personal.md](06-phase-5-personal.md) | 2–3 weeks | Not started |
| 6 | Notifications & reminders | [07-phase-6-notifications.md](07-phase-6-notifications.md) | 1–2 weeks | Not started |
| 7 | QA, parity check & release | [08-phase-7-qa-release.md](08-phase-7-qa-release.md) | 1–2 weeks | Not started |
| 8 | Cutover & Flutter retirement | [09-phase-8-cutover.md](09-phase-8-cutover.md) | 2–3 days | Not started |

Estimates assume one developer working full time. Update the **Status** column (`Not started` / `In progress` / `Done`) as each phase finishes.

## Branching

```
main ─────●──────────●───────────────────────────────●  (Flutter; merge target at the end)
           \          \ (merge main in regularly)    /
react-native-migration ●──●──●──●──●──●──●──●──●──●──   (all React Native work)
                         \  /  \  /
            rn/phase-1-setup    rn/phase-4-forum …       (one short branch per phase/screen group)
```

- Create the migration branch once, from `main`: `git checkout -b react-native-migration && git push -u origin react-native-migration`.
- Each phase (or screen group) gets a short branch **from `react-native-migration`**, e.g. `rn/phase-4-forum`, and a PR **into `react-native-migration`**.
- Flutter fixes (like the GNews key fix in Phase 0) go on their own branch from `main` and a PR into `main`, as usual.
- At least every week, bring `main` into the migration branch so the final merge stays small:
  ```bash
  git checkout react-native-migration && git pull && git merge origin/main && git push
  ```
  Because the new app lives only in `mobile/`, these merges should have no conflicts.

## How to work through a phase

1. Read the phase doc fully before starting.
2. Create a branch from `react-native-migration`: `rn/phase-N-short-name` (for example `rn/phase-4-forum`).
3. Work through the checklist; tick boxes in the doc in the same PR.
4. A phase is done only when every item in its **Done when** section is true.
5. Merge the PR into `react-native-migration`, update the status table above, and start the next phase.

## Decision log

Record every decision that changes this plan. Add new rows at the bottom.

| Date | Decision | Why | Who |
|---|---|---|---|
| 2026-10-22 | Rewrite in Expo + TypeScript, keep Supabase backend | Backend is framework-neutral; only the client changes | — |
| 2026-10-22 | React Native app lives in `mobile/` in this repo | Keeps history and SQL/docs together; Flutter stays untouched until cutover | — |
| 2026-10-22 | All migration work on `react-native-migration`, merged into `main` once at the end (not force-pushed) | Keeps `main` purely Flutter until the new app is ready; merging keeps both histories | — |
| _pending_ | Final app ID / bundle ID (current is `com.example.cancerapp`) | Google Play rejects `com.example.*`; see Phase 0 | — |
| _pending_ | Separate Supabase dev project, or production only | See Phase 0 | — |
| _pending_ | Port the unused forum/resource notification methods, or drop them | See Phase 6 | — |
