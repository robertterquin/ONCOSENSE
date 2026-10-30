# Phase 15 — Community and Help, iOS layout

**Goal:** questions and contacts start higher on the screen, and each tab has one obvious way to act and one way to search.

**Branch:** `design/phase-15`

## Rules

- Community: "Ask a question" is a + button in the title row, like compose in Mail. The "Have a question?" card and the guard banner are gone; "Answers come from members, not doctors. Share experiences, not diagnoses." sits as a footer under the list. Guests are still asked to sign in before asking.
- Help: a search field under the title filters every section by name, place, number or description (all typed words must match). While searching, every match shows and empty sections step aside. The crisis card stays visible during a search, so the crisis line is always one tap away.
- Help rows: the number on its own line, the place only when it narrows things down ("Philippines" is left out). The call button and the More menu stay.

## Tasks

- [x] 1. Community: + button in `titleAside`, footer line, the prompt card and banner removed.
- [x] 2. Help: `SearchField`, `matchesResource` in `lib/help.ts` (with a test), the empty state for no matches, and the search button removed from the title row (global search stays on Today).
- [x] 3. `ResourceRow`: nationwide contacts drop the place line.

## Done when

- [x] Lint, typecheck and tests pass.
- [x] iOS (dark): Community, Help and Help search checked.
- [ ] Light mode on the device; a guest tapping + (the sign-in prompt).
