# Phase 9 — The ribbon moment and illustrated empty states

**Goal:** mark a finished self-check with the app's one illustration, and turn empty screens into a drawing and a next step.

**Branch:** `design/phase-9`

## Tasks

- [x] "Mark as done" ends on the ribbon drawing itself in rose (0.8 s), then a small settle pulse and a success haptic as the line closes. "Done" and the next check date sit under it. With Reduce Motion the ribbon shows whole; the haptic still lands.
- [x] `RibbonMark` takes `draw`; the animation lives there, so any later use gets the same moment.
- [x] Empty states show one-line drawings in the ribbon's rounded stroke: a speech bubble (no questions, removed question), a bookmark (saved), a magnifier (search). Other icons keep the tinted tile.
- [x] `EmptyState` takes an `action`. Community's "No questions yet" gets "Ask a question"; Saved drops its own wrapper and uses it.

## Done when

- [ ] The ribbon draws on iOS and web, and shows whole with Reduce Motion.
- [ ] Empty states read well in light, dark and Larger text.
- [x] Lint, typecheck and tests pass.
