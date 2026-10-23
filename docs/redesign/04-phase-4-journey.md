# Phase 4 — Journey

**Goal:** the opt-in Journey: focus choice, dashboard, daily check-in, treatments, appointments and the doctor summary.
**Effort:** 1–1.5 weeks. **Branch:** `redesign/phase-4`.

Artboards: **Journey setup (opt-in)**, **Journey**, **Daily check-in**.

## 4.1 Focus — `/journey/focus`

- [ ] Four choices: Learning and checking myself, Going through treatment, Finished treatment, Caring for someone. Saved to user metadata `journey_focus` (guests: device storage). Shown after sign-up and from Profile ("Change").
- [ ] "Learning" hides Journey content: the Journey tab shows a short invitation ("Track how you feel, treatments and appointments") with a button to change focus.
- [ ] Treatment, Finished and Caring continue into the existing setup questions (diagnosis date; cancer-free date for Finished), restyled with the Phase 2 components.
- [ ] Copy for Caring speaks to the caregiver ("Track how they're doing").

## 4.2 Appointments (new data)

- [ ] SQL file `supabase/migrations/<date>_journey_appointments.sql`, additive, for the owner to apply:
  - `journey_appointments`: `id uuid pk`, `user_id uuid references auth.users on delete cascade`, `title text`, `starts_at timestamptz` (written as local wall-clock time through `toDbTimestamp`, the same convention as the other journey tables), `location text null`, `notes text null`, `treatment_id uuid null`, `created_at`.
  - Row Level Security: users read and write only their own rows. Add it to the `delete-account` function's table list.
- [ ] Model, mapper (with tests), API and TanStack Query hooks; add and edit screen `/journey/appointment` (title, date and time, place, notes, linked treatment).
- [ ] Appointment reminder the day before at 6:00 PM (DATE trigger, identifier `appointment-<id>`), rescheduled or cancelled on edit and delete.
- [ ] Feeds Today's next-step panel and "Coming up".

## 4.3 Dashboard — `/(tabs)/journey`

- [ ] Title "My journey", subtitle from focus and dates ("In treatment since July 2026"), "Check in" button.
- [ ] **This week:** Mon–Sun strip from entries; today ringed; days with a check-in filled with a check (state is never shown by color alone).
- [ ] **Energy and pain:** last 7 days as paired bars with legend, averages, and an accessible text summary; "Most common symptoms" line.
- [ ] **Coming up:** next appointments.
- [ ] **Treatments:** name, status, session progress (`completedSessions` / `totalSessions`), add button; the existing "+1 session" action stays.
- [ ] **Milestones:** existing automatic and custom milestones.
- [ ] Error state with Retry when loading fails (keep the Phase 7 migration fix).

## 4.4 Daily check-in — `/journey/check-in`

- [ ] Mood (Rough, Low, Okay, Good, Great → stored 1–5), pain and energy sliders with spoken value text, sleep (5 options), symptoms (10 common chips + "More symptoms" for the full `COMMON_SYMPTOMS` list), notes.
- [ ] Opening it again the same day edits that day's entry. Save → toast "Check-in saved" and back.
- [ ] Notes rely on the keyboard's dictation key for voice input (no custom mic button).
- [ ] **Daily check-in reminder** (8:00 PM by default) replaces the weekly check-in for Treatment, Finished and Caring focuses; off for Learning. Migrate the old `weekly_checkin` preference.

## 4.5 Share a summary with my doctor

- [ ] `expo-print` builds a one-to-two-page PDF from HTML: name, focus, date range (default last 30 days), check-in averages and trend, most common symptoms with counts, treatments and progress, upcoming appointments, notes the user chooses to include.
- [ ] `expo-sharing` opens the share sheet; on web, open the browser's print dialog.
- [ ] A preview screen states exactly what will be shared before the share sheet opens.

## Done when

- [ ] The three artboards match on web and the iOS Simulator, light and dark, at Default and Larger text.
- [ ] Unit tests: focus migration, week strip and averages from entries, appointment mapper and reminder scheduling, PDF HTML builder (snapshot of the text content).
- [ ] With a test account: set focus, add a treatment and an appointment, check in, see it on Today and Journey, share a PDF.
- [ ] Owner has applied the appointments SQL to the project (recorded in the decision log with the date).
