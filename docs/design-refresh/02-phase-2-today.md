# Phase 2 — Today

**Goal:** Today opens on one clear next step, a quick way to say how you feel, and a tip that stands apart.
**Effort:** 2–3 days. **Branch:** `design/phase-2`.

## 2.1 Next-step panel

- [x] Keep the night-violet panel and the ribbon line; add a `Tag` ("Due today", rose) above the title (`NextStepPanel due`).
- [x] For a guided self-check, show its steps as segments under the body (`NextStepPanel steps`), and say the count in the body ("5 steps"), so people know how long it is. Drawn in the ribbon's color on the panel; `ProgressSegments` uses `raised`, which is too bright on night violet.
- [x] One white main button ("Start self-check"); "Remind me tomorrow" stays as the quiet second action. *(Unchanged.)*

## 2.2 How are you today?

- [x] Replace the emoji with the five Hugeicons faces (`MOODS[].icon`) in a row of tap targets (Rough, Low, Okay, Good, Great), each with its word under the face. Shared with the full check-in and Journey's recent check-ins.
- [x] The chosen mood fills `action` with white text; the others stay `ground` with `muted` text. Screen readers hear "Good, radio button, selected".
- [x] After choosing: "Saved for today" with the face icon and an Edit link, and the row to add pain, energy and symptoms.

## 2.3 Tip and awareness

- [x] The tip sits in a warm `sun` block with a lightbulb icon well, not a white card. New pairs `ink`/`sun` and `sunInk`/`surface` added to `palette.test.ts`.
- [x] Awareness month row: the ribbon icon in a lavender well.

## 2.4 Header

- [ ] Date, greeting in Nunito, initials avatar (unchanged), checked at Larger text: the greeting wraps, never clips.

## Done when

- [ ] Today matches the concept on web and iOS, light and dark, at Default and Larger text.
- [ ] VoiceOver reads the panel as one group, then each mood with its state.
- [ ] Guest and signed-in Today both checked.
