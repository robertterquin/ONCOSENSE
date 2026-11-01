# Phase 22 — Self-checks that react to what you find

**Goal:** a self-check ends by asking what the person found, and says to see a doctor when they noticed a change. Default checks follow age as well as sex, choosing them is easy to find, and every check is kept.

**Branch:** `design/phase-22`

## Changes

| Where | Change |
|---|---|
| Guided check | The last step's button is Finish, then "How did it go?": Everything looked normal, or I noticed a change. Continue records it. |
| After "I noticed a change" | "See a doctor soon": find a screening center, call the DOH hotline (1555), add an appointment (signed in), and "OncoSense doesn't send this to anyone". A normal check still says when the next one is. The button is now Done, back to where the check started. |
| Today | The checks card says "You noted a change in your skin check. See a doctor soon." and the check's line reads "Change noted, see a doctor". |
| Default checks | By sex and age: breast from 20, testicular 15 to 40, skin and oral from 18. Without a sex, skin and oral. A person's own choice still wins. |
| Your checks (new, `/checks`) | A switch for each check, with who it suits. Opened from Learn › Checks, My health and the self-check reminder in Settings (which no longer has its own chips). |
| History | Each check keeps up to 24 entries, newest first, with whether a change was noted. The guide shows "Your checks"; My health says "6 times this year, next Nov 28" or "Change noted Nov 1, see a doctor". |
| Account sync | `self_check_progress.history` (jsonb, migration `20261102010000_self_check_history.sql`). Phone and account histories are joined; an older row's last check counts as its first entry. |

## Not done

- A noted change isn't sent anywhere; the app has no clinician behind it.
- The "See a doctor soon" wording and the age cut-offs need the clinician review.
- Screening (tests a doctor does) is a separate phase.

## Done when

- [x] Lint, typecheck and tests pass (age defaults, history in the store and the sync merge).
- [x] Web, as a guest at phone width: a skin check through "I noticed a change", the doctor screen, Today's flag, the guide's history and Your checks.
- [x] Migration run on 2026-11-01.
- [ ] A signed-in device: history syncs to the account and back.
