# Phase 4 — Journey and the thread

**Goal:** the signature moment: your week drawn as one ribbon thread, with clear numbers for how you're doing.
**Effort:** 3–4 days. **Branch:** `design/phase-4`.

## 4.1 The thread (This week)

- [ ] New `ThreadWeek` component (in `components/journey/`): an SVG ribbon line from Monday to today with seven knots. A day with a check-in is a filled `action` knot with a check mark inside; a missed day is an outlined knot; today is a larger ringed knot. State is never shown by color alone.
- [ ] Day letters under the knots; "Today" spelled out. "4 of 7 days" on the right.
- [ ] Draws from the same data as the current week strip (`weekStrip` in `lib/journey.ts`); replaces it.
- [ ] Screen readers get one label: "This week: checked in Monday, Tuesday, Thursday and Friday. 4 of 7 days."
- [ ] Optional, once: the thread draws itself in on first open (about 600 ms). Off with Reduce Motion.

## 4.2 Check in

- [ ] "Check in for today" becomes the full-width violet button right under the thread ("Edit today's check-in" once done).

## 4.3 Energy and pain

- [ ] Two `StatTile`s: 7-day average in Nunito (energy in violet, pain in rose) with a trend line ("up from 5", "steady", "down from 4"), computed from the last 7 days against the 7 before. Add the trend to `lib/journey.ts` with tests.
- [ ] The paired-bar chart stays below the tiles, with its text summary.

## 4.4 Coming up, treatments, milestones

- [ ] Appointments and treatment sessions use sun-tinted icon wells (medicine, calendar).
- [ ] Treatments keep the session progress; milestones keep their list. Icons swapped.

## Done when

- [ ] Journey matches the concept on web and iOS, light and dark, at Default and Larger text, for a new user (no check-ins), a partial week and a full week.
- [ ] Unit tests: thread knot states from entries, the 7-day trend.
- [ ] VoiceOver reads the week as one sentence.
