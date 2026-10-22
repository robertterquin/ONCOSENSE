# Phase 3 — Auth & App Shell

**Goal:** a user can open the app, sign up, sign in, reset their password, stay signed in, sign out, and move between the six tabs (placeholder content is fine).
**Effort:** 1 week. **Branch:** `rn/phase-3-auth-shell`.

## Tasks

### 3.1 Launch & routing

- [ ] `src/app/_layout.tsx`: load fonts, restore the session (`supabase.auth.getSession()`), restore theme, then hide the splash screen.
- [ ] `app/index.tsx` replaces `splash_screen.dart`: redirect to `(tabs)` when signed in (respecting the remember-me rule in `supabase_service.dart → hasActiveSession`), otherwise to `(auth)/welcome`.
- [ ] Port the first-launch notification setup check (`notifications_setup_complete`) as a no-op flag for now; Phase 6 wires it up.
- [ ] Auth guard: `(tabs)` and all signed-in routes redirect to `(auth)/welcome` when the session ends (replaces `auth_state_listener.dart`).
- [ ] Unknown routes go to Welcome (matches `AppRoutes.onUnknownRoute`).

### 3.2 Auth screens

| Screen | Must keep |
|---|---|
| Welcome | Logo, tagline "Empowering Awareness. Saving Lives.", Sign in / Create account |
| Login | Email + password validation, remember-me toggle, "Forgot password" link, error messages from `constants.dart` |
| Register | Name, email, age (13–120), gender options, password + confirm, terms checkbox; metadata saved as today (`name`, `full_name`, `age`, `gender`) |
| Forgot password | `resetPasswordForEmail`, success message |

- [ ] Sign-up with the same metadata keys so users created by either app look identical.
- [ ] Check with a user created in the Flutter app: they can sign in to the React Native app and see their name/age/gender.

### 3.3 Tab shell

- [ ] `app/(tabs)/_layout.tsx` with six tabs in today's order: Home, Info, Prevention, Forum, Resources, Journey — same labels, equivalent icons (`@expo/vector-icons` MaterialIcons has the same outlined icons used in `main_navigation.dart`).
- [ ] Each tab renders a placeholder screen with `AppHeader`.
- [ ] Tabs keep their state when switching (Flutter caches tab screens in `_screenCache`; Expo Router tabs do this by default).

### 3.4 Tests

- [ ] Component tests for login/register validation.
- [ ] Maestro flow: launch → register (dev project) → land on Home tab → sign out → sign in.

## Done when

- [ ] Sign up, sign in, sign out, password reset and remember-me all work on Android and iOS.
- [ ] A Flutter-created account works in the React Native app (and vice versa).
- [ ] All six tabs are reachable; Android back button behaves correctly (exits from Home, goes back elsewhere).
