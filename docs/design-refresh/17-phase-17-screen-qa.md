# Phase 17 — The remaining screens and QA

**Goal:** every screen not touched in Phases 13–16 matches the new layout, and the redesign holds up in light mode and with the largest text.

**Branch:** `design/phase-17`

## Screens looked at

| Screen | Result |
|---|---|
| Self-check guide | Fine. "Back" stays, since it opens from Today and Learn (iOS names the previous screen only when there's one) |
| Cancer page | Fine |
| New treatment, new appointment | Fine |
| Edit profile, change password | Fine |
| Create account | Fine |
| Welcome | **Fixed:** showed the old line ribbon; now the satin logo (the splash image), so launch and Welcome match |
| Sign in | **Fixed:** "New to OncoSense? Create an account" wrapped to three lines because the button took the full width |
| Journey | **Changed:** the check-in button moves into the "This week" card; once you've checked in it's a quieter outlined button |
| Learn, Due now | **Fixed (found in light mode):** the "Due today" tag squeezed titles to three lines; the tag now says "Due" and the line below says when |
| Learn, larger text | **Fixed:** the search placeholder was cut off; it now says "Search Learn" |

## Done when

- [x] Lint, typecheck and tests pass.
- [x] iOS (dark): the screens above. Web, light mode as a guest: Today, Learn and Help, and Learn with the largest text (set back to Default afterwards).
- [ ] Focus setup: not opened, since saving it changes the account's journey settings.
- [ ] High-contrast mode and Reduce Motion on a device.
