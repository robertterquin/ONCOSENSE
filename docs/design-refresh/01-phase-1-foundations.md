# Phase 1 — Foundations

**Goal:** the pieces every screen needs: the new icon family, the tab bar, the launch screen and a few shared parts.
**Effort:** 3–4 days. **Branch:** `design/phase-1`.

## 1.1 Icons — Hugeicons

- [x] `npm install @hugeicons/react-native @hugeicons/core-free-icons` (peers: React Native and `react-native-svg`, already installed).
- [x] Rewrite `src/components/ui/Icon.tsx` to draw from Hugeicons, keeping the same `IconName` keys so no screen changes. Default stroke 1.8. Each icon is imported from its own path (`@hugeicons/core-free-icons/Home01Icon`): Metro doesn't drop unused exports, and the package has about 4,600 icons.
- [x] Map every current name (51) to a Hugeicons icon.
- [x] Add new names: `ribbon`, `lungs`, `stethoscope`, `hospital`, and five mood faces `mood-rough` … `mood-great` (`unhappy`, `sad-01`, `neutral`, `smile`, `happy`). Medicine is the existing `pill`; skin uses `sun`.
- [x] Remove `lucide-react-native`; update the credits in `src/constants/legal.ts`.
- [x] Check the dev component gallery (`/dev/components`) shows every icon. *(Web, light, 2026-10-25.)*

## 1.2 Tab bar B

- [x] Light floating dock: `surface` background, `border` outline, `radii.panel` corners; every tab shows its icon and name; the open tab gets a `raised` pill and a bold `action` label. *(Built 2026-10-25, checked on web light and dark.)*
- [x] Check on the iOS Simulator. *(iPhone 17 Pro, light, 2026-10-25.)*
- [ ] Check at Larger text ("Community" must not be cut).
- [ ] Commit.

## 1.3 Launch screen

- [x] `assets/images/splash.png`: the ribbon (`#7B63D6` with a `#B4A3F5` highlight) on night violet `#2E1F66`; `app.json` splash background `#2E1F66`, so launch flows into Welcome. *(Built 2026-10-25.)*
- [x] Check on the iOS Simulator that the image blends with the background (no visible square). *(2026-10-25. The first image had a white box from the SVG-to-PNG step; the background is now drawn into the image.)*
- [ ] App icon and favicon still use the old pink `logo.png`; decide whether they change too (a separate store-listing decision).

## 1.4 Shared parts

New components in `src/components/ui/`, each in the "Tags and tiles" section of `/dev/components`, with accessibility labels:

- [x] **`Tag`** (`Tag.tsx`) — a small rounded label for states: Due (rose), Done (teal, with a check icon), Next (violet). Text always says the state.
- [x] **`StatTile`** (`Tiles.tsx`) — label, big number in Nunito, one-line trend ("up from 5", "steady"), read as one sentence. For Journey's energy and pain.
- [x] **`TopicTile`** (`Tiles.tsx`) — icon well (any section tint), title, one line, for two-column grids (Learn's cancer types).
- [x] **Call button** — not a new component: the existing `IconButton` with `look="help"` is already a round teal call button.
- [x] Section tints: `roseTint`, `helpTint`, `sun` and `raised` cover every well and tag; every pair used is already in `palette.test.ts`.

## Done when

- [ ] Every screen renders with Hugeicons and nothing imports Lucide.
- [ ] Tab bar and launch screen checked on web and iOS, light and dark.
- [ ] The new components appear in `/dev/components` in both themes and at Larger text.
- [ ] Contrast tests pass.
