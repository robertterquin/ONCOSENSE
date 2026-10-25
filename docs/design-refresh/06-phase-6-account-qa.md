# Phase 6 — Account screens, QA and release

**Goal:** the rest of the app catches up, everything is checked, and the refresh ships with the redesign.
**Effort:** 3–4 days. **Branch:** `design/phase-6`.

## 6.1 Remaining screens

- [x] Welcome, Sign in, Create account, Forgot password, focus choice: icons swapped, no other changes. *(Through Phase 1's `Icon`.)*
- [x] Profile, Saved, Settings, edit profile, password, legal sheets: icon wells use the section tints (reminders: sun; account and privacy: lavender; delete account: danger). New `danger` tile tone (`danger` on `roseTint`).
- [x] Empty and error states: Hugeicons only. The unused `emoji` field in `constants/awareness.ts` is gone.

## 6.2 Checks

- [ ] Every screen in light and dark, at Default, Large and Larger text, on web at 375 px and the iOS Simulator. *(2026-10-25: account screens on web at 390 px, light and dark, Default and Larger; Profile and Settings on iOS (iPhone 17 Pro, dark). Larger text truncated segmented-control labels ("Questi…"); they now wrap. Large text not swept.)*
- [ ] Contrast test covers every new pair; spot-check the teal crisis card and the tags with a contrast checker. *(Test covers every pair, including `danger`/`roseTint`; the manual spot-check is left.)*
- [x] Reduce Motion: the thread doesn't animate. *(The draw-in animation was skipped, so nothing animates.)*
- [ ] VoiceOver pass on Today, Learn, Journey and Help (TalkBack when an Android build exists).
- [ ] No Lucide import, no unused component, CI green. *(No Lucide in `src` or `package.json`; lint, typecheck and 185 tests pass locally; CI runs after the push.)*

## 6.3 Release

- [ ] New store screenshots from the refreshed screens (replaces the redesign's screenshot task).
- [x] Release notes: add a short "A warmer look" section to `docs/redesign/release-notes.md`.
- [ ] Ships in the same release as the redesign (see the redesign's Phase 7).

## Done when

- [ ] Every item above is checked, with dates and devices noted here.
- [ ] The status table in this plan's README says Done for all phases.
