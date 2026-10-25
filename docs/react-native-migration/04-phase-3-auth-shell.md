# Phase 3 — Auth & App Shell

**Goal:** a user can open the app, sign up, sign in, reset their password, stay signed in, sign out, browse as a guest, and move between the six tabs (placeholder content is fine).
**Effort:** 1 week. **Branch:** `rn/phase-3`.

## 3.1 Launch & routing

- [x] `src/app/_layout.tsx`: loads fonts, restores the session (`startAuthListener`), keeps the native splash screen (logo on white) until both are ready, and hosts the toast messages.
- [x] `src/app/index.tsx` replaces `splash_screen.dart`: signed in with "remember me" → Home (or journey setup if it isn't done); otherwise → Welcome. Flutter's extra 3-second animated splash is dropped — the native splash shows instead.
- [x] Guard in `src/app/(tabs)/_layout.tsx`: without a session (and not a guest) the tabs redirect to Welcome, including when the session ends while the app is open (replaces `auth_state_listener.dart`).
- [x] First-launch notification setup (`notifications_setup_complete`) — Phase 6. *(Done in Phase 6: `setupComplete`.)*
- [x] Unknown routes: Expo Router's "Unmatched Route" page with a link back.

## 3.2 Auth screens (`src/app/(auth)/`)

| Screen | As built |
|---|---|
| `welcome.tsx` | Logo, "OncoSense", tagline, "Create an account" / "I already have an account" pill buttons |
| `login.tsx` | Email + password (non-empty), remember-me checkbox, "Forgot Password?", Login, **Continue as Guest**, link to Register; "Welcome back!" toast |
| `register.tsx` | Full name, email, password with the live 5-rule checklist, confirm, age (optional, 13–120), gender chips (optional), terms checkbox; metadata `full_name`, `age`, `gender` (same keys as Flutter) |
| `forgot-password.tsx` | Email → `resetPasswordForEmail`; "Email Sent!" view with Back to Login and Resend |

- [x] Form validation with `react-hook-form` + `zod`, same messages and rules as Flutter (`src/constants/validation.ts`). Register uses Flutter's stronger password rules (8+ characters, upper, lower, number, special); login only requires a non-empty password.
- [x] Supabase auth errors are shown as-is in a toast (e.g. "Invalid login credentials"), like Flutter's SnackBars.
- [x] After registering: journey setup if a session was created; if the project requires email confirmation, a message and the Login screen (Flutter assumed a session).
- [x] Shared pieces: `AuthLayout`, `Checkbox`, `FormField`, `ToastHost` / `showToast`, `src/hooks/useAuth.ts` (`useSignIn`, `useSignUp`, `useResetPassword`, `useSignOut`, `continueAsGuest`).
- [x] Check with a Flutter-created account: sign in to the React Native app and see the same name/age/gender — **needs you** (I don't enter real credentials). *(Moved to the redesign Phase 6 test-account run.)*

## 3.3 Tab shell (`src/app/(tabs)/`)

- [x] Six tabs in Flutter's order and labels: `home`, `info`, `prevention`, `forum`, `resources`, `journey`, in a floating rounded bar (selected `#D81B60`, 9px labels).
- [x] Placeholder screens use the Flutter headers' titles and subtitles. Home temporarily shows the account and a Sign out / Back to Welcome button plus dev links (moves to Profile in Phase 5).
- [x] `journey/onboarding.tsx` placeholder with "Skip for now" (Phase 5 builds it).
- [x] Tabs keep their state when switching.
- Tab icons are the filled Material icons; the outlined variants Flutter shows for unselected tabs aren't in the React Native icon set, so the selected tab is shown by color.

## 3.4 Sign-out & guest mode

- [x] `useSignOut`: signs out, forgets "remember me", clears all cached data (so the next user never sees it) and returns to Welcome.
- [x] Guest mode lasts until the app is closed (like Flutter); signing in ends it.

## 3.5 Tests

- [x] Unit tests for the login/register/reset schemas, including the password rules and the "Passwords do not match" message (44 tests total).
- [x] Browser walkthrough at phone size: launch → Welcome → Login errors → Continue as Guest → all six tabs → Back to Welcome; `/home` while signed out redirects to Welcome; Register checklist, mismatch and terms messages (no account created); Forgot Password errors.
- [x] Maestro end-to-end flow on a device: register → Home → sign out → sign in — needs a development build and a test account. *(Moved to the redesign Phase 7 Maestro item.)*

## Done when

- [x] Sign up, sign in, sign out, password reset and remember-me work on Android and iOS — screens and logic are done; real sign-in not yet run (needs your account or a dev Supabase project). *(Moved to the redesign Phase 6 test-account run.)*
- [x] A Flutter-created account works in the React Native app (and vice versa). *(Moved to the redesign Phase 6 test-account run.)*
- [x] All six tabs are reachable; signed-out users can't open them.
- [x] Android back button: exits from Home, goes back elsewhere — check on a device. *(Moved to the Phase 7 real-device check.)*

## Notes

- **No hot reload on this Mac.** Without Watchman, the dev server doesn't notice file changes, and new route files show "Unmatched Route" until it restarts. Install it with `brew install watchman`, or restart `npx expo start` after edits.
- **`health_reminders` table missing.** The Supabase project has no `health_reminders` table, so both apps show the built-in reminder list. Creating the table is optional (see Phase 0's schema task).
