# Phase 5 — Community and Help

**Goal:** the Community Q&A with its guardrails, the Help tab, and the single Saved screen.
**Effort:** 1 week. **Branch:** `redesign/phase-5`.

Artboards: **Community**, **Question**, **Get help**, **Get help (dark)**.

## 5.1 Community — `/(tabs)/community`

- [ ] Title and one-line description, search field, topic tabs: All, Symptoms, Diagnosis, Treatment (new), Mental Health, Lifestyle, Family Support.
- [ ] Guard banner: "Share experiences, not diagnoses. Answers here are from members, not doctors."
- [ ] Question rows: topic, title (bold, two lines max), answer count, "N found this helpful", relative time (refreshing every 10 seconds as today).
- [ ] "Ask a question" floating button above the tab bar. Guests see a sign-in prompt instead of the composer.

## 5.2 Question — `/community/[id]`

- [ ] Question header: topic, title, body, "Shared anonymously" or the name, time; Helpful toggle (the existing upvote), Save, More menu (Report).
- [ ] Answers: initials avatar, name or "Anonymous", text, Helpful toggle, time; "Show N more answers".
- [ ] Composer pinned at the bottom with a visible label, Post button and "Post anonymously" (default from Settings).
- [ ] Reporting keeps the existing report dialog, restyled.

## 5.3 Ask — `/community/ask`

- [ ] Topic (radio chips), title, details, "Post anonymously" (default on), guard reminder above the Post button.

## 5.4 Help — `/(tabs)/help`

- [ ] **Feeling overwhelmed?** panel with the NCMH Crisis Hotline (0917-899-8727) as a full-width call button. The number lives in one constant with a test, so it can't be lost if the `resources` row changes.
- [ ] **Near** filter: a static map from each resource's `location` to a region (Metro Manila, Central Luzon, Cebu, Davao, Nationwide, Online); "All of the Philippines" by default.
- [ ] Sections: Hotlines, Screening centers, Help with costs, Support groups; each shows 3–4 rows and "Show N more".
- [ ] Open at a section from a link (`/help?section=screening`): Learn's cancer type page and the self-check's "Noticed a change?" link there (they open Help at the top until then).
- [ ] Each row: name, location and number, round call button (`tel:` link) with a full accessible label ("Call Philippine Cancer Society, (02) 8508-7777"); rows without a phone show their website instead.
- [ ] Long-press or a More menu on a row: Save, Copy number.

## 5.5 Saved — `/profile/saved`

- [ ] One screen with segments: Questions, Guides, Help contacts. Uses the existing question and resource bookmark tables; guide bookmarks are stored on the device (no schema change).
- [ ] Empty states that point to where to find each kind of item.

## Done when

- [ ] The four artboards match on web and the iOS Simulator, light and dark, at Default and Larger text.
- [ ] Unit tests: region mapping, crisis line constant, question row formatting.
- [ ] With a test account: ask, answer, mark helpful, save and report; a guest can read but not post.
- [ ] Every call button dials on a real phone.
- [ ] Old Forum, Resources and saved-list screens and components are deleted.
