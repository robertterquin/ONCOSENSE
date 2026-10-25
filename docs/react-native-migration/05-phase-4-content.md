# Phase 4 — Content Features

**Goal:** the five content tabs and their detail screens work with real data and match the Flutter app.
**Effort:** 2–3 weeks. **Branch:** `rn/phase-4`.

Built in this order: Info → Resources → Prevention → Home → Forum. All screens read real data from Supabase; bookmark buttons use `src/hooks/useBookmarkToggle.ts`, which asks guests to sign in (Flutter silently failed and showed "removed").

## 4.1 Info — `cancer_info_screen.dart`, `cancer_detail_screen.dart`

- [x] `(tabs)/info.tsx`: two-column grid of cancer types with Flutter's per-type icons (`src/lib/cancerIcons.ts`), name search, pull-to-refresh, loading / error with Retry, "No results found for …".
- [x] `cancer/[id].tsx`: About, Statistics (when present), Symptoms, Risk Factors, Prevention Tips, Screening Methods, Early Detection and the medical disclaimer. Opens instantly from the list's data, then refreshes.
- Flutter's detail screen has no bookmark button and no links to other types, so neither does this one.

## 4.2 Resources — `resources_screen.dart`

- [x] `(tabs)/resources.tsx`: Hotlines, Screening Centers, Financial Support and Support Groups, each with Flutter's card style, verified badges and empty messages.
- [x] Tap a hotline (or a phone number) to call (`src/lib/links.ts`); "Could not make phone call" when calling isn't possible.
- [x] Bookmark per resource ("✅ Resource saved!" / "Resource removed from saved").

## 4.3 Prevention — `prevention_screen.dart`

- [x] `(tabs)/prevention.tsx`: prevention tips (icon, description, details, tappable source) and self-check guide cards (cancer type and frequency chips), pull-to-refresh, empty and error states.
- [x] `prevention/guide/[id].tsx`: the bottom sheet as a modal screen — info chips, numbered steps, warning signs, "When to See a Doctor", source link, Close.
- [x] Database icon names like `restaurant_outlined` map to the base Material icon (`resolveMaterialIconName`).

## 4.4 Home — `home_screen.dart` (split into `src/components/home/`)

- [x] Header: "Hello, {name} 👋", notifications button (→ `notifications` placeholder, Phase 6) and profile photo (→ `profile` placeholder, Phase 5).
- [x] `DailyTipCard`, `AwarenessBanner` (month-specific), `HealthReminderCard` list with refresh (tap shows the source), `SurvivorStoryCard`, 3 `ArticlePreviewCard`s with bookmarks.
- [x] Pull-to-refresh refetches reminders, story and articles.
- [x] News shows "Failed to load articles" until the `news` Edge Function is deployed (Phase 0). *(Not needed: the redesign removed the news feed.)*
- [x] Unread badge, sample notifications and long-press test notification — Phase 6. *(Not needed: the redesign removed the notification center.)*

## 4.5 Forum — `forum_screen.dart`, `ask_question_screen.dart`, `question_detail_screen.dart`

- [x] `(tabs)/forum.tsx`: Ask a Question, search (runs on submit; clearing resets, like Flutter), category and sort chips (Most Recent / Trending / Unanswered), question cards with avatar, answer count, relative time and upvotes; times refresh every 10 s (`useNow`).
- [x] `forum/ask.tsx`: category chips, title (10–200), details (20–2000), post anonymously, community guidelines; "✅ Question posted successfully!".
- [x] `forum/[id].tsx`: question with bookmark, delete (own questions) and report; answers with best-answer badge, upvotes and delete (own answers); answer box pinned at the bottom with "Post anonymously".
- [x] Upvotes are optimistic and roll back on error (e.g. guests see "You need to be signed in to upvote.").
- [x] Delete confirmations work on the web too (`src/lib/confirm.ts`); report reasons in `ReportDialog`.
- [x] Two-device test: a question asked on Flutter appears on React Native, and votes/answers made on either app show on the other — needs a signed-in account. *(Not needed: the Flutter app is retired.)*

## Deliberate differences

| Flutter | React Native | Why |
|---|---|---|
| Forum category dropdown and sort pop-up menu | Chips | Faster to tap; no native dropdown on React Native |
| Home "See All" / "View All" buttons did nothing | Not shown | Dead buttons |
| Awareness "Learn More" did nothing | Opens the Info tab | Dead button |
| Article dates shown as raw timestamps | "Oct 20, 2026" | Readability |
| Bookmarking as a guest silently failed | "Sign in to save items to your profile" | Clear feedback |

## Tests

- [x] Unit tests for icon mapping, colors, awareness months and the Ask form rules (49 tests total).
- [x] Browser walkthrough at phone size as a guest: every tab, cancer search and detail, all resource groups, a prevention guide, Home sections, forum sort, question detail, guest upvote rollback, report dialog, Ask validation.

## Done when

- [x] Every screen above works against the current Supabase project (web).
- [x] Android and iOS check on a development build. *(iOS Simulator checked through the redesign; Android moved to the Phase 7 real-device check.)*
- [x] Side-by-side review against the Phase 0 screenshots, light and dark. *(Not needed: replaced by the redesign artboard check.)*
- [x] Vote counts stay consistent after rapid tap/untap with a signed-in account. *(Moved to the redesign Phase 5 test-account run.)*
