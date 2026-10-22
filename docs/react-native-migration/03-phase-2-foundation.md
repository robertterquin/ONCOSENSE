# Phase 2 — Foundation

**Goal:** everything screens will need: types, API layer, data hooks, stores, theme and shared components — built and tested before any feature screen.
**Effort:** 1–2 weeks. **Branch:** `rn/phase-2`.

## 2.1 Types (replace `lib/models/`)

One file per model in `mobile/src/types/`. Models use camelCase fields and `Date` objects; each file has a `…FromRow` mapper (and `…ToRow` where the app writes) that converts Supabase's snake_case columns, with the same defaults as the Dart `fromJson`. Shared column readers are in `src/types/row.ts`.

| Flutter model | TypeScript file | Notes |
|---|---|---|
| `answer.dart` | `answer.ts` | |
| `app_notification.dart` | `appNotification.ts` | Same storage shape as Flutter (for Phase 6) |
| `article.dart` | `article.ts` | `articleFromGNews` maps the news function's output |
| `cancer_type.dart` | `cancerType.ts` | |
| `health_reminder.dart` | `healthReminder.ts` | `shouldShowReminder` |
| `health_tip.dart` | `healthTip.ts` | |
| `journey_entry.dart` | `journeyEntry.ts` | Mood emoji/labels, `COMMON_SYMPTOMS` |
| `milestone.dart` | `milestone.ts` | Milestone templates |
| `prevention_tip.dart` | `preventionTip.ts` | |
| `question.dart` | `question.ts` | Display name, `FORUM_CATEGORIES`, category icons |
| `resource.dart` | `resource.ts` | |
| `self_check_guide.dart` | `selfCheckGuide.ts` | Reads JSONB arrays or JSON strings |
| `treatment.dart` | `treatment.ts` | Type labels/icons, `treatmentProgress` |

- [x] Port each model's `fromJson` / `toJson` logic, including date parsing and defaults for missing fields.
- [x] Unit test the mappers with sample rows (`src/types/__tests__/mappers.test.ts`).
- [ ] Optional: generate DB types with `supabase gen types typescript` (needs `supabase login`).

### Dates (important)

The Flutter app saves local wall-clock time with no time zone (`DateTime.now().toIso8601String()`) into `timestamptz` columns, and reads the stored digits back as local time. `src/lib/dates.ts` does the same (`toDbTimestamp` / `parseDbTimestamp`), so journal entries, forum posts and other rows written by either app show the same day and time in both. Tests run in three time zones.

## 2.2 API layer (replace `lib/services/`)

One module per service in `mobile/src/api/`. Plain async functions, no UI code; every failure throws an `ApiError` (`src/api/errors.ts`).

| Flutter service | `src/api/` module | Notes |
|---|---|---|
| `supabase_service.dart` | `auth.ts` | Sign up/in/out, reset, profile & password update, journey-setup metadata, user-metadata readers |
| `bookmark_service.dart` | `bookmarks.ts` | Saving twice is ignored (tables have UNIQUE constraints) |
| `cancer_info_service.dart` | `cancerInfo.ts` | |
| `forum_service.dart` | `forum.ts` | Questions, answers, votes (6 RPCs), reports |
| `gnews_service.dart` | `news.ts` | Calls the `news` Edge Function; same safety/trusted-source filters |
| `health_tips_service.dart` | `healthTips.ts` | Data in `src/constants/healthTips.ts` (31 tips) |
| `health_reminders_service.dart` | `healthReminders.ts` | Fallback list in `src/constants/defaultReminders.ts` (55 reminders) |
| `journey_service.dart` | `journey.ts` + `src/lib/journey.ts` | API in `journey.ts`; streaks, stats and milestone rules are pure functions in `lib/journey.ts` |
| `prevention_service.dart` | `prevention.ts` | |
| `resources_service.dart` | `resources.ts` | Same built-in fallback list |
| `notification_service.dart`, `notification_storage_service.dart` | — | Phase 6 |
| `theme_provider.dart` | `src/stores/themeStore.ts` | |

- [x] Port each function with the same filters, ordering and limits (`DATA_LIMITS` in `src/constants/app.ts`).
- [x] Search text is quoted before it goes into PostgREST `or()` filters, so commas or parentheses can't break a search.
- [x] Built-in tips and reminders converted from the Dart source by script, not by hand.
- [ ] Verify the write paths (bookmark, vote, post, journal save/delete) against Supabase with a signed-in user — needs the Phase 3 sign-in screens.

