# Inventory of the Current Flutter App

A snapshot of everything the React Native app must reproduce, taken from `main` at commit `651c52d` (2026-10-22).
It doubles as the **parity checklist** used in [Phase 7](08-phase-7-qa-release.md).

Size: ~24,700 lines of Dart in `lib/` — 28 screen files (including the splash screen and tab shell), 13 services, 12 providers (incl. a barrel file), 13 models.

## 1. Screens and target routes

Expo Router maps files under `mobile/src/app/` to routes. `(auth)` and `(tabs)` are route groups (they don't appear in the URL).

| Flutter screen | Lines | How it's reached today | Target file in `mobile/src/app/` | Phase |
|---|---|---|---|---|
| `splash/splash_screen.dart` | 137 | `/` (initial route) | `index.tsx` (redirect) + native splash | 3 |
| `auth/welcome_screen.dart` | 154 | `/welcome` | `(auth)/welcome.tsx` | 3 |
| `auth/login_screen.dart` | 329 | `/login` | `(auth)/login.tsx` | 3 |
| `auth/register_screen.dart` | 539 | `/register` | `(auth)/register.tsx` | 3 |
| `auth/forgot_password_screen.dart` | 338 | `/forgot-password` | `(auth)/forgot-password.tsx` | 3 |
| `main_navigation.dart` | 138 | `/home` (6 bottom tabs) | `(tabs)/_layout.tsx` | 3 |
| `home/home_screen.dart` | 1398 | Tab: Home | `(tabs)/home.tsx` | 4 |
| `cancer_info/cancer_info_screen.dart` | 444 | Tab: Info | `(tabs)/info.tsx` | 4 |
| `cancer_info/cancer_detail_screen.dart` | 324 | Push from Info / itself | `cancer/[id].tsx` | 4 |
| `prevention/prevention_screen.dart` | 693 | Tab: Prevention | `(tabs)/prevention.tsx` | 4 |
| `forum/forum_screen.dart` | 507 | Tab: Forum | `(tabs)/forum.tsx` | 4 |
| `forum/ask_question_screen.dart` | 346 | Push from Forum | `forum/ask.tsx` | 4 |
| `forum/question_detail_screen.dart` | 954 | Push from Forum / Saved questions | `forum/[id].tsx` | 4 |
| `resources/resources_screen.dart` | 588 | Tab: Resources | `(tabs)/resources.tsx` | 4 |
| `notifications/notification_center_screen.dart` | 515 | Push from Home | `notifications.tsx` | 6 |
| `journey/journey_screen.dart` | 1474 | Tab: Journey | `(tabs)/journey.tsx` | 5 |
| `journey/journey_onboarding_screen.dart` | 849 | `/journey-setup` | `journey/onboarding.tsx` | 5 |
| `journey/journey_setup_screen.dart` | 690 | Push from Journey | `journey/setup.tsx` | 5 |
| `journey/add_entry_screen.dart` | 631 | Push from Journey | `journey/add-entry.tsx` | 5 |
| `journey/add_treatment_screen.dart` | 622 | Push from Journey | `journey/add-treatment.tsx` | 5 |
| `profile/profile_screen.dart` | 731 | Push from Home | `profile/index.tsx` | 5 |
| `profile/edit_profile_screen.dart` | 739 | Push from Profile | `profile/edit.tsx` | 5 |
| `profile/settings_screen.dart` | 1142 | `/settings`, push from Profile | `profile/settings.tsx` | 5 |
| `profile/change_password_screen.dart` | 335 | `/change-password` | `profile/change-password.tsx` | 5 |
| `profile/notifications_screen.dart` | 423 | Push from Profile | `profile/notifications.tsx` | 6 |
| `profile/saved_articles_screen.dart` | 414 | Push from Profile | `profile/saved/articles.tsx` | 5 |
| `profile/saved_questions_screen.dart` | 507 | Push from Profile | `profile/saved/questions.tsx` | 5 |
| `profile/saved_resources_screen.dart` | 482 | Push from Profile | `profile/saved/resources.tsx` | 5 |

Shared widgets: `widgets/custom_app_header.dart`, `widgets/auth_state_listener.dart`, `screens/auth/widgets/auth_button.dart`, `screens/auth/widgets/input_field.dart`.

## 2. Supabase backend (reused as-is)

### Tables, by the service that uses them

| Service | Tables / RPC functions |
|---|---|
| `bookmark_service.dart` | `article_bookmarks`, `question_bookmarks`, `resource_bookmarks` |
| `cancer_info_service.dart` | `cancer_types` |
| `forum_service.dart` | `questions`, `answers`, `question_votes`, `answer_votes`, `reports`; RPC `increment_/decrement_question_upvotes`, `increment_/decrement_answer_upvotes`, `increment_/decrement_answer_count` |
| `health_reminders_service.dart` | `health_reminders` |
| `journey_service.dart` | `journey_entries`, `journey_treatments`, `journey_milestones` |
| `prevention_service.dart` | `prevention_tips`, `self_check_guides` |
| `resources_service.dart` | `resources` |

Setup SQL already in the repo: `BOOKMARK_TABLES_SETUP.sql`, `JOURNEY_TABLES_SETUP.sql`, `CANCER_DATA_SETUP.md`.

### Storage

- Bucket `images`, path `profile_pictures/<file>`; the public URL is saved to user metadata `profile_picture_url` (`edit_profile_screen.dart`).

### Auth

- Email + password: `signUp`, `signInWithPassword`, `signOut`, `resetPasswordForEmail`, `updateUser` (profile and password), `onAuthStateChange`.
- User metadata keys: `name`, `full_name`, `age`, `gender`, `profile_picture_url`, `journey_started`.
- "Remember me" is implemented on top of Supabase's session with two local flags (`supabase_service.dart`).
- **Known gap:** `deleteAccount()` only clears local data and signs out — it does not delete the Supabase user. App Store review requires real in-app account deletion. Plan for this in [Phase 5](06-phase-5-personal.md).

## 3. External services

| Service | Where | Notes |
|---|---|---|
| GNews API (`https://gnews.io/api/v4`) | `gnews_service.dart` | **API key is hard-coded in source** and has been in git history since commit `47ccd8d`. Fixed in [Phase 0](01-phase-0-preparation.md). |
| Health tips | `health_tips_service.dart` | Static data in code, no network. |
| Health reminders defaults | `health_reminders_service.dart` | Large built-in list (~650 lines) used to seed/fallback. |

## 4. Data stored only on the device

These live in `SharedPreferences` today. They **do not transfer** to the React Native app (different storage), so users get defaults after upgrading. That's acceptable for settings, but decide it consciously.

| Key | Purpose | Plan |
|---|---|---|
| `dark_mode_enabled` | Theme | Re-create in Zustand + `localStorage` |
| remember-me + active-session flags | Login persistence | Re-create |
| `notifications_enabled`, `health_reminders_enabled`, `notifications_setup_complete` | Notification setup | Re-create |
| `notification_health_tips`, `_hydration`, `_movement`, `_sun_protection`, `_self_check`, `_weekly_checkin`, `_forum` | Per-type toggles | Re-create |
| `stored_notifications` | Notification center history | Re-create (history resets once) |
| `<userId>_journey_started`, diagnosis date, cancer-free start date, entries/treatments/milestones cache | Journey offline cache | Re-create as cache; Supabase is the source of truth |

## 5. Notifications

All are **local** (no push server). Defined in `notification_service.dart`:

| Method | Schedule |
|---|---|
| `scheduleDailyHealthTip` | Daily at a time |
| `scheduleHydrationReminders` | Several daily times |
| `scheduleMovementReminders` | Several daily times |
| `scheduleSunProtectionReminder` | Daily at 10:00 by default |
| `scheduleMonthlyBreastSelfExam` | Monthly, day of month + time |
| `scheduleScreeningReminder` | One-off date |
| `scheduleWeeklyCheckIn` | Weekly, weekday + time |
| `showForumReplyNotification`, `showForumUpvoteNotification`, `showResourceUpdateNotification` | Immediate — **defined but never called anywhere** |

Android notification channels are created in `_createNotificationChannels()`.
`workmanager` is listed in `pubspec.yaml` but **not used in code**, so there is no background-task logic to port.

## 6. Other behaviours to keep

- Forum list refreshes its UI every 10 seconds (`Timer.periodic` in `forum_screen.dart`) to update relative times.
- Light and dark themes; brand colors in `lib/utils/theme.dart` (primary pink `#E91E63`, dark pink `#C2185B`, accent purple `#9C27B0`, dark background `#121212`).
- Validation rules in `lib/utils/constants.dart`: password ≥ 6, name ≥ 2, age 13–120, email regex, gender options.
- Poppins Regular font, logo `assets/images/oncosense_logoo.png`.
- Current app ID: `com.example.cancerapp` (Android). Must change before store release.

## 7. Tests today

Only `test/widget_test.dart` (app loads). There is no existing test suite to port; the React Native app adds its own.
