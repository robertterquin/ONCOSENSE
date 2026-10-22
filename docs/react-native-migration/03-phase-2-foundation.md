# Phase 2 — Foundation

**Goal:** everything screens will need: types, API layer, data hooks, stores, theme and shared components — built and tested before any feature screen.
**Effort:** 1–2 weeks. **Branches:** `rn/phase-2-types-api`, `rn/phase-2-state`, `rn/phase-2-ui-kit`.

## 2.1 Types (replace `lib/models/`)

One file per model in `src/types/`. Keep field names identical to the Supabase column names (snake_case) in a `Row` type, and convert to camelCase in the API layer only if the team prefers — decide once and apply everywhere.

| Flutter model | TypeScript file |
|---|---|
| `answer.dart` | `answer.ts` |
| `app_notification.dart` | `appNotification.ts` |
| `article.dart` | `article.ts` |
| `cancer_type.dart` | `cancerType.ts` |
| `health_reminder.dart` | `healthReminder.ts` |
| `health_tip.dart` | `healthTip.ts` |
| `journey_entry.dart` | `journeyEntry.ts` |
| `milestone.dart` | `milestone.ts` |
| `prevention_tip.dart` | `preventionTip.ts` |
| `question.dart` | `question.ts` |
| `resource.dart` | `resource.ts` |
| `self_check_guide.dart` | `selfCheckGuide.ts` |
| `treatment.dart` | `treatment.ts` |

- [ ] Port each model's `fromJson` / `toJson` logic, including date parsing and defaults for missing fields.
- [ ] Optional but recommended: generate DB types with `supabase gen types typescript` into `src/types/database.ts` and build model types on top of them.
- [ ] Unit test each mapper with a sample row copied from the dev database.

## 2.2 API layer (replace `lib/services/`)

One module per service in `src/api/`. Each exports plain async functions; no UI code.

| Flutter service | `src/api/` module | Notes |
|---|---|---|
| `supabase_service.dart` | `auth.ts` | signUp, signIn, signOut, resetPassword, updateProfile, journey-setup metadata, remember-me |
| `bookmark_service.dart` | `bookmarks.ts` | 3 bookmark tables |
| `cancer_info_service.dart` | `cancerInfo.ts` | |
| `forum_service.dart` | `forum.ts` | questions, answers, votes, reports, 6 RPCs |
| `gnews_service.dart` | `news.ts` | Calls the `news` Edge Function from Phase 0 |
| `health_tips_service.dart` | `healthTips.ts` | Static data; copy as a TS array |
| `health_reminders_service.dart` | `healthReminders.ts` | Move the ~650-line default list to `src/constants/defaultReminders.ts` |
| `journey_service.dart` | `journey.ts` | Supabase is the source of truth; local cache handled by TanStack Query persistence |
| `prevention_service.dart` | `prevention.ts` | |
| `resources_service.dart` | `resources.ts` | |
| `notification_service.dart`, `notification_storage_service.dart` | `src/lib/notifications/` | Built in Phase 6 |
| `theme_provider.dart` | `src/stores/themeStore.ts` | |

- [ ] Port each function and keep the same query filters, ordering and limits (see `DataLimits` in `constants.dart`).
- [ ] Every function throws a typed error; screens never see raw Supabase errors.
- [ ] Integration-test the forum vote flow against the dev project (vote → RPC → count changes → unvote).

## 2.3 State (replace Riverpod + GetIt)

- **TanStack Query** for anything from Supabase or the network. One hook per Riverpod provider, e.g. `forum_provider.dart` → `src/hooks/useForum.ts` exporting `useQuestions`, `useQuestion(id)`, `useAskQuestion` (mutation), `useVote` (mutation with optimistic update).
- **Zustand** for app/device state: theme mode, notification preferences, remember-me, journey onboarding flag. Persist with AsyncStorage.
- **GetIt is not needed**: modules are imported directly.

| Riverpod provider | Replacement |
|---|---|
| `auth_provider.dart`, `supabase_provider.dart` | `src/stores/authStore.ts` (session + user from `onAuthStateChange`) |
| `bookmark_provider.dart` | `src/hooks/useBookmarks.ts` |
| `cancer_info_provider.dart` | `src/hooks/useCancerInfo.ts` |
| `forum_provider.dart` | `src/hooks/useForum.ts` |
| `home_provider.dart` | `src/hooks/useHome.ts` |
| `journey_provider.dart` | `src/hooks/useJourney.ts` |
| `notification_provider.dart` | `src/stores/notificationStore.ts` |
| `prevention_provider.dart` | `src/hooks/usePrevention.ts` |
| `resources_provider.dart` | `src/hooks/useResources.ts` |
| `theme_provider.dart` | `src/stores/themeStore.ts` |

- [ ] Wrap the app in `QueryClientProvider` in `app/_layout.tsx`.
- [ ] Clear the query cache and per-user stores on sign-out.

## 2.4 Theme

- [ ] `src/theme/colors.ts`: port every color from `lib/utils/theme.dart` into `light` and `dark` palettes.
- [ ] `src/theme/tokens.ts`: spacing (8/16/24/32), radius (8/12/16) and durations (200/300/500 ms) from `constants.dart`.
- [ ] `useTheme()` hook returns the active palette from `themeStore`, falling back to the system scheme.
- [ ] Load Poppins with `expo-font`; block rendering on the splash screen until it's loaded.

## 2.5 Shared components

- [ ] `AppHeader` (from `custom_app_header.dart`)
- [ ] `Button` (from `auth_button.dart`), `InputField` (from `input_field.dart`)
- [ ] `Screen` wrapper (safe area, background, scroll), `Card`, `EmptyState`, `ErrorState`, `LoadingState`
- [ ] Port validation from `constants.dart` into `zod` schemas in `src/constants/validation.ts`, reusing the same error messages.
- [ ] A dev-only `app/_dev/components.tsx` screen showing every component in light and dark mode.

## Done when

- [ ] All 13 model types and all API modules exist with unit tests passing.
- [ ] Every hook can be called from a scratch screen and returns real dev-project data.
- [ ] The component gallery matches the Flutter look in both themes (compare with the Phase 0 screenshots).
