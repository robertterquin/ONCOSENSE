# Phase 1 — Project Setup

**Goal:** an empty Expo app in `mobile/` that builds on Android and iOS, connects to Supabase, and has tooling in place.
**Effort:** 3–5 days. **Branch:** `rn/phase-1-setup`.

## Tasks

### 1.1 Create the project

- [x] From the repo root:
  ```bash
  npx create-expo-app@latest mobile --template default
  ```
- [x] Record the Expo SDK version in the [decision log](README.md#decision-log) (SDK 58). Upgrade SDKs deliberately, never mid-phase.
- [x] Remove the template's example screens, components and images; keep `src/app/_layout.tsx` and `src/app/index.tsx`.
- [x] Keep the template's `AGENTS.md` / `CLAUDE.md` (AI-assistant notes for Expo) and drop its `LICENSE` (the repo has its own).

### 1.2 Folder structure

```
mobile/
  src/
    app/               # Expo Router screens (routes only, thin)
    api/               # Supabase + Edge Function calls (one file per service)
    hooks/             # TanStack Query hooks (replace Riverpod providers)
    stores/            # Zustand stores (theme, settings, notification prefs)
    types/             # TypeScript types (replace lib/models)
    components/        # Shared UI (AppHeader, Button, InputField, cards)
    theme/             # Colors, spacing, radius, typography
    lib/               # supabase client, env, storage helpers, notifications
    constants/         # Ported from lib/utils/constants.dart
  assets/              # Logo, Poppins font
  .env.example
```

Rule: screens in `src/app/` call hooks; hooks call `src/api`; only `src/api` talks to Supabase. This mirrors today's screen → provider → service layering. Folders are created when their first file is added; Phase 1 has `app/`, `api/` and `lib/`.

### 1.3 Configuration

- [x] `app.json`: name `OncoSense`, slug `oncosense`, `scheme: "oncosense"`, `android.package` and `ios.bundleIdentifier` `com.oncosense.app`, icon and splash from `assets/images/logo.png` (copy of `oncosense_logoo.png`), splash background `#FFFFFF`. (Fonts: Phase 2 replaced the bundled Poppins file with `@expo-google-fonts/poppins`.)
- [x] `tsconfig.json`: `"strict": true`, the `@/*` → `src/*` path alias, and `"types": ["jest"]` (TypeScript 6 no longer includes `@types/*` automatically).
- [x] `.env.example` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Only the Supabase **anon** key goes here — it's designed to be public; RLS protects data. No other secrets in the app.
- [x] `mobile/.env` filled in from the Flutter app's root `.env` and git-ignored.

### 1.4 Dependencies

Installed in Phase 1:

```bash
cd mobile
npx expo install @supabase/supabase-js expo-sqlite expo-dev-client
npm install @tanstack/react-query zustand date-fns
npx expo install jest-expo jest @types/jest @testing-library/react-native eslint eslint-config-expo prettier --dev
```

The template already includes `expo-font`, `expo-image`, `expo-linking`, `expo-splash-screen` and `expo-web-browser`.
Added later, in the phase that first needs them (so the app doesn't ask for permissions it doesn't use yet):

| Package | Phase |
|---|---|
| `react-hook-form`, `zod`, `@hookform/resolvers` | 3 |
| `@react-native-community/datetimepicker`, `@react-native-community/slider`, `expo-image-picker`, `expo-image-manipulator` | 5 |
| `expo-notifications` | 6 |

Use `npx expo install` for anything native so versions match the SDK, and run `npx expo-doctor` after adding packages.

### 1.5 Supabase client

- [x] `src/lib/env.ts`: reads and validates the two `EXPO_PUBLIC_*` variables with a clear setup error (unit-tested).
- [x] `src/lib/supabase.ts`: client with `expo-sqlite`'s `localStorage` for session storage, `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: false`, and the `AppState` listener that starts/stops token refresh (per the [Expo Supabase guide](https://docs.expo.dev/guides/using-supabase/)).
- [x] Smoke test: temporary `src/app/index.tsx` reads 5 rows from `cancer_types` through `src/api/cancerInfo.ts`. Verified in the browser against the current Supabase project.

### 1.6 Tooling

- [x] ESLint (`eslint-config-expo`) + Prettier configs; `npm run lint`, `npm run typecheck`, `npm test`, `npm run format` scripts.
- [x] GitHub Actions workflow `.github/workflows/mobile.yml` runs lint, typecheck and tests on PRs and pushes touching `mobile/**` only (so the Flutter side is unaffected).
- [x] `eas.json` with `development`, `preview` and `production` profiles.
- [ ] Create the EAS project: `npx eas-cli@latest login` then `npx eas-cli@latest init` (adds the project ID to `app.json`).
- [ ] Make one development build each for Android and iOS and install them: `npx eas-cli@latest build --profile development --platform all`, or locally with `npm run ios` / `npm run android` (needs Xcode + CocoaPods / Android Studio). *(iOS done locally with `npm run ios`; Android not yet.)*

## Done when

- [ ] `mobile/` runs on an Android emulator and iOS simulator via the development build. *(iOS Simulator done; Android not yet.)*
- [x] The smoke test screen shows real `cancer_types` rows from Supabase (checked on web; iOS and Android bundles build with `npx expo export`).
- [x] CI passes on the PR; `git diff origin/main...HEAD --stat` shows no changes outside `mobile/`, `.github/workflows/mobile.yml`, `.gitignore` and `docs/`. *(CI green on `main`, 2026-10-25; Flutter has since left `main`.)*
