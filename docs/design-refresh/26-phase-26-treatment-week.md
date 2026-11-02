# Phase 26 — Treatment week

**Goal:** people in treatment get the calendar card the checks have: their sessions, appointments and check-in days for the week, on Today.

**Branch:** `main`

## Changes

| Where | Change |
|---|---|
| Shared (`components/today/CalendarCard.tsx`) | `CalendarCard`, `WeekStrip` and `CalendarRow`, pulled out of the checks card so both calendars look the same. Dots on the panel take the dark theme's colors (amber as ink), since the panel is dark in both themes: the checks card's test dot was nearly invisible in dark mode. |
| Treatment week (`lib/treatmentWeek.ts`, `TreatmentWeekCard`) | This week, or the week of the next appointment. Amber dots for sessions (appointments linked to a treatment), lavender for other appointments, teal for check-in days. Title "Today: …" / "Tomorrow: …" with the time and place, else the count this week or "Next: …"; the line under it shows a counted course ("Chemotherapy: 3 of 6 sessions done"). Up to 3 appointments, "Plan some rest after" a chemotherapy session, and "Add an appointment". With nothing coming up: "Nothing scheduled", this week's check-in days and the same button. |
| Today, in treatment | The week card first, replacing the next-step panel for an appointment within a day and the "Coming up" rows; then the check-in and "Your cancer". After treatment is unchanged. |

## Not done

- Treatments have no session dates, so sessions only show once added as appointments linked to the treatment.
- Checked on the dev Journey sample (`/dev/journey`), not with a signed-in account.

## Done when

- [x] Lint, typecheck and tests pass (`treatmentWeek`).
- [x] Web at phone width, light and dark: the card on the dev Journey sample.
