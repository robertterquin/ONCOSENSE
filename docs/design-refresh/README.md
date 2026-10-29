# OncoSense Design Refresh ("the Thread") — Plan

The redesign (`docs/redesign/`) gave the app its scope, screens and accessibility. This plan makes it feel warmer and easier to find your way around, without changing what the app does.

- **Concept:** four screens (Today, Learn, Journey, Help) mocked up in chat on 2026-10-25, with Hugeicons and tab bar B. Content in the mock-ups (hotlines, chemo session, cancer blurbs) is placeholder; real screens keep the app's real data and copy.
- **Status:** Phases 1–5 merged into `main` on 2026-10-25; Phase 6 built on `design/phase-6`. Left for people with devices: VoiceOver, real-phone checks, store screenshots.

## The idea

The awareness ribbon is already the app's only illustration. In this direction it becomes **one continuous thread** through the app: the next-step panel on Today, and on Journey the week drawn as a single ribbon line with a knot for each day you checked in. Everything around it stays calm and quiet, so that one element is the memorable thing.

Three supporting changes:

1. **Color tells you where you are.** Rose for self-checks, teal for help and calling, warm yellow (sun) for tips and appointments, violet for your next step. Every color is already in the palette; state is never shown by color alone.
2. **One icon family that means something.** Material Symbols Rounded at weight 300: one style for controls, moods, treatments and cancer types (by medical specialty), with no emoji in the interface.
3. **Less sameness.** Content sits in grouped lists and a few distinct blocks (a stat tile, a grid tile, a full-color help card), not the same white card repeated down every screen.

## What stays

- Scope, navigation, routes and data: no new features or tables.
- Palette, Lexend for text (Atkinson Hyperlegible Next until 2026-10-30), Figtree ExtraBold for headings, text sizes, contrast rules.
- Every design rule in [the redesign plan](../redesign/README.md#design-rules). Rule 6 ("the ribbon line is the only illustration") is extended, not broken: the thread *is* the ribbon line.

## Design rules added by this plan

1. **Icons come from `Icon` only**, drawn from Material Symbols Rounded (weight 300; `bold` gives 600 for small ticks and pluses). To add one, name it in `mobile/scripts/material-icons.mjs` and rerun it. No other icon package in screens.
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

Estimates assume one developer full time. Phase 1 must merge first; Phases 2–5 touch different screens and can then run in any order or in parallel.

## How to work

Same as the redesign:

1. One short branch per phase from `main` (`design/phase-N`), merged into `main` with `--no-ff`, pushed, then deleted. Never force-push `main`.
2. A phase is done when its **Done when** list is true and `npm run lint`, `npm run typecheck` and `npm test` pass in `mobile/`.
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
