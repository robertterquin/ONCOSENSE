# Phase 18 — iOS forms, controls and inner pages

**Goal:** the screens inside the tabs follow iOS conventions like the tabs already do. Forms slide up as sheets, fields sit in grouped cards, and the controls look like iOS controls. This covers Phases 18–20 from the audit, built together.

**Branch:** `design/phase-18`

Each choice below was picked from three drafts based on Apple Health, Bearable, Headspace, Seven, Streaks and Dribbble health apps.

## Forms as sheets (option B: grouped, labels kept)

| Screen | Change |
|---|---|
| Daily check-in, New appointment, New treatment, Ask a question, Edit profile, Change password | Opened as iOS sheets (`presentation: 'modal'` in the root stack). Cancel is top left and Save/Post/Done top right, and swiping down cancels. `Screen` takes a `sheet` prop for this bar. |
| All of them | Fields sit in grouped cards (`TextField grouped`). The label stays above in small type, so the field's name doesn't disappear once you type, which matters for older eyes. |
| New appointment | Today / Tomorrow / Next week buttons, then Date and Time rows with their values in pills (`DateRow`). |
| Treatment type, question topic, gender, linked treatment | A row that opens a checkmark list (`PickerRow`) replaces the long chip lists. |
| Side effects (treatment) | Kept as chips: you pick several at once, and they're quicker to scan. |
| Delete appointment, treatment, check-in | A red row in its own group, like Log out. |
| Change password | No longer asks for the email (the signed-in one is used). |
| Edit profile | "Edit photo" under the avatar. On iOS it opens the system action sheet with "Remove photo" in red. Email is a read-only field. |
| Ask a question | The guard banner became a footnote under the form. |

## Daily check-in (option B: mood first, details fold open)

Only the mood is needed. Pain and energy, sleep, symptoms and the note sit in an "Add more" group. Each row shows its current answer and opens in place, so a hard day takes one tap and Save. When you edit an older check-in, the symptoms and note rows start open if they have something in them. The big "Save check-in" button stays at the bottom, within thumb reach, as well as Save at the top.

## Controls

| Control | Change |
|---|---|
| Segmented control | iOS filled track with a raised thumb; the violet outline is gone. |
| Search field | Slim, filled and borderless, 44 pt tall. |
| "What brings you here?" (option C) | Icon cards; the chosen one fills in with a check. The empty radio circles are gone. |
| Settings | "Theme" is "Appearance", and "Phone" is "Auto". |

## Inner pages

| Change | Where |
|---|---|
| The page's title fades into the top bar once you scroll, with a hairline under it | Every inner page with a back link. The cancer and question pages pass `navTitle` |
| Habits (option C): a "Today's habits" progress ring, then Reminders-style rows. Tap the circle to mark done (again to undo); tap the row for the guide | Learn › Habits, Search |

## Not done

- "Back" labels on the self-check guide, Focus and Search stay generic, because those screens open from several places.

## Done when

- [x] Lint, typecheck and tests pass.
- [x] iOS (dark): the six sheets, the topic picker, Learn (Checks and Habits), Settings, Focus.
- [ ] Light mode, larger text, high-contrast mode and Android.
- [ ] Saving each form on a device: not tried here, since it writes to the live database.
