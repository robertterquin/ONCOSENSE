# Phase 8 — The cancer page header

**Goal:** give each cancer page its own identity, and turn the page's top into a summary that also navigates.

**Branch:** `design/phase-8`

## Tasks

- [x] Header: the cancer's specialty icon (rose) with its body system, the name as the display title, and the first sentence of its statistics in rose. A missing body system or statistic is left out, never guessed.
- [x] Fact rows that are the page's contents: "6 signs to watch for", "9 things that raise risk", "5 ways it's found" jump to their sections; the matching self-check opens the guide. A section with nothing in it gets no row.
- [x] "On this page" chips removed (the fact rows replace them). "Find a screening center" moves under "How it's found".
- [x] `bodySystemForCancer` moves to `lib/learn.ts` (shared by the Learn filter and the header); `firstSentence` added. Both tested.
- [x] No screening-age fact: it isn't stored as data, only inside sentences.

## Done when

- [x] Every cancer page shows the header and rows from its own data.
- [x] Light, dark and Larger text read well; rows grow taller instead of squeezing.
- [x] Lint, typecheck and tests pass.
