# Phase 5 — Personal Features

**Goal:** Journey, Profile, Settings and saved items work for a signed-in user, with data shared correctly with the Flutter app.
**Effort:** 2–3 weeks. **Branch:** `rn/phase-5`.

## 5.1 Journey

### Setup — `journey_onboarding_screen.dart` + `journey_setup_screen.dart`

- [x] One flow, `src/components/journey/JourneySetupFlow.tsx`, with `mode="onboarding"` (`journey/onboarding.tsx`, after registering, with Skip → "Skip Setup?") and `mode="setup"` (inside the Journey tab until a journey exists).
- [x] Three steps with a progress bar: journey type (patient/survivor), start date (date picker + quick chips), cancer-free toggle and date.
- [x] Saves `journey_started`, diagnosis date and cancer-free date to user metadata and adds the "Journey Started 🌟" milestone (`useStartJourney`).
- [x] Date picking: `src/components/DateField.tsx` (iOS compact picker, Android dialog) and `DateField.web.tsx` (browser date input).

### Journey tab — `journey_screen.dart`

- [x] Header with "N days free" badge and Dashboard / Journal / Treatment / Milestones tabs.
- [x] Dashboard: streak, milestone and entry counts; today's check-in (or prompt); 7-day mood overview with averages; up to 2 active treatments; 3 recent milestones.
- [x] Journal (tap to edit), Treatment (progress bar, "Complete Session"), Milestones (celebrate 🎉).
- [x] "+" button → Add to Journey sheet: Daily Journal Entry, New Treatment, Custom Milestone dialog.
- [x] Guests see a sign-in prompt (there's no account to save a journey to).

### Add entry / Add treatment

- [x] `journey/add-entry.tsx` (`?id=` to edit): mood, pain and energy sliders with Flutter's colors and labels, sleep, symptoms, appointment toggle and notes, notes.
- [x] `journey/add-treatment.tsx`: type chips, name (required), start date, sessions counter (hidden for surgery/other), side effects, notes.

### Cross-app check

- [ ] A journey started and filled in on Flutter shows identical stats, streak and lists on React Native, and the other way round — needs a signed-in account.

## 5.2 Profile — `profile_screen.dart`, `edit_profile_screen.dart`, `change_password_screen.dart`

- [x] `profile/index.tsx`: gradient header (photo or initial, name, email, "Active Member"), Your Content (Edit Profile, Saved Articles/Questions/Resources with counts), Preferences (Settings, Change Password, Notifications, Help & Support, About), Log Out with confirm. Guests see "Sign In" instead and no account-only items.
- [x] `profile/edit.tsx`: photo sheet (gallery, camera, remove), name, read-only email, age (1–150), gender. Photos are resized to 512 px and uploaded to `images/profile_pictures/profile_<userId>.jpg` (`src/api/profilePicture.ts`); camera/photo permission texts in `app.json`.
- [x] `profile/change-password.tsx`: email, current password (checked by signing in again, like Flutter), new password with the live checklist, confirm.

## 5.3 Saved items — `saved_*_screen.dart`

- [x] `profile/saved/articles.tsx`, `questions.tsx`, `resources.tsx` with a shared `SavedList` layout: list, remove bookmark, empty state with a button to the matching tab. Saved questions open the forum thread; saved resources offer Call / Website / Email.

## 5.4 Settings — `settings_screen.dart`

- [x] Notification switches (master + 7 types) saved in `src/stores/notificationStore.ts`; Phase 6 schedules reminders from them and adds "Test Notification".
- [x] Dark Mode, Medical Disclaimer / Terms / Privacy / Credits sheets (texts copied by script into `src/constants/legal.ts`; Credits updated for React Native), About, Rate / Share ("available soon", as in Flutter).
- [x] **Delete Account now really deletes.** `supabase/functions/delete-account` (Edge Function) removes the user's votes (and the counts they added), answers (and answer counts), questions with their answers, bookmarks, journey data, reports, profile photo and the auth user, using the service-role key on the server only. The app calls it, then clears the device and returns to Welcome.
- [ ] Deploy the function: `supabase functions deploy delete-account` (no secrets needed — Supabase provides the keys to functions).

## Deliberate differences from Flutter

| Flutter | React Native | Why |
|---|---|---|
| Energy slider allowed 0 | Starts at 1 | The database rejects 0, so Flutter's save silently failed |
| Failed photo upload saved the profile with no photo | Upload errors stop the save and keep the old photo | Avoids losing the photo |
| Delete Account only cleared local data | Deletes the account on the server | Store requirement; what the dialog promised |
| Two near-identical setup screens | One `JourneySetupFlow` | Less duplicated code |
| Treatment type grid | Wrapping chips | Same as Flutter's Wrap; no broken words |

## Done when

- [x] All Phase 5 screens build, typecheck and render on web (journey setup flow, add entry/treatment, profile, settings, saved lists, legal sheets).
- [x] 55 unit tests pass (new: slider labels, edit-profile and change-password rules).
- [ ] Journey data is identical across both apps for the same account (signed-in test).
- [ ] Profile edit (including photo) and password change work on both platforms (signed-in test on a device).
- [ ] Delete account removes the user from Supabase Auth — deploy the function, then test with a throwaway account.
