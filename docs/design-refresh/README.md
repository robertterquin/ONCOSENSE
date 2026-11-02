# OncoSense Design Refresh ("the Thread") — Plan

The redesign (`docs/redesign/`) gave the app its scope, screens and accessibility. This plan makes it feel warmer and easier to find your way around, without changing what the app does.

- **Concept:** four screens (Today, Learn, Journey, Help) mocked up in chat on 2026-10-25, with Hugeicons and tab bar B. Content in the mock-ups (hotlines, chemo session, cancer blurbs) is placeholder; real screens keep the app's real data and copy.
- **Status:** Phases 1–5 merged into `main` on 2026-10-25; Phase 6 built on `design/phase-6`. Left for people with devices: VoiceOver, real-phone checks, store screenshots.

## The idea

The awareness ribbon is already the app's only illustration. In this direction it becomes **one continuous thread** through the app: the next-step panel on Today, and on Journey the week drawn as a single ribbon line with a knot for each day you checked in. Everything around it stays calm and quiet, so that one element is the memorable thing.

Three supporting changes:

1. **Color tells you where you are.** Rose for self-checks, teal for help and calling, warm yellow (sun) for tips and appointments, violet for your next step. Every color is already in the palette; state is never shown by color alone.
2. **One icon family that means something.** Material Symbols Rounded at weight 500: one style for controls, treatments and cancer types (by medical specialty), with no emoji in the interface. The mood faces and the liver and stomach icons are drawn to match (`moodFaces.tsx`, `organIcons.tsx`).
3. **Less sameness.** Content sits in grouped lists and a few distinct blocks (a stat tile, a grid tile, a full-color help card), not the same white card repeated down every screen.

## What stays

