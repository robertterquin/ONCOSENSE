# Phase 4 — Content Features

**Goal:** the five content tabs and their detail screens work with real data and match the Flutter app.
**Effort:** 2–3 weeks. **Branches:** one per group — `rn/phase-4-home`, `rn/phase-4-info`, `rn/phase-4-prevention`, `rn/phase-4-forum`, `rn/phase-4-resources`.

Build in this order: Info and Resources (simplest, read-only) → Prevention → Home → Forum (most interactive).
Bookmark buttons on these screens use `useBookmarks` from Phase 2; the saved-items lists come in Phase 5.

## 4.1 Info — `cancer_info_screen.dart`, `cancer_detail_screen.dart`

- [ ] `(tabs)/info.tsx`: list of cancer types from `cancer_types`, search box ("Search cancer types..."), loading / error with Retry.
- [ ] `cancer/[id].tsx`: detail sections and lists as in the Flutter detail screen; bookmark button.
- [ ] Links between related cancer types (detail screen pushes another detail screen).

## 4.2 Resources — `resources_screen.dart`

- [ ] `(tabs)/resources.tsx`: hotline, support group, treatment center and support cards from `resources`.
- [ ] Tap-to-call with `Linking.openURL('tel:...')`, websites with `expo-web-browser`; show "Could not make phone call" on failure.
- [ ] Bookmark button per resource.

## 4.3 Prevention — `prevention_screen.dart`

- [ ] `(tabs)/prevention.tsx`: prevention tips (`prevention_tips`) and self-check guides (`self_check_guides`), pull-to-refresh, empty and error states.
- [ ] Guide detail opens in a bottom sheet (use a modal route `prevention/guide/[id].tsx` with `presentation: 'modal'`, or `@gorhom/bottom-sheet`) with steps, warning signs and info chips.
- [ ] External links via `expo-web-browser`.

## 4.4 Home — `home_screen.dart` (1,398 lines — split it)

Break into components under `src/components/home/`:

- [ ] `AwarenessBanner`
- [ ] `DailyTipCard` (from `healthTips.ts`)
- [ ] `HealthReminderCard` list (from `healthReminders.ts`, `DataLimits.healthRemindersToShow`, shows the source)
- [ ] `ArticlePreview` carousel (`DataLimits.newsArticlesCarousel` items) via the `news` Edge Function; open articles with `expo-web-browser`
- [ ] `SurvivorStoryCard`
- [ ] Header actions: Profile (→ `profile/`) and Notification center (→ `notifications`, placeholder until Phase 6)
- [ ] Pull-to-refresh refetches all Home queries

## 4.5 Forum — `forum_screen.dart`, `ask_question_screen.dart`, `question_detail_screen.dart`

- [ ] `(tabs)/forum.tsx`: search ("Search discussions..."), category filter ("All Categories"), sort tabs Most Recent / Trending / Unanswered, discussion cards with avatar, empty state, "Ask a Question" button.
- [ ] Relative times refresh every 10 s (a `useNow(10_000)` hook) — replaces the `Timer.periodic`.
- [ ] `forum/ask.tsx`: form with the same fields and validation; on success invalidate the questions query and go back.
- [ ] `forum/[id].tsx` (954 lines today — split into `QuestionCard`, `AnswerCard`, `AnswerInput`):
  - [ ] Load question + answers; "Question not found" state
  - [ ] Post answer (calls `increment_answer_count`)
  - [ ] Upvote / remove upvote on questions and answers with optimistic updates (RPCs + vote tables)
  - [ ] Delete own question / answer with confirm dialog (`Alert.alert`)
  - [ ] Report dialog ("Why are you reporting this?") → `reports`
  - [ ] Bookmark question
- [ ] Two-device test: a question asked on Flutter appears on React Native, and votes/answers made on either app show on the other.

## Done when

- [ ] Every item above works on Android and iOS against the dev project.
- [ ] Side-by-side review against Phase 0 screenshots signed off for each tab, light and dark.
- [ ] Vote counts stay consistent after rapid tap/untap (no double counting).
