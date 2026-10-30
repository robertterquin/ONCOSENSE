# Phase 14 — Learn in three parts

**Goal:** Learn stops being one long scroll. A segmented control splits it into Checks, Cancers and Habits, and checks are grouped by whether they need doing.

**Branch:** `design/phase-14`

## Rules

- One search field searches all three parts; while searching, the segmented control hides and results from every part show together.
- Checks: "Due now" first, then "Up to date", then "More checks" behind "Show N more" (someone who follows no checks sees "All checks" open).
- Rows stay two lines: "Monthly · Next Nov 28", with the status at the right edge (Phase 13).
- Habits in their own part are a full-width list, not a sideways carousel.
- Links open the right part: `?section=cancers` (Today's "Learn the early signs", "Explore Learn" and the awareness row without a matching cancer) and `?section=risk` (Today's tip, Saved). The link is used once, so returning through the tab bar keeps the part the person chose.

## Tasks

- [x] 1. `SegmentedControl` under the search field; the old scroll-to-section code is gone.
- [x] 2. `CheckYourself` groups checks into Due now, Up to date and More checks.
- [x] 3. `formatShortMonthDay` ("Nov 28") for the next date in check rows.
- [x] 4. `PreventionTipCard` takes `fill` for full-width cards; `LowerYourRisk` is a vertical list.
- [x] 5. Today's links point at the Cancers part.

## Done when

- [x] Lint, typecheck and tests pass.
- [x] iOS (dark): Checks, Cancers and Habits, the links from Today and the part kept on return checked.
- [ ] A person with a due check (the test account has none due today) and light mode on the device.
- [ ] Search's habit results still use the carousel; Phase 16 changes Search.
