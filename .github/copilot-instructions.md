# OncoSense — Copilot Instructions

OncoSense is a cancer awareness and support app built with **React Native (Expo SDK 58) + TypeScript** and a **Supabase** backend. The app lives in `mobile/`; Supabase Edge Functions live in `supabase/functions/`. The Flutter app it replaced is archived at the `flutter-final` tag — don't add Dart or Flutter code.

Read `mobile/AGENTS.md` too: Expo changes every SDK release, so check the versioned Expo docs instead of relying on memory.

## Stack

- **Navigation:** Expo Router. Every file in `mobile/src/app/` is a route; `(auth)` and `(tabs)` are route groups.
- **Server data:** TanStack Query hooks in `src/hooks/`, calling Supabase through `src/api/`.
- **Local state:** Zustand stores in `src/stores/`, persisted with `persistStorage` (`expo-sqlite` localStorage).
- **Forms:** react-hook-form + zod; every schema lives in `src/constants/validation.ts`.
- **Notifications:** local reminders with expo-notifications in `src/lib/notifications/` (`reminders.ts` is the schedule, `device.ts` the only file that calls expo-notifications, `service.ts` the logic).
- **UI:** shared components in `src/components/` (`Screen`, `AppHeader`, `AppText`, `Button`, `MenuItem`, `PinkSwitch`, …); colors and type in `src/theme/`. Material icon names (snake_case, as stored in the database) go through `MaterialIcon`.

## Conventions

- **Dates:** the database stores local wall-clock time without a time zone. Always use `parseDbTimestamp` / `toDbTimestamp` from `src/lib/dates.ts`.
- **Database rows → models:** mappers in `src/types/` (`fooFromRow`, `fooToRow`); screens never touch raw rows.
- **Web:** the app also runs in the browser. No buttons nested inside other buttons; use `confirm()` from `src/lib/confirm.ts` instead of `Alert.alert`; give platform-specific code a `.web.ts` twin.
- **Accessibility:** every pressable gets `accessibilityRole`, icon-only buttons get `accessibilityLabel`, selectable items get `accessibilityState`. Keep text contrast at WCAG AA (4.5:1).
- **Secrets:** only `EXPO_PUBLIC_SUPABASE_URL` and the anon key go in the app (`mobile/.env`, git-ignored). Anything secret belongs in an Edge Function.
- **Native folders:** `mobile/ios` and `mobile/android` are generated; change native settings in `app.json` or config plugins.
- Add packages with `npx expo install <package>`.

## Commands (run in `mobile/`)

```bash
npm run web          # run in the browser
npm run ios          # development build on iOS (Xcode)
npm run android      # development build on Android (Android Studio)
npm run lint
npm run typecheck
npm test
npx expo-doctor
```

Run lint, typecheck and tests before considering a change done; CI runs the same on every pull request.

## Workflow

Short-lived branches from `main`, merged back with a merge commit. Never force-push `main`. Plans and decisions are recorded in `docs/react-native-migration/README.md`.
