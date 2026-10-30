# Phase 10 — Tab colors and the Journey chart

**Goal:** people know where they are, and Journey's chart is clear enough to come back to.

**Branch:** `design/phase-10`

## Tasks

- [x] ~~One quiet colour per tab~~ (replaced 2026-10-30: every tab uses violet, see the decision log). Was: one quiet colour per tab (`TAB_COLORS` in `TabBar.tsx`): Today and Journey violet, Learn rose, Community a bluer lavender (new `community` and `communityTint` tokens, apart from Journey's violet), Help teal.
- [x] The active tab's pill, icon and label take the tab's colour.
- [x] `Screen` takes `tab`: Learn, Journey, Community and Help show their icon in a tinted tile before the title. Today keeps its greeting header.
- [x] New colour pairs in `palette.test.ts` for all four themes.
- [x] Journey chart: taller (120 pt), wider rounded bars (14 pt), a dashed line at each week's average, today's column tinted and labelled "Today", day labels a size up. A tapped day gets an outline instead of a fill.

## Done when

- [x] Each tab has its own colour in light and dark without becoming a rainbow.
- [ ] The chart reads clearly at Larger text and on iOS.
- [x] Lint, typecheck and tests pass.
