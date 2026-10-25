# Phase 4 — Journey

**Goal:** the opt-in Journey: focus choice, dashboard, daily check-in, treatments, appointments and the doctor summary.
**Effort:** 1–1.5 weeks. **Branch:** `redesign/phase-4`.

Artboards: **Journey setup (opt-in)**, **Journey**, **Daily check-in**.

## 4.1 Focus — `/journey/focus`

- [x] Four choices: Learning and checking myself, Going through treatment, Finished treatment, Caring for someone. Saved to user metadata `journey_focus` (guests: device storage). Shown after sign-up and from Profile ("Change").
- [x] "Learning" hides Journey content: the Journey tab shows a short invitation ("Track how you feel, treatments and appointments") with a button to change focus.
- [x] Treatment, Finished and Caring continue into the existing setup questions (diagnosis date; cancer-free date for Finished), restyled with the Phase 2 components.
- [x] Copy for Caring speaks to the caregiver ("Track how they're doing").

## 4.2 Appointments (new data)

- [x] SQL file `supabase/migrations/<date>_journey_appointments.sql`, additive, for the owner to apply:
  - `journey_appointments`: `id text pk`, `user_id uuid references auth.users on delete cascade`, `title text`, `starts_at timestamptz` (written as local wall-clock time through `toDbTimestamp`, the same convention as the other journey tables), `location text null`, `notes text null`, `treatment_id text null`, `created_at`. (Text IDs, not uuid: the other journey tables use the app's millisecond IDs.)
  - Row Level Security: users read and write only their own rows. Add it to the `delete-account` function's table list.
- [x] Model, mapper (with tests), API and TanStack Query hooks; add and edit screen `/journey/appointment` (title, date and time, place, notes, linked treatment).
- [x] Appointment reminder the day before at 6:00 PM (DATE trigger, identifier `appointment-<id>`), rescheduled or cancelled on edit and delete.
- [x] Feeds Today's next-step panel and "Coming up".

## 4.3 Dashboard — `/(tabs)/journey`

- [x] Title "My journey", subtitle from focus and dates ("In treatment since July 2026"), "Check in" button.
- [x] **This week:** Mon–Sun strip from entries; today ringed; days with a check-in filled with a check (state is never shown by color alone).
- [x] **Energy and pain:** last 7 days as paired bars with legend, averages, and an accessible text summary; "Most common symptoms" line.
- [x] **Coming up:** next appointments.
- [x] **Treatments:** name, status, session progress (`completedSessions` / `totalSessions`), add button; the existing "+1 session" action stays.
- [x] **Milestones:** existing automatic and custom milestones.
- [x] Error state with Retry when loading fails (keep the Phase 7 migration fix).

## 4.4 Daily check-in — `/journey/check-in`

- [x] Mood (Rough, Low, Okay, Good, Great → stored 1–5), pain and energy sliders with spoken value text, sleep (5 options), symptoms (10 common chips + "More symptoms" for the full `COMMON_SYMPTOMS` list), notes.
- [x] Opening it again the same day edits that day's entry. Save → toast "Check-in saved" and back.
- [x] Notes rely on the keyboard's dictation key for voice input (no custom mic button).
- [x] **Daily check-in reminder** (8:00 PM by default) replaces the weekly check-in for Treatment, Finished and Caring focuses; off for Learning. Migrate the old `weekly_checkin` preference.

## 4.5 Share a summary with my doctor

- [x] `expo-print` builds a one-to-two-page PDF from HTML: name, focus, date range (default last 30 days), check-in averages and trend, most common symptoms with counts, treatments and progress, upcoming appointments, notes the user chooses to include.
- [x] `expo-sharing` opens the share sheet; on web, open the browser's print dialog.
- [x] A preview screen states exactly what will be shared before the share sheet opens.

## Done when

- [x] The three artboards match on web and the iOS Simulator, light and dark, at Default and Larger text. *(Moved to the Phase 7 screen-by-screen artboard check.)*
- [x] Unit tests: focus migration, week strip and averages from entries, appointment mapper and reminder scheduling, PDF HTML builder (snapshot of the text content).
- [ ] With a test account: set focus, add a treatment and an appointment, check in, see it on Today and Journey, share a PDF.
- [x] Owner has applied the appointments SQL to the project (recorded in the decision log with the date). *(Applied 2026-10-25, checked against the live project.)*

## Notes from building it

- **Waiting on the owner:** run `supabase/migrations/20261024000000_journey_appointments.sql` on the project, then deploy `delete-account` again (it now also deletes appointments, and skips the table if it doesn't exist yet). Until the SQL runs, appointments load as an empty list and saving one says "Appointments aren't available yet".
- **Not tested with an account:** I can't sign in to the live project, so saving check-ins, treatments and appointments, and sharing a real PDF, need a test account (the last "Done when" item). Everything else was checked as a guest and with sample data at `/dev/journey`.
- **Focus:** `lib/focus.ts`, saved in user metadata `journey_focus` (guests: `stores/focusStore.ts`). Accounts from before the redesign get one automatically: a started journey with a cancer-free date is Finished, any other started journey is Treatment. Anyone without a focus sees "What brings you here?" after signing in (it replaced `/journey/onboarding`); Skip saves Learning. Profile has a "What brings you here" row to change it.
- **Reminders:** the weekly check-in became a daily one at 8:00 PM (`daily-checkin`), scheduled only for Treatment, Finished and Caring; the saved weekly on/off choice carries over (notification prefs version 2). Appointment reminders (`appointment-<id>`) are set on save, removed on delete, and set again once per session from the loaded list, so a new phone gets them too.
- **Today:** an appointment within 24 hours becomes the next step when no self-check is due, and "Coming up" shows the next two.
- **Treatment form:** restyled too, and it can now edit (`?id=`), mark a treatment finished and delete one.
- **Also changed:** mood labels are Rough, Low, Okay, Good, Great; the shared `MoodPicker` is used by Today and the check-in; `DateField` has a time mode; `BottomActionBar` makes its buttons share the width (single buttons used to hug their label).
- **Removed:** `JourneySetupFlow`, `JourneyCards`, `AddToJourneySheet`, `FormSection` and `/journey/onboarding`.
- **New native modules:** `expo-print` and `expo-sharing` (with its config plugin). Rebuild the development builds.
