# Phase 27 — Clean-up

**Goal:** remove what no longer fits after the checks and habits redesigns, and order Help for the person using it.

**Branch:** `main`

## Changes

| Where | Change |
|---|---|
| Saved guides | Gone: the save button on a guide, Saved → Guides, and `savedGuides` in the self-check store (version 5 drops it) and its account sync. The three guides come through the checks calendar and each cancer's page. `self_check_progress.saved` stays in the database, unused (defaults to false). |
| Saved habits | Gone: the save button on a habit, Saved → Habits, `bookmarkedHabits` in the habits store (version 2 drops it) and its sync. Picking habits ("Change habits") is how people keep the ones they care about. The `habit_bookmarks` table stays; delete-account still clears it. |
| Saved | Two tabs: Questions and Help contacts, both kept in the account. |
| Help | With or after cancer: hotlines, help with costs, support groups, then screening centers (`helpSectionsFor`). Without cancer: unchanged. Nothing is hidden. |
| Dead code | The Flutter-era `radius` and `durations` tokens, `shortenSourceName`, and the unused `Sex` and `HabitBookmarkRow` types. |

## Not done

- The unused `article_bookmarks` and `prevention_tips` tables, and the `habit_bookmarks` table and `saved` column, are left in the database.
- The caregiver retirement note stays until older caregiver accounts have seen it.

## Done when

- [x] Lint, typecheck and tests pass (`helpSectionsFor`, the store migrations).
- [x] Web, as a guest at phone width: Saved and Help.
