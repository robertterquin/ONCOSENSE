# Phase 3 — Learn

**Goal:** self-checks show at a glance what's due, and cancer types are quick to scan.
**Effort:** 2–3 days. **Branch:** `design/phase-3`.

## 3.1 Check yourself

- [x] Self-check rows get a rose icon well (`iconForCancer`: skin sun, oral tooth, others the ribbon) and a `Tag` under the subtitle: the due label in rose, or "Done <date>" in teal. *(Tags sit under the text, not beside the title: beside it, Larger text squeezed titles to one word per line.)*
- [x] Order: soonest due first, in both "your" guides and the rest.

## 3.2 Know the signs

- [x] Cancer types become a two-column grid of `TopicTile`s: icon, name, and "N early signs" from the data. (Every type has a self-check, so "Has a self-check" said nothing.)
- [x] Map cancer types to Hugeicons in `iconForCancer` (`lib/learn.ts`, tested): lung, liver, leukemia (blood), skin (sun), oral (tooth). Hugeicons has no breast, colorectal, cervical, prostate, stomach or ovary icon, so those use the ribbon rather than a misleading generic icon.
- [x] At Larger text the grid drops to one column.

## 3.3 Lower your risk and search

- [x] Tips keep their chips and detail sheet. *(Unchanged: chips have no icon wells.)*
- [x] Search field unchanged apart from the icon.

## 3.4 Detail screens

- [x] Cancer detail: the self-check row uses the cancer's icon. Guided self-check: "Step 1 of 5" plus a `Tag` (rose when due, violet otherwise).

## Done when

- [ ] Learn, a cancer detail and a self-check guide match the concept on web and iOS, light and dark, at Default and Larger text.
- [x] Every cancer type has an icon; the mapping test passes.
