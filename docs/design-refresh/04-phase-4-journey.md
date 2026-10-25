# Phase 4 — Journey and the thread

**Goal:** the signature moment: your week drawn as one ribbon thread, with clear numbers for how you're doing.
**Effort:** 3–4 days. **Branch:** `design/phase-4`.

## 4.1 The thread (This week)

- [x] New `ThreadWeek` component (`components/journey/ThreadWeek.tsx`): an SVG ribbon line from Monday to Sunday with seven knots, one gentle wave per day. A check-in is a filled `action` knot with a check mark; a missed day is an outlined knot; today is a larger ringed knot; the line after today is pale. State is never shown by color alone.
- [x] Day letters under the knots; "Today" spelled out. The count stays as the section subtitle ("4 of 7 days checked in").
- [x] Draws from `weekStrip` in `lib/journey.ts`; replaces `ThisWeek`.
- [x] Screen readers get one label from `weekThreadText`: "This week: checked in Monday, Tuesday and Saturday. 3 of 7 days."
- [ ] Optional, once: the thread draws itself in on first open (about 600 ms). Off with Reduce Motion. *(Skipped for now.)*

## 4.2 Check in

- [x] "Check in for today" is the full-width violet button right under the thread ("Edit today's check-in" once done; "Check in for them" for carers).

## 4.3 Energy and pain

- [x] Two `StatTile`s: 7-day average in Nunito (energy in violet, pain in rose) with a trend line ("up from 5", "steady", "down from 4"; just "of 10" when the week before has no check-ins). `sevenDayTrend` in `lib/journey.ts`, tested.
- [x] The paired-bar chart stays below the tiles, in its own white block, with its text summary.

## 4.4 Coming up, treatments, milestones

- [x] Appointments and treatments use sun-tinted icon wells (calendar, medicine).
- [x] Treatments keep the session progress; milestones keep their list. Icons swapped.

## Done when

- [ ] Journey matches the concept on web and iOS, light and dark, at Default and Larger text, for a new user (no check-ins), a partial week and a full week.
- [x] Unit tests: the thread sentence from entries, the 7-day trend. (Knot states come from `weekStrip`, already tested.)
- [ ] VoiceOver reads the week as one sentence.
