# Phase 25 — Every check, step by step

**Goal:** every check reads like the self-check guides: a title with how often and who it's for, "Step 1 of N" with a due tag and a bar, a numbered step list and "Next step". Learn stops repeating the checks.

**Branch:** `design/phase-25`

## Changes

| Where | Change |
|---|---|
| Shared (`components/learn/CheckSteps.tsx`) | `StepProgress` ("Step 6 of 10 · Breast", the due tag and the bar) and `HowDidItGo`, used by the guide, the body check, a screening test and the signs check. |
| Monthly body check | One flow through the due guides ("Step 6 of 10 · Breast"); each ends with "How did it go?", then folds into a line. A noted change shows "See a doctor soon" at the end. With nothing due, the month's checks and their next dates. |
| Screening test | Four steps: what it finds, is it for you, book it (with "Find a screening center"; "Talk to a doctor" for PSA), record it. The last step's button records the date. Each test has a short "how to get it" line. |
| Signs check | One step per cancer, Yes or No each. After the last: all fine, or "See a doctor soon" naming the ones marked Yes. `?cancer=ovarian` asks about one cancer. |
| Learn | The Cancers/Checks toggle and the "How to check" list are gone; search still finds guides. Each cancer page has one "Check for it" card: its test when offered (`primaryAction`), else its self-check, else its signs; "Set by your care team" for a survivor's own cancer. |

## Not done

- The body check flow doesn't read steps aloud; each single guide still does.
- The "how to get it" lines need a clinician's and a local reviewer's eye (where tests are offered in the Philippines).

## Done when

- [x] Lint, typecheck and tests pass (`primaryAction`).
- [x] Web, as a guest at phone width: the body check flow, a screening test, the signs check and a cancer page.
