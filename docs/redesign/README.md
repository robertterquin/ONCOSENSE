# OncoSense Redesign — Plan

The app was migrated to React Native with the Flutter look and feature set. This plan redesigns it and narrows it to its purpose.

- **Approved design:** [OncoSense Redesign canvas](https://claude.ai/artifact/7ZtBEveYHgp3496mi6uLy2) (17 artboards, light and dark, plus a foundations board). It is the visual source of truth; when this plan and the canvas disagree, ask before building.
- **Approved:** design and scope on 2026-10-24.

## Purpose and audience

**OncoSense: cancer awareness, early detection and support for Filipinos.**

1. People who want to know the signs, check themselves and get screened.
2. People living with cancer, survivors, and the families who care for them.

Anything that doesn't serve one of those two groups is out of scope.

## Scope

| Feature | Decision | Why |
|---|---|---|
| Cancer types (10) and details | **Keep**, in Learn | Core awareness content |
| Self-check guides (12) | **Keep**, in Learn, as a guided step-by-step flow | Core early detection |
| Prevention tips | **Merge** into Learn | Same job as Info; one tab instead of two |
| Resources: hotlines, screening centers, cost help, support groups | **Keep**, as the Help tab | Most useful local content; deserves a tab |
| Journey: check-ins, treatments, milestones | **Keep**, opt-in by focus | Only for people in or after treatment, or caring for someone |
| Community Q&A | **Keep**, with guardrails | Peer support; "members, not doctors" banner, anonymous by default |
| Account, profile, settings, real account deletion | **Keep** | Basics |
| Saved articles / questions / resources (3 screens) | **Merge** into one Saved screen (questions, guides, help contacts) | Fewer screens |
| Two notification settings screens | **Merge** into Settings › Reminders | Duplicate screens |
| News feed (GNews) and Saved Articles | **Cut** | Unvetted, often distressing news; needs a paid key and an Edge Function |
| "Inspiring Stories" (GNews search) | **Cut** | Same reasons |
| Generic wellness cards on Home | **Cut** | Not about cancer |
| Hydration, movement, daily sun and daily tip notifications | **Cut** | 12+ notifications a day; not about cancer |
| In-app notification center and sample notifications | **Cut** | Duplicates the phone's notifications; samples were fake data |
| "Forum notifications" switch, "Rate the app" | **Cut** | Never worked |
| Share a summary with my doctor (PDF) | **New** | Approved with the design; turns check-ins into something useful at appointments |
| Appointments ("Coming up") | **New** | Today and Journey show the next treatment session or follow-up |
| Text size setting, "Listen instead" audio | **New** | Accessibility for fatigue, chemo brain and low vision |

**Reminders after the redesign:** monthly self-check, daily check-in (Journey users), appointments and treatments (the day before), weekly health tip (off by default). At most one routine reminder a day, plus appointments.

## Navigation

```
Welcome ─ Sign in / Create account ─ "What brings you here?" (focus)
                                              │
┌──────────┬──────────┬──────────┬────────────┬──────────┐
│  Today   │  Learn   │ Journey  │ Community  │   Help   │   ← 5 tabs, labels always shown
└──────────┴──────────┴──────────┴────────────┴──────────┘
  Today:     next step panel, quick check-in, coming up, tip, awareness month, get-help prompt
             avatar → Profile → Saved, Settings (theme, text size, reminders, community, account), legal
  Learn:     search, self-check guides → guided flow, cancer types → detail, lower-your-risk tips
  Journey:   week strip, energy and pain, treatments, milestones, share summary → daily check-in
  Community: topics, questions → question detail (answers, helpful, save, report), ask a question
  Help:      crisis line, region filter, hotlines, screening centers, help with costs, support groups
```

Routes: `/today`, `/learn`, `/journey`, `/community`, `/help` (tabs); `/learn/cancer/[id]`, `/learn/check/[id]`, `/journey/check-in`, `/journey/treatment`, `/journey/appointment`, `/journey/focus`, `/community/[id]`, `/community/ask`, `/profile`, `/profile/edit`, `/profile/saved`, `/profile/settings`, `/profile/password`.

## Design rules

1. **Tokens only.** Colors, type sizes, spacing and radii come from `src/theme/`. No hex values or font sizes in screens.
2. **Atkinson Hyperlegible Next** for all text. Body 17–18, never below 15. Supports the text-size setting (Default, Large, Larger).
3. **WCAG AA in both themes.** Text 4.5:1, chart marks and controls 3:1. Check new color pairs before using them.
4. **One job per screen.** Large plain titles, white sections of rows, no gradient headers, no identical floating cards.
5. **Touch targets ≥ 44 px** (rows 64–72, main buttons 52–56).
6. **The ribbon line is the only illustration.** The night-violet next-step panel is the one bold element.
7. **Plain, kind copy.** Sentence case, active verbs, no fear language, never force a "patient" identity.
8. **Web still works.** No nested pressables, `confirm()` instead of `Alert`, `.web.ts` twins for native-only modules.

## Phases

| # | Phase | Doc | Est. effort | Status |
|---|---|---|---|---|
| 1 | Scope cleanup and new navigation | [01-phase-1-scope-and-navigation.md](01-phase-1-scope-and-navigation.md) | 3–4 days | Done |
| 2 | Design foundations | [02-phase-2-foundations.md](02-phase-2-foundations.md) | 1 week | Done |
| 3 | Today and Learn | [03-phase-3-today-and-learn.md](03-phase-3-today-and-learn.md) | 1–1.5 weeks | Done |
| 4 | Journey | [04-phase-4-journey.md](04-phase-4-journey.md) | 1–1.5 weeks | Built; waiting on the appointments SQL and a test-account run |
| 5 | Community and Help | [05-phase-5-community-and-help.md](05-phase-5-community-and-help.md) | 1 week | Built; waiting on a test-account run |
| 6 | Getting started, profile and settings | [06-phase-6-account-and-settings.md](06-phase-6-account-and-settings.md) | 1 week | Built; waiting on a test-account run |
| 7 | QA, accessibility and release | [07-phase-7-qa-and-release.md](07-phase-7-qa-and-release.md) | 1 week | In progress: cleanup, theme, text size, contrast and reduce motion done |

Estimates assume one developer full time. Phases 3, 4 and 5 touch different screens and can run in parallel once Phase 2 is merged.

## How to work

Same as the migration:

1. One short branch per phase from `main` (`redesign/phase-N`), merged into `main` with `--no-ff`, pushed, then deleted. Never force-push `main`.
2. A phase is done when its **Done when** list is true and `npm run lint`, `npm run typecheck` and `npm test` pass in `mobile/`.
3. Check each changed screen on web and in the iOS Simulator (`npm run ios`) against its artboard, in light and dark.
4. Database changes are additive only (new tables or nullable columns), written as SQL files in `supabase/migrations/`, and applied by the project owner.
5. Update the status table and decision log as you go.

## Decision log

| Date | Decision | Why | Who |
|---|---|---|---|
| 2026-10-24 | Approve the redesign and the scope above | Narrow the app to awareness, early detection and support | Robert |
| 2026-10-24 | Lavender (all-cancers ribbon) replaces the pink gradient look; rose stays for self-checks | Pink signals breast cancer only; the app covers all cancers | Robert |
| 2026-10-24 | Atkinson Hyperlegible Next replaces Poppins | Built for low vision; suits fatigue and chemo-related blurred vision | Robert |
| 2026-10-24 | Five tabs: Today, Learn, Journey, Community, Help | Info and Prevention did the same job; Help needed to be easy to reach | Robert |
| 2026-10-24 | Cut the news feed, stories, wellness cards, notification center and non-cancer reminders | Out of scope, unvetted or noisy (details in Scope) | Robert |
| 2026-10-24 | Remove the `news` Edge Function; revoke the GNews key instead of rotating it | Nothing calls it after the cut | — |
| 2026-10-24 | The focus ("What brings you here?") is saved in user metadata `journey_focus` (guests: on the device) | No table needed; decides whether Journey and check-in reminders appear | — |
| 2026-10-24 | Self-check completions are stored on the device | Private, works for guests, no schema change; sync can come later | — |
| 2026-10-24 | Appointments get a new `journey_appointments` table (additive, RLS per user) | Treatments have no session dates; "Coming up" needs real dates | — |
| 2026-10-24 | Appointment IDs (and `treatment_id`) are text, not uuid | Matches the other journey tables, which use the app's millisecond IDs | — |
| 2026-10-24 | The weekly check-in reminder becomes a daily one at 8 PM, for Journey focuses only | Daily check-ins make the week strip and the doctor summary useful; Learning users get no check-in reminder | — |
| 2026-10-24 | Mood labels become Rough, Low, Okay, Good, Great (still stored 1–5) | Gentler wording; existing data unchanged | Robert |
| 2026-10-24 | Voice notes use the phone keyboard's dictation, not a custom mic button | Works on iOS and Android with no extra native module | — |
| 2026-10-24 | Icons move to Lucide (`lucide-react-native` + `react-native-svg`) | Matches the approved stroke style; also draws the ribbon mark | — |
| 2026-10-24 | Community topics: the five existing categories plus "Treatment" | Treatment questions had no fitting category | — |