- Scope, navigation, routes and data: no new features or tables.
- Palette, Lexend for text (Atkinson Hyperlegible Next until 2026-10-30), Figtree ExtraBold for headings, text sizes, contrast rules.
- Every design rule in [the redesign plan](../redesign/README.md#design-rules). Rule 6 ("the ribbon line is the only illustration") is extended, not broken: the thread *is* the ribbon line.

## Design rules added by this plan

1. **Icons come from `Icon` only**, drawn from Material Symbols Rounded (weight 500; `bold` gives 600 for small ticks and pluses). To add one, name it in `scripts/material-icons.mjs` and rerun it. No other icon package in screens.
2. **Section colors:** rose = self-checks, teal = help and calling, sun = tips and appointments, violet = the next step and the active tab. A color always comes with a word or icon that says the same thing.
3. **Depth comes from `theme/elevation.ts` only:** resting cards, the floating tab bar and the violet panels. Every raised container keeps a visible edge; shadows add lift, never replace the edge. No glass or translucency on content: it lowers contrast for older eyes.
4. **One thread per screen at most.** The ribbon thread appears on Today (panel) and Journey (week), and as the launch screen. Nowhere else.
5. **Mock-up content is never shipped.** Every hotline, number and medical line comes from the database or an approved source.

## Phases

| # | Phase | Doc | Est. effort | Status |
|---|---|---|---|---|
| 1 | Foundations: icons, tab bar, launch screen, shared parts | [01-phase-1-foundations.md](01-phase-1-foundations.md) | 3–4 days | Merged into `main` |
| 2 | Today | [02-phase-2-today.md](02-phase-2-today.md) | 2–3 days | Merged into `main` |
| 3 | Learn | [03-phase-3-learn.md](03-phase-3-learn.md) | 2–3 days | Merged into `main` |
| 4 | Journey and the thread | [04-phase-4-journey.md](04-phase-4-journey.md) | 3–4 days | Merged into `main` |
| 5 | Community and Help | [05-phase-5-community-and-help.md](05-phase-5-community-and-help.md) | 2–3 days | Merged into `main` |
| 6 | Account screens, QA and release | [06-phase-6-account-qa.md](06-phase-6-account-qa.md) | 3–4 days | Merged into `main`; VoiceOver, store screenshots and release left |
| 7 | Quick polish: sentence case, plain menus, dark-theme depth | [07-phase-7-polish.md](07-phase-7-polish.md) | 1 day | Merged into `main`; title SQL run |
| 8 | The cancer page header | [08-phase-8-cancer-header.md](08-phase-8-cancer-header.md) | 1 day | Merged into `main` |
| 9 | The ribbon moment and illustrated empty states | [09-phase-9-ribbon-and-empty-states.md](09-phase-9-ribbon-and-empty-states.md) | 1–2 days | Merged into `main` |
| 10 | Tab colors and the Journey chart | [10-phase-10-tab-colors-and-chart.md](10-phase-10-tab-colors-and-chart.md) | 2–3 days | Merged into `main` |
| 11 | Device QA for Phases 8–10 | [11-phase-11-device-qa.md](11-phase-11-device-qa.md) | ½ day | Merged into `main` |
| 12 | Motion | [12-phase-12-motion.md](12-phase-12-motion.md) | 1–2 days | Merged into `main` |
| 13 | iOS header and rows | [13-phase-13-ios-header-and-rows.md](13-phase-13-ios-header-and-rows.md) | 1 day | Merged into `main` |
| 14 | Learn in three parts | [14-phase-14-learn-in-three.md](14-phase-14-learn-in-three.md) | 1 day | Merged into `main` |
| 15 | Community and Help, iOS layout | [15-phase-15-community-and-help.md](15-phase-15-community-and-help.md) | 1 day | Merged into `main` |
| 16 | Search, iOS layout | [16-phase-16-search.md](16-phase-16-search.md) | ½ day | Merged into `main` |
| 17 | The remaining screens and QA | [17-phase-17-screen-qa.md](17-phase-17-screen-qa.md) | ½ day | Merged into `main` |
| 18 | iOS forms, controls and inner pages | [18-phase-18-ios-forms-and-controls.md](18-phase-18-ios-forms-and-controls.md) | 2 days | Merged into `main` |
| 19 | Learn for reading, Journey for tracking | [19-phase-19-learn-and-my-health.md](19-phase-19-learn-and-my-health.md) | 1 day | Merged into `main` |
| 20 | Your cancer, everywhere | [20-phase-20-your-cancer-everywhere.md](20-phase-20-your-cancer-everywhere.md) | 1 day | Merged into `main` |
| 21 | Questions about a cancer | [21-phase-21-questions-about-a-cancer.md](21-phase-21-questions-about-a-cancer.md) | 1 day | Merged into `main` |
| 22 | Self-checks that react to what you find | [22-phase-22-self-check-fixes.md](22-phase-22-self-check-fixes.md) | 1 day | Merged into `main` |
| 23 | Your cancers | [23-phase-23-your-cancers.md](23-phase-23-your-cancers.md) | 1 day | Merged into `main` |
| 24 | Your checks, bundled | [24-phase-24-checks.md](24-phase-24-checks.md) | 1 day | Merged into `main` |
| 25 | Every check, step by step | [25-phase-25-step-by-step-checks.md](25-phase-25-step-by-step-checks.md) | 1 day | Merged into `main` |
| 26 | Treatment week | [26-phase-26-treatment-week.md](26-phase-26-treatment-week.md) | 1 day | On `main` |

Estimates assume one developer full time. Phase 1 must merge first; Phases 2–5 touch different screens and can then run in any order or in parallel.

## How to work

Same as the redesign:

1. One short branch per phase from `main` (`design/phase-N`), merged into `main` with `--no-ff`, pushed, then deleted. Never force-push `main`.
2. A phase is done when its **Done when** list is true and `npm run lint`, `npm run typecheck` and `npm test` pass.
3. Show each changed screen on web and in the iOS Simulator, light and dark, at Default and Larger text, before committing.
4. New color pairs go into `palette.test.ts` before they're used.
5. Update the status table and decision log as you go.

## Decision log

| Date | Decision | Why | Who |
|---|---|---|---|
| 2026-10-25 | Tab bar B: a light floating dock with every tab named | The dark pill hid four of five names and competed with the next-step panel | Robert |
| 2026-10-25 | Hugeicons (stroke rounded, MIT) replaces Lucide | Has all 51 icons the app uses plus ribbon, lungs, stethoscope and five mood faces; rounded ends match Nunito; no two-tone fills that fade for low vision | Robert |
| 2026-10-25 | Launch screen: lavender ribbon on night violet, matching Welcome | The old pink Flutter ribbon on white no longer matched the app | Robert |
| 2026-10-25 | Keep five moods (Rough to Great), drawn as Hugeicons faces | The mock-up showed four; the data and the check-in use five | — |
| 2026-10-31 | Forms open as sheets with grouped fields, but labels stay above each field | iOS look, while the field's name stays visible after typing, which suits older or tired users | Robert |
| 2026-10-31 | Check-in asks only the mood; the rest folds open in place | A hard day is one tap; tabs or one question per screen hid questions or added screens | Robert |
| 2026-10-31 | Habits: a progress ring over Reminders-style rows | The rows stay readable, and the ring gives a small daily win | Robert |
| 2026-11-01 | Learn is for reading; habit ticks move to a Habits screen, and Learning users get My health in Journey | Learn mixed reference with to-do lists, and one of five tabs was empty for the largest group | Robert |
| 2026-11-01 | Community opens on the person's cancer, and cancer pages list support groups for it | "Which cancer?" only changed Learn; Community and support groups had no link to cancers | Robert |
| 2026-11-01 | Questions can name a cancer; older ones still match by name | Cancer pages and the Community filter need a real link to questions, without guessing tags for old posts | Robert |
| 2026-11-01 | A self-check ends by asking what you found; a change says to see a doctor soon, and defaults follow age as well as sex | Marking a check done after finding a lump only scheduled the next one; age was ignored and the chooser was hidden in reminder settings | Robert |
| 2026-11-01 | People follow any cancer; each gets a self-check, a screening test, a talk with a doctor, or its warning signs | Only four cancers have a self-check; a monthly "check" for the others would have looked like protection without being one | Robert |
| 2026-11-01 | Two user types: "I have or had cancer" (then in treatment or finished) and "I don't have cancer"; caregiver mode retired | A narrower first release; caring mostly changed wording, while treatment and finished drive different checks and habits. Caregiver accounts read as Learning, keep their data, and see a one-time note | Robert |
| 2026-11-02 | Checks bundle into a monthly body check, each test, and a signs check every 3 months, on one calendar card; cancers are chosen at sign-up with a soft "3 or fewer" | The calendar only showed self-checks, and a hard limit of 3 would crowd out family history; guidelines favour body awareness over set self-exams | Robert |
| 2026-11-02 | Every check uses the self-check guide's step layout; Learn drops its Checks list for one "Check for it" card per cancer | The body check, tests and signs check each looked different, and Learn listed guides already reached from Today and each cancer page | Robert |
| 2026-11-03 | Breast and testicular become two-step change checks (look and feel, then "any of these changes?"); skin keeps its ABCDE steps | The American Cancer Society no longer recommends a structured breast self-exam for women at average risk, and the USPSTF recommends against routine testicular self-exams; knowing what's normal is the honest ask | Robert |
| 2026-11-02 | People in treatment get a treatment week card on Today (sessions, appointments, check-in days), sharing the checks card's calendar | Today in treatment had no view of the week ahead; one calendar look for both card types keeps Today consistent | Robert |
