# Phase 20 — Your cancer, everywhere

**Goal:** the answer to "Which cancer?" shapes more than Learn, and cancer pages point to people as well as facts.

**Branch:** `design/phase-20`

## Changes

| Where | Change |
|---|---|
| Journey (dashboard) | The subtitle starts with the cancer: "Breast cancer · In treatment since July 2026". |
| Community | Opens on a chip named after the person's cancer, showing questions that mention it. All and the topics are one tap away; searching or picking a topic turns the cancer filter off. With nothing found it says "No questions about breast cancer yet" and points to All. |
| Cancer pages | "Talk to people who've been there": support groups from Help, each with its call button and menu. Groups about one cancer only show on that cancer's page (a breast cancer group isn't shown for prostate); groups about no one cancer show everywhere. |

`useMyCancer()` (`src/hooks/useCancerInfo.ts`) returns the chosen cancer. `cancerKeyword` and `supportGroupsFor` are in `src/lib/help.ts`, with tests.

## Not done

- Community matches the cancer's name in a question's words (`shortcut:` in the code). Phase 21 adds a cancer tag to questions and switches the filter to it.
- Kythe Foundation (children with cancer) shows on every page, since its description names no cancer.

## Done when

- [x] Lint, typecheck and tests pass.
- [x] Web, as a guest with "Going through treatment" and breast cancer at phone width: the Community chip and filter, the Your cancer card, and the support groups on the breast cancer page.
- [ ] The Journey subtitle on a signed-in device (guests don't have the dashboard), iOS, light mode and larger text.
- Once, the first time Community opened right after "Which cancer?" closed, the list stayed blank; it didn't happen again on a fresh start. Watch for it on a device.
