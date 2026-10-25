# Phase 3 — Learn

**Goal:** self-checks show at a glance what's due, and cancer types are quick to scan.
**Effort:** 2–3 days. **Branch:** `design/phase-3`.

## 3.1 Check yourself

- [ ] Self-check rows get a rose icon well (skin: sun, breast: heart, and so on) and a `Tag`: "Due" (rose) or "Done" with the date (teal check).
- [ ] Order: due first, then the rest by how soon they're due.

## 3.2 Know the signs

- [ ] Cancer types become a two-column grid of `TopicTile`s: icon, name, one short line from the data (no invented blurbs).
- [ ] Map each of the 10 cancer types to a Hugeicons icon (ribbon, lungs, stethoscope, hospital, …); fall back to the ribbon. Keep the mapping in one place with a test.
- [ ] At Larger text the grid drops to one column if a name would wrap more than twice.

## 3.3 Lower your risk and search

- [ ] Tips keep their list; icon wells use the sun tint.
- [ ] Search field unchanged apart from the icon.

## 3.4 Detail screens

- [ ] Cancer detail and guided self-check: swap icons, use `Tag` for "Due", check the step progress matches Today's.

## Done when

- [ ] Learn, a cancer detail and a self-check guide match the concept on web and iOS, light and dark, at Default and Larger text.
- [ ] Every cancer type has an icon; the mapping test passes.
