# Phase 5 — Personal Features

**Goal:** Journey, Profile, Settings and saved items work for a signed-in user, with data shared correctly with the Flutter app.
**Effort:** 2–3 weeks. **Branches:** `rn/phase-5-journey`, `rn/phase-5-profile`, `rn/phase-5-saved`, `rn/phase-5-settings`.

## 5.1 Journey (the largest area)

### Onboarding / setup

`journey_onboarding_screen.dart` (849 lines) and `journey_setup_screen.dart` (690 lines) are near-duplicates: same pages (journey type → start date with quick-date chips → cancer-free), same widgets.

- [ ] Build **one** multi-step component `src/components/journey/JourneySetupFlow.tsx` (horizontal pager or step state), used by both `journey/onboarding.tsx` and `journey/setup.tsx`.
- [ ] Onboarding keeps "Skip" with the "Skip Setup?" confirm and "Continue Setup" option.
- [ ] Date picking with `@react-native-community/datetimepicker`.
- [ ] On finish, save the same data as today: user metadata `journey_started` (`supabase_service.dart → saveJourneySetupStatus`), diagnosis date and cancer-free start date.

### Journey tab — `journey_screen.dart` (1,474 lines)

Four inner tabs. Use a top tab bar (`react-native-pager-view` or `@react-navigation/material-top-tabs`) and one component per tab:

- [ ] **Dashboard:** today's entry card / no-entry card, weekly overview, stat cards, streak (port `_calculateStreak()` exactly), treatment progress.
- [ ] **Journal:** list of entries from `journey_entries`.
- [ ] **Treatment:** list from `journey_treatments` with progress.
- [ ] **Milestones:** list from `journey_milestones`, add milestone ("🎉 Milestone added!"), celebrate ("🎉 Celebrated!").
- [ ] "Add" menu with options → Add entry / Add treatment.

### Add entry — `add_entry_screen.dart`

- [ ] Mood selector, 5 sliders (`@react-native-community/slider`), sleep selector, symptoms multi-select, appointment toggle, notes.
- [ ] Save to `journey_entries`; invalidate journey queries.

### Add treatment — `add_treatment_screen.dart`

- [ ] Treatment type selector, name (required: "Please enter a treatment name"), start date, sessions counter, side-effects multi-select, notes.
- [ ] Save to `journey_treatments`.

### Cross-app check

- [ ] A journey started and filled in on Flutter shows identical stats, streak and lists on React Native, and the other way round.

## 5.2 Profile — `profile_screen.dart`, `edit_profile_screen.dart`, `change_password_screen.dart`

- [ ] `profile/index.tsx`: header with photo and name, menu items (Edit profile, Notifications, Saved articles/questions/resources, Settings, Help & Support with contact items, About), Logout with confirm ("Are you sure you want to logout?").
- [ ] `profile/edit.tsx`: name, age, gender dropdown; photo via `expo-image-picker` with "Take a Photo", "Choose from Gallery", "Remove Photo". Upload to bucket `images` at `profile_pictures/<file>` and save the URL in `profile_picture_url` — same as today. Add camera/photo-library permission strings to `app.config.ts`.
- [ ] Resize/compress photos before upload (`expo-image-manipulator`) — new, avoids large uploads.
- [ ] `profile/change-password.tsx`: `updateUser({ password })` with the same validation.

## 5.3 Saved items — `saved_articles_screen.dart`, `saved_questions_screen.dart`, `saved_resources_screen.dart`

- [ ] Three list screens backed by `useBookmarks`; remove bookmark from the list; empty states.
- [ ] Saved question opens `forum/[id]`; saved article opens in `expo-web-browser`; saved resource offers call/website.

## 5.4 Settings — `settings_screen.dart` (1,142 lines)

- [ ] Sections and switch tiles as today: dark mode, notifications master switch, health reminders, and the per-type toggles (wired up in Phase 6).
- [ ] "Send test notification" (wired up in Phase 6).
- [ ] About / licenses / external links. Update the open-source licenses list: the Flutter packages listed there are replaced by the React Native ones.
- [ ] "Share app" and "Rate app" currently show "available soon" — keep as-is or implement with `Share` and `expo-store-review`.
- [ ] **Delete account — fix the known gap.** Today it only clears local data. Implement a Supabase Edge Function `delete-account` that deletes the user's rows and the auth user using the service role key (server-side only), call it from the app, then sign out. Apple App Store review requires real account deletion.

## Done when

- [ ] Journey data is identical across both apps for the same account.
- [ ] Profile edit (including photo) and password change work on both platforms.
- [ ] Delete account removes the user from Supabase Auth (verify in the dashboard on the dev project).
- [ ] Side-by-side visual sign-off against the Phase 0 screenshots.
