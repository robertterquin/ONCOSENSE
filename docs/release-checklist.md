# Before launch

What stands between `main` and a public App Store / Google Play release, as of 2026-10-31. The staged release itself (internal testing, beta, rollout) is in [Phase 7](react-native-migration/08-phase-7-qa-release.md#74-staged-release).

Lint, typecheck and the 327 tests pass in CI on every push.

## 1. Medical content review (a clinician)

- [ ] The five cancer pages added on 2026-10-31: testicular, oral, thyroid, lymphoma, uterine (`supabase/migrations/20261031000000_more_cancer_types.sql`).
- [ ] The "For you" rules and age cut-offs in `mobile/src/lib/forYou.ts` (prostate 50+, testicular 15–35, cervical 25–65, colorectal screening from 45).
- [ ] The treatment habits' wording in `mobile/src/constants/habits.ts` ("Gentle movement", "Eat something you enjoy").
- [ ] The content corrections in `supabase/migrations/20261101000000_content_sources.sql` (cancer page figures and sources, the breast page, eight retired self-checks) and the weekly tips in `mobile/src/constants/healthTips.ts`. Run the migration first; until then the app shows the old text.
- [ ] Help contacts: only DOH 1555, NCMH, Philippine Red Cross 143 and the Philippine Cancer Society were checked on 2026-11-01. Call or check the other 18 (screening centers, PhilHealth, PCSO, DSWD, Malasakit, support groups) and set `checked_on` for each.

## 2. Accounts to set up (needs your logins)

- [ ] **EAS project:** in `mobile/`, run `npx eas-cli@latest init` to link the project (adds `extra.eas.projectId` to `app.json`), then set the `EXPO_PUBLIC_SUPABASE_*` variables (commands in `mobile/README.md`).
- [ ] **Over-the-air updates:** after `init`, run `npx eas-cli@latest update:configure`. It installs `expo-updates` and sets `updates.url` and `runtimeVersion`, so fixes can ship without a store review.
- [ ] **Crash reporting:** create a Sentry project, then run `npx @sentry/wizard@latest -i reactNative` in `mobile/`. Add `SENTRY_AUTH_TOKEN` to the EAS `production` environment (sensitive) so source maps upload with each build.

## 3. Store paperwork

- [ ] A privacy policy at a public URL (the in-app text is in `mobile/src/constants/legal.ts`).
- [ ] Apple privacy labels and Google Play data safety: account data (email, name, optional age and gender), health data (check-ins, treatments, appointments), photos and camera (profile picture), notifications.
- [ ] Screenshots and descriptions; the app supports iPad (`supportsTablet: true`), so App Store review will open it on one.

## 4. Live database

Checked on 2026-10-31 with the public (anon) key, read-only: anonymous visitors get no rows from any personal table (journey, reports, self-checks, habits, bookmarks, votes), can't read `user_id` on `questions` or `answers`, and the public views hide authors of anonymous posts.

Still to check in the Supabase dashboard (these tables and functions aren't in the repo's SQL, so their rules can't be read here):

- [ ] `questions` and `answers`: only the author can edit or delete their own rows.
- [ ] `cancer_types`, `resources`, `self_check_guides`, `prevention_tips`: read-only for the app (no insert, update or delete for `anon` or `authenticated`).
- [ ] The vote and answer-count functions (`increment_question_upvotes` and the rest): who can call them. If any user can call them directly, counts can be inflated; they should only change through a vote row.
- [ ] The profile-picture storage bucket: each user can only write their own file.
- [ ] Remove test posts from Community and test accounts.

## 5. Device tests (a person with real phones)

Use a throwaway account. One iPhone, one current Android and one older Android (10 or 11), and an iPad.

- [ ] Sign up, log in, log out, forgot password, delete account.
- [ ] Save, edit and delete: a check-in, an appointment, a treatment, a question and an answer; edit profile and photo; change password.
- [ ] "What brings you here?" and "Which cancer?"; Learn › Cancers shows "For you" and "Your cancer".
- [ ] Reminders fire with the app closed and after a reboot; tapping one opens the right screen.
- [ ] Airplane mode: every tab shows an error or saved data, never a blank screen.
- [ ] Light mode, dark mode, the largest text size, and VoiceOver / TalkBack on Today, Learn and the check-in.
- [ ] Android back button; iPad layout.
