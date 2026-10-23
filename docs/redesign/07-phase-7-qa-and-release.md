# Phase 7 — QA, Accessibility and Release

**Goal:** remove what the redesign left behind, prove every screen matches the design and is accessible, and ship it.
**Effort:** 1 week. **Branch:** `redesign/phase-7`.

## 7.1 Cleanup

- [ ] Delete components no screen uses any more: `AppHeader`, `Card`, `SectionCard`, `PinkSwitch`, `MaterialIcon` (once every icon is Lucide), old home, forum, journey and profile parts.
- [ ] Remove Poppins, `@expo/vector-icons` and `expo-linear-gradient` if nothing imports them. Run `npx expo-doctor` and `expo export`.
- [ ] Update `docs/react-native-migration/parity-checklist.md` with a note that the redesign changed the scope, linking to this plan.

## 7.2 Design check

- [ ] Compare every screen with its artboard: light and dark; a small phone (iPhone SE, 375 px) and a large one; web at phone width.
- [ ] Every text size (Default, Large, Larger) plus the phone's largest system text: nothing clipped, overlapped or cut off; tab labels still fit.
- [ ] Contrast test passes; spot-check new screens with a contrast checker.

## 7.3 Accessibility

- [ ] VoiceOver (iPhone) and TalkBack (Android) pass on every tab and the check-in, self-check, ask and sign-up flows: labels, order, roles, selected and checked states, slider values.
- [ ] Every action is reachable with a switch or keyboard on web; visible focus.
- [ ] "Reduce motion" turns off the few transitions.
- [ ] "Listen instead" works on both platforms.

## 7.4 Tests

- [ ] Update the Maestro flows for the new labels and routes: guest tour (Today → Learn → guided self-check → Help → Community), and the signed-in flow (focus → check-in → appointment → share summary → ask → answer → helpful → Saved → theme → log out).
- [ ] Unit test coverage for all new stores and helpers; CI green.

## 7.5 Release

- [ ] Follow the migration [Phase 7 release steps](../react-native-migration/08-phase-7-qa-release.md) (EAS environments, builds, TestFlight and Play internal testing, staged rollout). The `news` function no longer needs deploying; revoke the old GNews key.
- [ ] New store screenshots from the redesigned screens; update the privacy and data-safety answers (no news provider; appointments added).
- [ ] Release notes: what changed, what was removed and why, how to find the new tabs.

## Done when

- [ ] Every artboard has a matching screen, checked in both themes and all text sizes.
- [ ] VoiceOver and TalkBack passes recorded in this doc with dates and devices.
- [ ] No unused components or packages remain; CI is green.
- [ ] The redesigned app is in internal testing on both stores.
