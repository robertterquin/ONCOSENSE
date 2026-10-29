# Phase 7 — Quick polish

**Goal:** remove the last "unfinished" feeling: no Title Case, calmer menus, and dark-theme cards that separate from the page.

**Branch:** `design/phase-7`

## Tasks

- [x] Title Case labels in code become sentence case: treatment types ("Radiation therapy"), the summary's stat tiles and PDF headings ("Average pain", "Questions for the doctor"), Search's "What you can search" rows. Stored values (symptoms, community topics, side effects) are left alone: they are saved in people's entries.
- [x] `supabase/migrations/20261030000000_sentence_case_titles.sql`: sentence case for guide titles, cancer names and prevention tip titles, by ID. The app matches these case-insensitively. **For the owner to run.**
- [x] Profile and Settings menus are plain rows: no icon tile in front of Saved, Reminders, Settings, About, Privacy, Medical disclaimer, Change password, Sign in. Tiles stay where the icon carries meaning (focus card, Delete account, cancer types, moods, treatments).
- [x] Dark theme: lighter `surface` (#231D37), `raised`, `line` and `border`, so cards sit 1.15:1 above the page (was 1.10) and dividers stay visible. All text pairs still pass.
- [x] `palette.test.ts`: the card edge (`border`) stands out from the page and the card (≥ 1.3:1) in every palette.

## Done when

- [x] No Title Case left in the interface's own labels (data titles after the SQL runs).
- [x] Profile and Settings menus read as plain lists.
- [x] Dark-theme cards separate from the page without relying on the border alone.
- [x] Lint, typecheck and tests pass.
