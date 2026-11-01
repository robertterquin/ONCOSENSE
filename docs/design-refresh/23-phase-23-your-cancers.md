# Phase 23 — Your cancers

**Goal:** people follow any of the 15 cancers in Learn, and each followed cancer gets the one action recognised for it: a self-check, a screening test, a talk with a doctor, or knowing its warning signs. No invented self-checks.

**Branch:** `design/phase-23`

## Changes

| Where | Change |
|---|---|
| Your cancers (`/checks`, replaces Your checks) | A switch for each cancer, followed ones first, each saying what it gives ("Self-check monthly, mammogram every year", "Warning signs"). Starts on the defaults for sex and age. Following lung or liver asks one question first (heavy smoking; hepatitis B or C, or cirrhosis), with "I'd rather not say". |
| Screening test page (`/screening/[id]`) | What the test finds, who it's for, next due, how often, "Find a screening center", the person's past tests, and "I've had it" with a date (which sets the next one). Prostate is "Talk to a doctor about PSA testing", recorded once. |
| Warning signs page (`/signs/[cancer]`) | The cancer's signs and "Any of these lasting 2 weeks or more?". No → asked again in 3 months; yes → the same "See a doctor soon" steps as a self-check (`SeeADoctor`, now shared). |
| Today | "Also due" under the self-checks: due tests and warning-sign questions. |
| My health | Screening tests and warning signs, each with its last and next date, then a link to Your cancers. |

## Rules (`src/lib/screening.ts`, tested)

| Cancer | What following it gives |
|---|---|
| Breast | Self-check monthly; mammogram from 40 (yearly to 54, every 2 years from 55) |
| Skin, testicular | Self-check monthly |
| Cervical | HPV test every 5 years, ages 25 to 65 (Pap smear every 3); else warning signs |
| Colorectal | Stool test yearly, ages 45 to 75 (or colonoscopy every 10 years); else warning signs |
| Lung | Low-dose CT yearly, ages 50 to 80 who smoked heavily; else warning signs |
| Liver | Ultrasound every 6 months with hepatitis B or C, or cirrhosis; else warning signs |
| Prostate | Talk to a doctor about PSA testing, from 50; else warning signs |
| Oral, stomach, ovarian, thyroid, lymphoma, leukemia, uterine | Warning signs every 3 months (no self-check: oral has too little evidence, and thyroid screening without symptoms is recommended against by the USPSTF) |

People who finished treatment don't get the average-risk schedule for their own cancer: Your cancers shows "Your care team sets your follow-up" for it.

Defaults: the Phase 22 self-checks, plus cervical (women 25 to 65), colorectal (45 to 75) and prostate (men 50 and over).

Test and warning-sign history uses the self-check history (`self_check_progress`, ids `screening:hpv`, `signs:ovarian`), so it syncs to the account with no new table. Followed cancers and the two answers stay on the phone (`shortcut:` in the store).

## Not done

- Reminders: due tests and warning signs show on Today, but don't send a notification yet.
- People who had picked checks in Phase 22 start again from the defaults (the old choice was by guide, the new one by cancer).
- A clinician review of the ages, intervals, the two questions and the warning-signs wording.

## Done when

- [x] Lint, typecheck and tests pass (defaults, actions per cancer and due dates).
- [x] Web, as a guest at phone width: Your cancers, the lung question, Today's "Also due", the HPV test with "I've had it", and the ovarian warning signs.
- [ ] A signed-in device: test history syncs to the account.
