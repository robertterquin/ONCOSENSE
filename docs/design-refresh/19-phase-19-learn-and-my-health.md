# Phase 19 — Learn for reading, Journey for tracking

**Goal:** every action has one home. Learn explains things, Today is where checks and habits are ticked off, and Journey keeps the history, including for people who are learning and checking themselves (until now their Journey tab was only an invitation).

**Branch:** `design/phase-19`

## Changes

| Where | Change |
|---|---|
| Learn | The parts are now Cancers, Checks and Habits, and Learn opens on Cancers. Checks lists each self-check guide with its frequency and steps, no due dates. Habits explains each habit with its source, grouped as Every day, During treatment, Protect yourself and Feel well, with a "Track your habits" row at the top. |
| Habits screen (new, `/habits`) | The ring, the week and the ticks that used to be in Learn › Habits. Opened from Today's habits row, Learn › Habits and My health. |
| Journey, for Learning (or no focus yet) | **My health** replaces the invitation: the habit week with a streak, each followed self-check with when it was last done and is next due, "Choose your checks" (Settings), and "Set up Journey" for people going into treatment. Treatment, Finished and Caring still see the dashboard. |
| Today | The habits row opens the Habits screen. |
| Notifications | Self-check and screening reminders open Today, where the due check has its Start button (they opened Learn's old checklist). |

`habitStreak` in `src/lib/habits.ts` counts full days back from today; an unfinished today doesn't break the streak. The week strip is shared between the Habits screen and My health (`HabitWeekStrip`).

## Not done

- The self-check guide still ends with "Mark as done", and the habit sheet keeps its tick button: doing a check or a habit from its own page is still an action, just not a list of them.
- Phase 20 (your cancer in Journey and Community) and Phase 21 (questions linked to cancers) are separate.

## Done when

- [x] Lint, typecheck and tests pass (`habitStreak` and the notification routes are tested).
- [x] Web, as a guest at phone width: My health, Learn › Checks, Learn › Habits and the Habits screen.
- [ ] iOS and Android development builds, light mode and larger text.