### Deliberate differences from Flutter

- **Journey deletes really delete.** Flutter removed deleted entries, treatments and milestones only on the device, so they came back on the next load from Supabase. The new app deletes the row.
- **Journey saves write one row.** Flutter re-saved every entry on each change.
- **Cancer-free date is saved to user metadata** when changed later (Flutter kept later changes on the device only).
- **Anonymous forum names** use a stable hash in JavaScript; Dart's `hashCode` can't be reproduced, so the "Anonymous …" name may differ from the one Flutter shows.

## 2.3 State (replace Riverpod + GetIt)

- **TanStack Query** for server data, one hook file per Riverpod provider file in `src/hooks/`; all keys in `src/hooks/queryKeys.ts`. Per-user data includes the user id in its key.
- **Zustand** (persisted with `localStorage` from `src/lib/storage.ts`) for device state.
- **GetIt is not needed**: modules are imported directly.

| Riverpod provider | Replacement |
|---|---|
| `auth_provider.dart`, `supabase_provider.dart` | `src/stores/authStore.ts` (session, user, remember-me, `startAuthListener`) |
| `bookmark_provider.dart` | `src/hooks/useBookmarks.ts` (optimistic `toggle`; "is saved" and counts derived from the lists) |
| `cancer_info_provider.dart` | `src/hooks/useCancerInfo.ts` |
| `forum_provider.dart` | `src/hooks/useForum.ts` (optimistic upvotes) |
| `home_provider.dart` | `src/hooks/useHome.ts` |
| `journey_provider.dart` | `src/hooks/useJourney.ts` (auto streak/treatment/days-free milestones) |
| `prevention_provider.dart` | `src/hooks/usePrevention.ts` |
| `resources_provider.dart` | `src/hooks/useResources.ts` |
| `theme_provider.dart` | `src/stores/themeStore.ts` (light by default, like Flutter) |
| `notification_provider.dart` | Phase 6 |

- [x] `QueryClientProvider` with a shared client (`src/lib/queryClient.ts`) in `src/app/_layout.tsx`.
- [ ] Clear the query cache on sign-out — Phase 3 (sign-out flow).

## 2.4 Theme

- [x] `src/theme/colors.ts`: brand colors, light and dark palettes and gradients from `lib/utils/theme.dart`.
- [x] `src/theme/tokens.ts`: spacing (8/16/24/32), radius (8/12/16/24) and durations (200/300/500 ms).
- [x] `src/theme/typography.ts`: Poppins 400/500/600/700 from `@expo-google-fonts/poppins` (Flutter used Google Fonts Poppins), loaded with `useFonts` in the root layout; text variants from the Flutter `TextTheme`.
- [x] `useTheme()` returns the active palette from `themeStore`.

## 2.5 Shared components (`src/components/`)

- [x] `AppHeader` (from `custom_app_header.dart`: gradient, decorative circles, back button)
- [x] `Button` (from `auth_button.dart`: gradient or outlined, loading), `InputField` (from `input_field.dart`: label, error, password toggle)
- [x] `Screen` (safe area, background, scroll, pull-to-refresh), `Card`, `AppText`, `MaterialIcon` (accepts Flutter icon names like `water_drop`)
- [x] `LoadingState`, `ErrorState` (with Retry), `EmptyState`
- [x] Validation from `constants.dart` as `zod` schemas in `src/constants/validation.ts`, same messages (age optional, as on the register screen).
- [x] Dev-only screens: `/dev/components` (component gallery, light/dark toggle) and `/dev/data` (calls each read-only hook against Supabase).

## Done when

- [x] All 13 model types and all API modules exist; mappers, dates, journey rules, validation and news filters have unit tests (40 tests).
- [x] Every read-only hook returns real data on `/dev/data`: cancer types, prevention tips, self-check guides, resources, reminders, forum questions and answers. News fails until the `news` function is deployed (Phase 0).
- [ ] Write hooks verified with a signed-in user (Phase 3).
- [ ] The component gallery matches the Flutter look in both themes — needs a side-by-side review against the Phase 0 screenshots.
