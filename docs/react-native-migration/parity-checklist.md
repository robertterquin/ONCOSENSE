# Parity Checklist

Every row of the [inventory](00-inventory.md), checked against the React Native app in `mobile/`.
Differences on purpose are listed in each phase doc and the [decision log](README.md#decision-log).

**Status key:** ✅ ported and checked · 🟡 ported, still needs a device or signed-in check · ➖ intentionally not ported

## 1. Screens

| Flutter screen | React Native route | Status | Notes |
|---|---|---|---|
| `splash_screen.dart` | `index.tsx` + native splash | ✅ | No extra 3-second animation (decision log) |
| `welcome_screen.dart` | `(auth)/welcome.tsx` | ✅ | |
| `login_screen.dart` | `(auth)/login.tsx` | 🟡 | Real sign-in on a device still to test |
| `register_screen.dart` | `(auth)/register.tsx` | 🟡 | Sign-up with a throwaway account still to test |
| `forgot_password_screen.dart` | `(auth)/forgot-password.tsx` | 🟡 | Reset email still to test |
| `main_navigation.dart` | `(tabs)/_layout.tsx` | ✅ | |
| `home_screen.dart` | `(tabs)/home.tsx` | ✅ | Dead "See All" buttons removed; badge and long-press test notification added in Phase 6 |
| `cancer_info_screen.dart` | `(tabs)/info.tsx` | ✅ | |
| `cancer_detail_screen.dart` | `cancer/[id].tsx` | ✅ | |
| `prevention_screen.dart` | `(tabs)/prevention.tsx` | ✅ | Guides open as a modal (`prevention/guide/[id].tsx`) like Flutter's bottom sheet |
| `forum_screen.dart` | `(tabs)/forum.tsx` | ✅ | Relative times refresh every 10 s (`useNow`) |
| `ask_question_screen.dart` | `forum/ask.tsx` | 🟡 | Posting still to test signed in |
| `question_detail_screen.dart` | `forum/[id].tsx` | 🟡 | Answer / upvote / report still to test signed in |
| `resources_screen.dart` | `(tabs)/resources.tsx` | ✅ | |
| `notification_center_screen.dart` | `notifications.tsx` | ✅ | |
| `journey_screen.dart` | `(tabs)/journey.tsx` | 🟡 | Journey data across both apps still to compare signed in |
| `journey_onboarding_screen.dart` + `journey_setup_screen.dart` | `journey/onboarding.tsx` + `JourneySetupFlow` | ✅ | Two near-identical screens merged into one flow |
| `add_entry_screen.dart` | `journey/add-entry.tsx` | 🟡 | Save still to test signed in |
| `add_treatment_screen.dart` | `journey/add-treatment.tsx` | 🟡 | Save still to test signed in |
| `profile_screen.dart` | `profile/index.tsx` | ✅ | |
| `edit_profile_screen.dart` | `profile/edit.tsx` | 🟡 | Photo upload still to test on a device |
| `settings_screen.dart` | `profile/settings.tsx` | 🟡 | Delete account needs the `delete-account` function deployed |
| `change_password_screen.dart` | `profile/change-password.tsx` | 🟡 | Still to test signed in |
| `notifications_screen.dart` | `profile/notifications.tsx` | ✅ | |
| `saved_articles_screen.dart` | `profile/saved/articles.tsx` | 🟡 | Still to test signed in with bookmarks |
| `saved_questions_screen.dart` | `profile/saved/questions.tsx` | 🟡 | Still to test signed in with bookmarks |
| `saved_resources_screen.dart` | `profile/saved/resources.tsx` | 🟡 | Still to test signed in with bookmarks |

Shared widgets: `custom_app_header.dart` → `components/AppHeader.tsx`; `auth_state_listener.dart` → `startAuthListener` + the tabs' redirect; `auth_button.dart` / `input_field.dart` → `components/Button.tsx` / `components/InputField.tsx`. ✅

## 2. Supabase backend

| Area | Status | Notes |
|---|---|---|
| Bookmarks (`article_`/`question_`/`resource_bookmarks`) | 🟡 | Write paths still to test signed in |
| `cancer_types` | ✅ | Read on web |
| Forum tables and the six RPC functions | 🟡 | Write paths still to test signed in |
| `health_reminders` | ✅ | Table doesn't exist in the project; the built-in list is used, as in Flutter |
| Journey tables | 🟡 | Deletes now reach the database (Flutter bug fixed) |
| `prevention_tips`, `self_check_guides`, `resources` | ✅ | Read on web |
| Storage `images/profile_pictures/` + `profile_picture_url` | 🟡 | Upload still to test on a device |
| Auth (sign up/in/out, reset, update user, auth listener) | 🟡 | Still to test with a real account |
| User metadata keys | ✅ | Same keys |
| "Remember me" | ✅ | `authStore.rememberMe` |
| Real account deletion | 🟡 | `delete-account` function written, not deployed |

## 3. External services

| Service | Status | Notes |
|---|---|---|
| GNews | 🟡 | Key moved to the `news` Edge Function (`fix/gnews-key`); function not deployed, key not rotated |
| Health tips (static) | ✅ | `constants/healthTips.ts` |
| Health reminder defaults | ✅ | `constants/defaultReminders.ts` |

## 4. Data stored on the device

Nothing carries over from the Flutter app (different storage); everyone starts with defaults and signs in once.

| Flutter key(s) | React Native | Status |
|---|---|---|
| `dark_mode_enabled` | `theme` store | ✅ |
| remember-me + active-session flags | `authStore` | ✅ |
| `notifications_enabled`, `notifications_setup_complete`, `notification_<type>` | `notification-prefs` store | ✅ |
| `health_reminders_enabled` | — | ➖ Read nowhere in Flutter |
| `stored_notifications` | `stored_notifications` store | ✅ |
| Journey cache | TanStack Query cache; Supabase is the source of truth | ✅ |

## 5. Notifications

| Flutter | Status | Notes |
|---|---|---|
| Daily tip, hydration, movement, sun protection, monthly self-exam, weekly check-in | 🟡 | Same times and text (unit tested); firing with the app closed still to test on devices |
| `scheduleScreeningReminder` | ✅ | Ported; nothing calls it (same as Flutter) |
| Forum and resource notifications | ➖ | Never called in Flutter (decision log) |
| Android channels | ✅ | Same IDs and importance |
| `workmanager` | ➖ | Not used in Flutter |

## 6. Other behaviour

| Behaviour | Status | Notes |
|---|---|---|
| Forum relative times refresh every 10 s | ✅ | |
| Light and dark themes, brand colors | ✅ | `theme/colors.ts` |
| Validation rules (`constants.dart`) | ✅ | `constants/validation.ts`, unit tested |
| Poppins font, logo | ✅ | |
| App ID | ✅ | `com.oncosense.app` on both platforms |
