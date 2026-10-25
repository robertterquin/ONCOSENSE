# Phase 5 — Community and Help

**Goal:** the Community Q&A with its guardrails, the Help tab, and the single Saved screen.
**Effort:** 1 week. **Branch:** `redesign/phase-5`.

Artboards: **Community**, **Question**, **Get help**, **Get help (dark)**.

## 5.1 Community — `/(tabs)/community`

- [x] Title and one-line description, search field, topic tabs: All, Symptoms, Diagnosis, Treatment (new), Mental Health, Lifestyle, Family Support.
- [x] Guard banner: "Share experiences, not diagnoses. Answers here are from members, not doctors."
- [x] Question rows: topic, title (bold, two lines max), answer count, "N found this helpful", relative time (refreshing every 10 seconds as today).
- [x] "Ask a question" floating button above the tab bar. Guests see a sign-in prompt instead of the composer.

## 5.2 Question — `/community/[id]`

- [x] Question header: topic, title, body, "Shared anonymously" or the name, time; Helpful toggle (the existing upvote), Save, More menu (Report).
- [x] Answers: initials avatar, name or "Anonymous", text, Helpful toggle, time; "Show N more answers".
- [x] Composer pinned at the bottom with a visible label, Post button and "Post anonymously" (default from `stores/communityStore.ts`, on unless changed; the Settings switch for it comes in Phase 6).
- [x] Reporting keeps the existing report dialog, restyled.

## 5.3 Ask — `/community/ask`

- [x] Topic (radio chips), title, details, "Post anonymously" (default on), guard reminder above the Post button.

## 5.4 Help — `/(tabs)/help`

- [x] **Feeling overwhelmed?** panel with the NCMH Crisis Hotline (0917-899-8727) as a full-width call button. The number lives in one constant with a test, so it can't be lost if the `resources` row changes.
- [x] **Near** filter: a static map from each resource's `location` to a region (Metro Manila, Central Luzon, Cebu, Davao, Nationwide, Online); "All of the Philippines" by default.
- [x] Sections: Hotlines, Screening centers, Help with costs, Support groups; each shows 3–4 rows and "Show N more".
- [x] Open at a section from a link (`/help?section=screening`): Learn's cancer type page and the self-check's "Noticed a change?" link there (they open Help at the top until then).
- [x] Each row: name, location and number, round call button (`tel:` link) with a full accessible label ("Call Philippine Cancer Society, (02) 8508-7777"); rows without a phone show their website instead.
- [x] Long-press or a More menu on a row: Save, Copy number. (A More button on each row; it also opens the website.)

## 5.5 Saved — `/profile/saved`

- [x] One screen with segments: Questions, Guides, Help contacts. Uses the existing question and resource bookmark tables; guide bookmarks are stored on the device (no schema change).
- [x] Empty states that point to where to find each kind of item.

## Done when

- [x] The four artboards match on web and the iOS Simulator, light and dark, at Default and Larger text. (Web: light, dark and Larger; iOS Simulator: light, with Copy number and the guest report prompt.)
- [x] Unit tests: region mapping, crisis line constant, question row formatting.
- [ ] With a test account: ask, answer, mark helpful (tap quickly on and off: the count stays right), save and report; a guest can read but not post.
- [ ] Every call button dials on a real phone.
- [x] Old Forum, Resources and saved-list screens and components are deleted.

## Notes from building it

- **Not tested with an account:** asking, answering, marking helpful, saving and reporting need a signed-in test account. As a guest I checked reading, the sign-in prompts (Ask, answer, Helpful, Report, Save) and the report sheet up to Send.
- **New topic "Treatment":** added to `FORUM_CATEGORIES`. If the `questions` table limits `category` to the old five (a CHECK constraint or enum), posting under Treatment will fail until the owner allows it. Check this in the test-account run.
- **Sorting:** the old Most recent / Trending / Unanswered chips are gone (the approved design lists topics only); the list is newest first.
- **Help:** the crisis line lives in `constants/crisis.ts` (tested). Regions come from `lib/help.ts`: a resource shows for its own region plus everything nationwide or online; unknown places show only under "All of the Philippines". Learn's two screening links open `/help?section=screening`; the tab scrolls there on every visit (`useFocusEffect`), which also fixed Learn's `?section=risk` on a repeat visit.
- **Saved:** questions and help contacts from the account; guides on the phone (`savedGuides` in `stores/selfCheckStore.ts`), with a Save button on the guided self-check.
- **Removed:** `ForumParts`, `ReportDialog` (now `ReportSheet`), `SavedItems`, `SavedList`, `BookmarkButton` and `SearchBar`.
- **New native module:** `expo-clipboard` for Copy number. Rebuild the development builds.
- **Follow-up:** the shared doctor summary PDF (Phase 4) has a random file name on iOS (`8854FFF9-….pdf`); renaming it to "OncoSense summary.pdf" before sharing needs `expo-file-system`.
