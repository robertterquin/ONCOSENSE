# Phase 11 — Device QA for Phases 8–10

**Goal:** see Phases 8–10 on a real iOS build, in both themes and at Larger text, and tidy what's left.

**Branch:** `design/phase-11`

## Fixes

- [x] "Mark as done" no longer also shows a "Done. Next check: …" toast; the finished screen already says the date.
- [x] The component gallery shows the drawn ribbon, so the animation can be checked without marking a real check done (that would sync to the account).
- [x] Status table: Phase 10 merged.

## Checked (iPhone 17 Pro simulator, iOS 26.5, dev build)

| What | Dark | Light | Larger text | Result |
|------|------|-------|-------------|--------|
| Tab pill colours (Learn rose) | ✓ | — | ✓ | Reads well |
| Cancer header and fact rows | ✓ | — | ✓ | "9 things that raise risk" scrolls to its section |
| Journey chart | ✓ | ✓ | ✓ | Average lines full width; "Today" shrinks to fit its column |
| Drawn ribbon (gallery) | ✓ | — | — | Ends whole; the 0.8 s draw wasn't caught on a screenshot |

Web (earlier): ribbon draw seen mid-animation; empty-state drawings; Community and Help tiles in light.

## Not checked

- Reduce Motion (needs the simulator's accessibility setting).
- The real Journey tab with account data (sample data only).
- Empty states on iOS.
