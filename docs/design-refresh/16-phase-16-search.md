# Phase 16 — Search, iOS layout

**Goal:** Search reads like Spotlight: a field, a short list of suggestions, and results grouped plainly.

**Branch:** `design/phase-16`

## Rules

- No subtitle under the title; the field says "Search OncoSense".
- Before typing: one "Suggestions" list of plain rows (the old pill cloud and the "What you can search" card are gone).
- While typing: the filter chips appear with counts, like an iOS scope bar ("Checks" matches Learn's part). Result headers are short and in sentence case (Self-checks, Cancer types, Habits, Hotlines and centers, Community), without subtitles.
- Habit results are a full-width list (`PreventionTipCard fill`), as on Learn.

## Tasks

- [x] 1. Header, field placeholder and the scope chips shown only with a query.
- [x] 2. Plain result headers; habits as a vertical list.
- [x] 3. Suggestions as `ListRow`s.
- [x] 4. Saved: looked at again on the device; the four-part switcher fits ("Questions" included), so it stays as it is.

## Done when

- [x] Lint, typecheck and tests pass.
- [x] iOS (dark): Search before and after a query (`?q=breast`) and Saved checked.
- [ ] Recent searches: not added; it needs searches stored on the phone, which the app doesn't do yet.
