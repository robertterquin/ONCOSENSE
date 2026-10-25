# Phase 6 — Account screens, QA and release

**Goal:** the rest of the app catches up, everything is checked, and the refresh ships with the redesign.
**Effort:** 3–4 days. **Branch:** `design/phase-6`.

## 6.1 Remaining screens

- [ ] Welcome, Sign in, Create account, Forgot password, focus choice: icons swapped, no other changes.
- [ ] Profile, Saved, Settings, edit profile, password, legal sheets: icon wells use the section tints (reminders: sun; account and privacy: lavender; delete account: danger).
- [ ] Empty and error states: Hugeicons only.

## 6.2 Checks

- [ ] Every screen in light and dark, at Default, Large and Larger text, on web at 375 px and the iOS Simulator.
- [ ] Contrast test covers every new pair; spot-check the teal crisis card and the tags with a contrast checker.
- [ ] Reduce Motion: the thread doesn't animate.
- [ ] VoiceOver pass on Today, Learn, Journey and Help (TalkBack when an Android build exists).
- [ ] No Lucide import, no unused component, CI green.

## 6.3 Release

- [ ] New store screenshots from the refreshed screens (replaces the redesign's screenshot task).
- [ ] Release notes: add a short "A warmer look" section to `docs/redesign/release-notes.md`.
- [ ] Ships in the same release as the redesign (see the redesign's Phase 7).

## Done when

- [ ] Every item above is checked, with dates and devices noted here.
- [ ] The status table in this plan's README says Done for all phases.
