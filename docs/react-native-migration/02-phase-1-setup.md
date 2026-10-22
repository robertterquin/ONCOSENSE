# Phase 1 — Project Setup

**Goal:** an empty Expo app in `mobile/` that builds on Android and iOS, connects to Supabase, and has tooling in place.
**Effort:** 3–5 days. **Branch:** `rn/phase-1-setup`.

## Tasks

### 1.1 Create the project

- [ ] From the repo root:
  ```bash
  npx create-expo-app@latest mobile --template default
  ```
- [ ] Record the Expo SDK version in the [decision log](README.md#decision-log). Upgrade SDKs deliberately, never mid-phase.
- [ ] Remove the template's example screens; keep `app/_layout.tsx`.

### 1.2 Folder structure

```
mobile/
  app/                 # Expo Router screens (routes only, thin)
  src/
    api/               # Supabase + Edge Function calls (one file per service)
    hooks/             # TanStack Query hooks (replace Riverpod providers)
    stores/            # Zustand stores (theme, settings, notification prefs)
    types/             # TypeScript types (replace lib/models)
    components/        # Shared UI (AppHeader, Button, InputField, cards)
    theme/             # Colors, spacing, radius, typography
    lib/               # supabase client, storage helpers, notifications
    constants/         # Ported from lib/utils/constants.dart
  assets/              # Logo, Poppins font
  .env.example
```

Rule: screens in `app/` call hooks; hooks call `src/api`; only `src/api` talks to Supabase. This mirrors today's screen → provider → service layering.

### 1.3 Configuration

- [ ] `app.json` / `app.config.ts`: name `OncoSense`, slug, `scheme: "oncosense"`, `android.package` and `ios.bundleIdentifier` from Phase 0, icon and splash from `assets/images/oncosense_logoo.png`, splash background `#FFFFFF`.
- [ ] `tsconfig.json`: `"strict": true` and the `@/*` → `src/*` path alias.
- [ ] `.env.example` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Only the Supabase **anon** key goes here — it's designed to be public; RLS protects data. No other secrets in the app.

### 1.4 Dependencies

```bash
cd mobile
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill \
  expo-notifications expo-image-picker expo-image expo-linking expo-web-browser expo-font expo-splash-screen expo-dev-client
npm install @tanstack/react-query zustand react-hook-form zod @hookform/resolvers date-fns
npm install -D jest-expo jest @testing-library/react-native @types/jest eslint prettier
```

Use `npx expo install` for anything native so versions match the SDK.

### 1.5 Supabase client

- [ ] `src/lib/supabase.ts`: create the client with AsyncStorage for session storage, `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: false`, and the `AppState` listener that starts/stops token refresh (as in the Supabase React Native guide).
- [ ] Smoke test: a temporary screen that reads 5 rows from `cancer_types` from the dev project.

### 1.6 Tooling

- [ ] ESLint + Prettier configs; `npm run lint`, `npm run typecheck` (`tsc --noEmit`), `npm test` scripts.
- [ ] GitHub Actions workflow `.github/workflows/mobile.yml` that runs lint, typecheck and tests on PRs touching `mobile/**` only (so the Flutter side is unaffected).
- [ ] `eas.json` with `development`, `preview` and `production` profiles. Make one development build each for Android and iOS and install them.

## Done when

- [ ] `mobile/` runs on an Android emulator and iOS simulator via the development build.
- [ ] The smoke test screen shows real `cancer_types` rows from the dev Supabase project.
- [ ] CI passes on the PR; `git diff origin/main...HEAD --stat` shows no changes outside `mobile/`, `.github/workflows/mobile.yml`, `.gitignore` and `docs/`.
