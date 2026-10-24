# Phase 3 — Today and Learn

**Goal:** the Today tab, the Learn tab, cancer type details and the guided self-check, built with the Phase 2 components.
**Effort:** 1–1.5 weeks. **Branch:** `redesign/phase-3`.

Artboards: **Today**, **Learn**, **Cancer type: Breast cancer**, **Self-check guide**, **Today (dark)**.

## 3.1 Self-check tracking (on the device)

- [x] `selfCheckStore` (persisted): last done date per guide, the user's chosen guides (defaults by profile gender, editable later in Settings), and a snooze date.
- [x] `nextDue(guide)` from `frequency` (Monthly / Weekly) and the last done date; unit tested.
- [x] Monthly self-check reminder uses the user's chosen guides and is rescheduled when one is marked done.

## 3.2 Today — `/(tabs)/today`

- [x] Header: date, greeting by time of day ("Good morning / afternoon / evening, Ana"; "Hello" for guests), avatar or initials → Profile.
- [x] **Next step panel**, one item, in this priority:
  1. A self-check that is due (not snoozed) → "Start self-check" / "Remind me tomorrow".
  2. Journey users with an appointment in the next 24 hours → the appointment (Phase 4 data; hidden until then).
  3. Nothing due → "Learn the early signs" linking to Learn.
- [x] **How are you feeling today?** for Journey focuses only (until Phase 4 adds the focus: signed-in users who started their journey): five mood buttons save today's check-in mood; "Add pain, energy and symptoms" opens the full check-in (Phase 4). After saving, the card shows today's mood and an "Edit" link.
- [ ] **Coming up** (Phase 4 data): next two appointments or treatment sessions; hidden when empty. *Moved to Phase 4, which builds the appointment data (4.2 already lists it).*
- [x] **Tip for today** from `constants/healthTips.ts`, chosen by date so it is stable all day; links to Learn's risk section.
- [x] **Awareness month** row from the existing awareness logic, linking to the related cancer type.
- [x] **Need someone to talk to?** → Help.

## 3.3 Learn — `/(tabs)/learn`

- [x] Search field that filters cancer types, self-check guides and prevention tips together (client side), with a "No results for …" empty state.
- [x] **Check yourself:** the user's chosen guides first with due status ("Due today" in rose), then "See all 12 guides".
- [x] **Cancer types:** alphabetical rows.
- [x] **Lower your risk:** chips for the 12 prevention tips; tapping one opens a sheet with the tip, its detail and its source.

## 3.4 Cancer type — `/learn/cancer/[id]`

- [x] Title, description, "On this page" chips that scroll to: Signs to watch for (`symptoms`), Who has a higher risk (`riskFactors`), How it's found (`screeningMethods` plus `earlyDetectionInfo`), When to see a doctor.
- [x] Action rows: the related self-check guide (if any) and "Find a screening center" → Help. (Help opens at the top; Phase 5 adds the filter to screening centers.)
- [x] Footer: "This is general information, not medical advice." Sources show only when the data has them (cancer types have no source columns today; adding nullable `source_name`/`source_url` is optional and owner-applied).
- [ ] Save (bookmark) moves to the new Saved screen in Phase 5. *Phase 5.*

## 3.5 Guided self-check — `/learn/check/[id]`

- [x] Intro: frequency, who it is for, progress segments. (The guides have no "best time" field, so the intro shows the age recommendation instead.)
- [x] Steps from `guide.steps` as a step list: done steps collapsed with a check, the current step expanded with its detail, the rest as one-line titles. Bottom bar: Back / Next step; the last step says "Mark as done".
- [x] **Listen instead:** `expo-speech` reads the current step (web uses the browser's speech synthesis through the same API); "Stop" while speaking.
- [x] Warning signs and "Noticed a change?" with a link to screening centers.
- [x] "Mark as done" saves to `selfCheckStore`, shows "Done. Next check: November 24.", and reschedules the reminder.
- [x] Illustrations are not part of v1; the layout must look complete without them. Commissioned illustrations can slot into the step card later.

## Done when

- [x] All five artboards match on web and the iOS Simulator, light and dark, at Default and Larger text.
- [x] Unit tests for `nextDue`, next-step priority and tip-of-the-day selection.
- [x] A guest can complete a self-check and see it marked done after restarting the app.
- [x] Old Home, Info and Prevention screens and their components are deleted.

## Notes from building it

- **Where things live:** dates and priority in `lib/selfCheck.ts` (pure, tested), saved dates in `stores/selfCheckStore.ts` (on the device, guests included), and the hook `useSelfChecks()` plus `markSelfCheckDone` / `snoozeSelfCheck` in `hooks/useSelfChecks.ts`. Learn's links and search are in `lib/learn.ts`; Today's greeting in `lib/today.ts`; awareness months moved to `constants/awareness.ts`.
- **Default guides:** Female → Breast, Skin, Oral; Male → Testicular, Skin, Oral; anyone else and guests → Skin, Oral. A guide never done is due today.
- **Reminder:** the self-check reminder now fires at 9 AM on the soonest chosen guide's due day ("Breast Self-Exam is due today"), or the day after a snooze. Before the guides have loaded it falls back to the old reminder on the 1st of the month.
- **Tab bar:** the redesign's tab bar is wired in. It sits below the screens instead of floating over them, so the old screens' bottom padding shrank to match. On the web, tab labels stay at the default size (browsers can't shrink "Community" to fit at Larger text).
- **New native module:** `expo-speech`. The iOS and Android development builds must be rebuilt.
- **Removed:** `components/home/TipAndAwareness.tsx`, `components/learn/LearnParts.tsx`, `components/SectionCard.tsx` and `lib/cancerIcons.ts`.
- **Dev server:** this machine has no Watchman, and Metro did not pick up file edits; restart `npx expo start` after changes.
