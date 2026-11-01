# Phase 21 — Questions about a cancer

**Goal:** Community questions can name the cancer they're about, so each cancer page shows its questions and the Community filter from Phase 20 uses a real tag instead of matching words.

**Branch:** `design/phase-21`

## Changes

| Where | Change |
|---|---|
| Database | `questions.cancer_type_id`, optional, pointing at `cancer_types` (cleared if a cancer is deleted), with an index. `questions_public` and the column grants include it. Migration `20261102000000_question_cancer.sql`, run on 2026-11-01. |
| Ask a question | A "Which cancer?" row under Topic. It starts on the cancer page it was opened from, else the person's own cancer, else "Not about one cancer". |
| Community | The cancer chip shows questions tagged with that cancer, plus older untagged ones that mention its name. |
| Cancer pages | "Questions about [cancer]": the three newest, then "Ask about [cancer]" (it opens the form with the cancer chosen). Guests see "Sign in to ask a question". |

The filter is `QuestionFilters.cancer` in `src/api/community.ts`; `questionFromRow` reads the tag (tested).

## Not done

- Older questions aren't tagged; they still match by name. Tagging them would mean guessing.
- A question's own page doesn't show its cancer yet.

## Done when

- [x] Lint, typecheck and tests pass.
- [x] The migration is live: the column and the breast cancer filter answer through the public key.
- [x] Web, as a guest at phone width: the breast cancer page lists its question with "Sign in to ask a question", and Community's breast cancer chip shows it.
- [ ] Posting a question with a cancer, signed in on a device (not tried here: it writes to the live database).
