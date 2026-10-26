# Phase 5 — Community and Help

**Goal:** Help can't be missed in a hard moment, and Community feels like part of the same app.
**Effort:** 2–3 days. **Branch:** `design/phase-5`.

## 5.1 Help

- [x] The crisis card fills with `help` (teal) instead of a tinted card: `surface` text and an `onHelp` button (`surface` with `help` text). Both pairs were already in `palette.test.ts`. In dark mode `help` is a bright teal with dark text.
- [x] Every contact row already ends in a round teal call button (`IconButton look="help"`). The More button stays: a long press is hard to find and doesn't work well with screen readers.
- [x] Region chips: the selected chip uses the teal tint and border (`Chip tone="help"`), so Help's color carries through.
- [x] Phone numbers and names come only from the `resources` data, as now.

## 5.2 Community

- [x] Topic chips, question rows and the "Ask a question" button get the new icons; topic labels stay violet. *(Through Phase 1's `Icon`.)*
- [x] The "members, not doctors" banner keeps the shield on its lavender background. *(Unchanged: a well on the same lavender added nothing.)*
- [x] Question detail: "Found this helpful" and save use the new icons; counts unchanged. *(Through Phase 1's `Icon`.)*

## Done when

- [ ] Help and Community match the concept on web and iOS, light and dark, at Default and Larger text.
- [ ] Every call button dials on a real phone (carried over from the redesign checklist).
- [ ] VoiceOver: each call button reads "Call Philippine Cancer Society" (the row's name), not just "Call".
