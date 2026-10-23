# Phase 3 — Today and Learn

**Goal:** the Today tab, the Learn tab, cancer type details and the guided self-check, built with the Phase 2 components.
**Effort:** 1–1.5 weeks. **Branch:** `redesign/phase-3`.

Artboards: **Today**, **Learn**, **Cancer type: Breast cancer**, **Self-check guide**, **Today (dark)**.

## 3.1 Self-check tracking (on the device)

- [ ] `selfCheckStore` (persisted): last done date per guide, the user's chosen guides (defaults by profile gender, editable later in Settings), and a snooze date.
- [ ] `nextDue(guide)` from `frequency` (Monthly / Weekly) and the last done date; unit tested.
- [ ] Monthly self-check reminder uses the user's chosen guides and is rescheduled when one is marked done.

## 3.2 Today — `/(tabs)/today`

- [ ] Header: date, greeting by time of day ("Good morning / afternoon / evening, Ana"; "Hello" for guests), avatar or initials → Profile.
- [ ] **Next step panel**, one item, in this priority:
  1. A self-check that is due (not snoozed) → "Start self-check" / "Remind me tomorrow".
  2. Journey users with an appointment in the next 24 hours → the appointment (Phase 4 data; hidden until then).
  3. Nothing due → "Learn the early signs" linking to Learn.
- [ ] **How are you feeling today?** for Journey focuses only: five mood buttons save today's check-in mood; "Add pain, energy and symptoms" opens the full check-in (Phase 4). After saving, the card shows today's mood and an "Edit" link.
- [ ] **Coming up** (Phase 4 data): next two appointments or treatment sessions; hidden when empty.
- [ ] **Tip for today** from `constants/healthTips.ts`, chosen by date so it is stable all day; links to Learn's risk section.
- [ ] **Awareness month** row from the existing awareness logic, linking to the related cancer type.
- [ ] **Need someone to talk to?** → Help.

## 3.3 Learn — `/(tabs)/learn`

- [ ] Search field that filters cancer types, self-check guides and prevention tips together (client side), with a "No results for …" empty state.
- [ ] **Check yourself:** the user's chosen guides first with due status ("Due today" in rose), then "See all 12 guides".
- [ ] **Cancer types:** alphabetical rows.
- [ ] **Lower your risk:** chips for the 12 prevention tips; tapping one opens a sheet with the tip, its detail and its source.

## 3.4 Cancer type — `/learn/cancer/[id]`

- [ ] Title, description, "On this page" chips that scroll to: Signs to watch for (`symptoms`), Who has a higher risk (`riskFactors`), How it's found (`screeningMethods` plus `earlyDetectionInfo`), When to see a doctor.
- [ ] Action rows: the related self-check guide (if any) and "Find a screening center" → Help, filtered to screening centers.
- [ ] Footer: "This is general information, not medical advice." Sources show only when the data has them (cancer types have no source columns today; adding nullable `source_name`/`source_url` is optional and owner-applied).
- [ ] Save (bookmark) moves to the new Saved screen in Phase 5.

## 3.5 Guided self-check — `/learn/check/[id]`

- [ ] Intro: frequency, best time, progress segments.
- [ ] Steps from `guide.steps` as a step list: done steps collapsed with a check, the current step expanded with its detail, the rest as one-line titles. Bottom bar: Back / Next step; the last step says "Mark as done".
- [ ] **Listen instead:** `expo-speech` reads the current step (web uses the browser's speech synthesis through the same API); "Stop" while speaking.
- [ ] Warning signs and "Noticed a change?" with a link to screening centers.
- [ ] "Mark as done" saves to `selfCheckStore`, shows "Done. Next check: November 24.", and reschedules the reminder.
- [ ] Illustrations are not part of v1; the layout must look complete without them. Commissioned illustrations can slot into the step card later.

## Done when

- [ ] All five artboards match on web and the iOS Simulator, light and dark, at Default and Larger text.
- [ ] Unit tests for `nextDue`, next-step priority and tip-of-the-day selection.
- [ ] A guest can complete a self-check and see it marked done after restarting the app.
- [ ] Old Home, Info and Prevention screens and their components are deleted.
