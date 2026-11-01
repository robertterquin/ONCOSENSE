# Phase 24 — Your checks, bundled

**Goal:** following several cancers stays simple. Everything a person follows shows on one calendar card, bundled into at most three kinds of check, and people choose what to follow when they set up the app.

**Branch:** `design/phase-24`

## Changes

| Where | Change |
|---|---|
| Today | The checks card is a calendar for everything followed: a dot on each due day (test, body check, signs check), up to three items underneath, "+N more" to Journey. This week when something is due, else the week of the next check. "Done for November", the self-check-only calendar, "Learn the early signs" and the separate "Also due" card are gone. Following nothing shows "Pick cancers to keep an eye on". |
| Monthly body check (`/body-check`) | The self-checks for the followed cancers, one after another, each with its own guide and result. |
| Signs check (`/signs`, was one page per cancer) | Every followed cancer with no self-check or test, on one screen, every 3 months. "Yes" asks which, then shows "See a doctor soon". |
| Sign-up | After "What brings you here?" (without cancer, or after treatment): "Which cancers do you want to keep an eye on?", recommended ones ticked, "Most people follow 3 or fewer". Their own cancer isn't offered after treatment; in treatment there's no step. |
| Recommended (ticked) | Only cancers with a recommended test for that sex and age: cervical (women 25 to 65), breast (women 40+), colorectal (45 to 75), prostate talk (men 50+). Skin and testicular self-checks are a choice, not a default. |
| Reminder | One reminder names the soonest check of any kind ("Your stool test is due today"). |
| My health, Your cancers | "Monthly body check" and "Signs check" names; Your cancers says "Most people follow 3 or fewer". |

## Why bundle, and why no hard limit

- Guidelines favour knowing what's normal for your body over strict exam schedules: the American Cancer Society doesn't recommend routine breast self-exams for women at average risk, and the US Preventive Services Task Force recommends against testicular screening and finds too little evidence on skin checks. One gentle monthly body check is honest; a calendar of separate exams suggests more than the evidence does.
- A limit of 3 would fill up with recommended tests alone (a woman of 45 to 65 has three), leaving no room for a cancer that runs in the family. Bundling keeps the card simple however many are followed.

## Not done

- People who never changed their list now get the new recommended defaults, so a default skin or testicular check no longer shows for them until they follow it.
- The reminder doesn't leave out a survivor's own cancer when it names the soonest check (`shortcut:` in the notification service).
- Clinician review of the bundling wording and the recommended defaults.

## Done when

- [x] Lint, typecheck and tests pass (bundling, soonest-first, noted changes, defaults, reminder text).
- [x] Web, as a guest at phone width: sign-up step, the card, body check and signs check.
- [ ] A device: the reminder fires for the soonest check.
