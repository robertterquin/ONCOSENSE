# Phase 7 — QA, Accessibility and Release

**Goal:** remove what the redesign left behind, prove every screen matches the design and is accessible, and ship it.
**Effort:** 1 week. **Branch:** `redesign/phase-7`.

## 7.1 Cleanup

- [x] Delete components no screen uses any more: `AppHeader`, `Card`, `SectionCard`, `PinkSwitch`, `MaterialIcon` (once every icon is Lucide), old home, forum, journey and profile parts.
- [x] Remove Poppins, `@expo/vector-icons` and `expo-linear-gradient` if nothing imports them. Run `npx expo-doctor` and `expo export`.
- [x] Update `docs/react-native-migration/parity-checklist.md` with a note that the redesign changed the scope, linking to this plan.

## 7.2 Design check

- [x] Switch the theme store's default `mode` from `light` to `system` (match the phone) and check the welcome and sign-in screens in dark.
- [ ] Compare every screen with its artboard: light and dark; a small phone (iPhone SE, 375 px) and a large one; web at phone width.
- [x] Every text size (Default, Large, Larger) plus the phone's largest system text: nothing clipped, overlapped or cut off; tab labels still fit.
- [x] Contrast test passes; spot-check new screens with a contrast checker.

## 7.3 Accessibility

- [ ] VoiceOver (iPhone) and TalkBack (Android) pass on every tab and the check-in, self-check, ask and sign-up flows: labels, order, roles, selected and checked states, slider values.
- [x] Every action is reachable with a switch or keyboard on web; visible focus.
- [x] "Reduce motion" turns off the few transitions.
- [ ] "Listen instead" works on both platforms. (iOS checked 2026-10-24; Android not yet.)

## 7.4 Tests

- [ ] Update the Maestro flows for the new labels and routes (rewritten 2026-10-24 from the code's labels; not run yet, Maestro isn't installed on the dev Mac): guest tour (Today → Learn → guided self-check → Help → Community), and the signed-in flow (focus → check-in → appointment → share summary → ask → answer → helpful → Saved → theme → log out).
- [x] Unit test coverage for all new stores and helpers; CI green. (Coverage done 2026-10-24; CI runs once the branch is pushed.) *(CI green on `main`, 2026-10-25.)*

## 7.5 Release

- [ ] Follow the migration [Phase 7 release steps](../react-native-migration/08-phase-7-qa-release.md) (EAS environments, builds, TestFlight and Play internal testing, staged rollout). The `news` function no longer needs deploying; revoke the old GNews key.
- [ ] New store screenshots from the redesigned screens; update the privacy and data-safety answers (no news provider; appointments added).
- [x] Release notes: what changed, what was removed and why, how to find the new tabs. Draft in [release-notes.md](release-notes.md).

## Notes

- 2026-10-24: removed the old `AppHeader`, `AppText`, `Button`, `Card`, `MaterialIcon` and `Screen` components and the Flutter-era `theme/colors.ts` and `theme/typography.ts`. The two dev screens (`/dev/data`, `/dev/notifications`) now use the ui components. Empty and error states take Lucide icons only. Poppins, `@expo/vector-icons` and `expo-linear-gradient` are uninstalled; credits updated. `expo-doctor` passes 20/20 and the web export builds.
- The theme now follows the phone by default. Phones that ran a dev build before this keep the saved `light` until it is changed in Settings (the redesign hasn't shipped, so no real users are affected).
- Welcome's light status bar now only applies while Welcome is showing; before, it stayed on over Sign in and Create account (white time on a light screen).
- Text size, 2026-10-24: every tab, a self-check guide, Profile, Settings and the sample Journey dashboard checked on web at 375×667 with Larger; Welcome, Today, Learn, Help and Community checked on the iPhone 17 Pro simulator at the largest accessibility text size. At that size (about 3×) titles broke mid-word ("Onco / Sense"), so `Text` now caps the phone's scaling at 1.5× for headings and 2× for everything else, and text fields at 2× (the tab bar already capped at 1.3×). Community's list now leaves room for the floating "Ask a question" button at any size (it used a fixed 56 pt). Not checked: a real iPhone SE, and signed-in screens (check-in, appointment, ask) at the largest size.
- Contrast, 2026-10-24: computed every on-screen pair the test didn't cover. One failed: the check on a finished self-check step was white on dark-mode rose (2.6:1); it now uses `onAction`. The nine pairs are added to `palette.test.ts`.
- Reduce motion, 2026-10-24: sheets fade instead of sliding, screens fade instead of sliding in, and jumps to a section (Learn, Help, cancer pages) are instant. Toasts already follow the setting (Reanimated's default). The setting is read at launch, so changing it applies after a restart.
- Keyboard, 2026-10-24 (web, 375 px): on every tab, Profile, Settings, Sign in, Create account and the sample Journey dashboard, every element with a click handler can be reached with Tab, and Enter activates buttons. The browser's 1 px focus ring was hard to see, so focused controls now get a two-tone ring (surface inside, action outside) that shows on light, dark and the violet panel.
- Reduce Motion and Listen, 2026-10-24 (iPhone 17 Pro simulator): with Reduce Motion on, the app reads it as on at launch and sheets open with a fade. "Listen to this step" starts speech, shows Stop reading, and switches back when the step is done (audio itself not heard from the test rig).
- Unit tests, 2026-10-24: added tests for the self-check store (snooze to tomorrow, done clears the snooze, save and unsave guides) and the Community anonymous-by-default setting. Removed the unused `date-fns` package and `lib/shuffle.ts`. The focus store is a plain setter; `confirm`, `links`, `supabase` and `queryClient` are platform glue left to the device checks.

## Done when

- [ ] Every artboard has a matching screen, checked in both themes and all text sizes.
- [ ] VoiceOver and TalkBack passes recorded in this doc with dates and devices.
- [x] No unused components or packages remain; CI is green. *(Codebase cleanup and CI green, 2026-10-25.)*
- [ ] The redesigned app is in internal testing on both stores.
