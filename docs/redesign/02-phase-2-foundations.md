# Phase 2 — Design Foundations

**Goal:** the new design system in code: tokens, type, theme modes, text size, icons and the shared components every screen will use. Screens are restyled from Phase 3 on.
**Effort:** 1 week. **Branch:** `redesign/phase-2`.

Source: the **Foundations** artboard and the colors used across the canvas.

## 2.1 Packages

- [ ] `npx expo install @expo-google-fonts/atkinson-hyperlegible-next react-native-svg` and `npm install lucide-react-native` (check its `react-native-svg` peer range against what Expo installs first).
- [ ] Load Atkinson Hyperlegible Next 400, 600 and 800 at startup in place of Poppins. Remove Poppins in Phase 7, once no screen uses it.

## 2.2 Tokens — `src/theme/`

- [ ] **Colors**, light and dark, with semantic names:

  | Token | Light | Dark | Use |
  |---|---|---|---|
  | `ground` | `#F6F4FA` | `#15111F` | Screen background |
  | `surface` | `#FFFFFF` | `#1F1930` | Sections, sheets, tab bar |
  | `raised` | `#ECE7F8` | `#2A2340` | Selected, tips, icon tiles |
  | `ink` | `#221A36` | `#EDE9F7` | Text |
  | `muted` | `#5D5672` | `#A9A1BF` | Secondary text |
  | `line` | `#ECE7F8` | `#2A2340` | Dividers |
  | `border` | `#D8D1EA` | `#3A3152` | Inputs, chips, secondary buttons |
  | `action` / `onAction` | `#5236B5` / `#FFFFFF` | `#B4A3F5` / `#15111F` | Primary buttons, links, active tab |
  | `panel` / `onPanel` | `#2E1F66` / `#FFFFFF` | `#352578` / `#FFFFFF` | Next-step panel, welcome |
  | `rose` / `roseTint` | `#C2255C` / `#FBE8EF` | `#F27BA6` / `#3A1A2A` | Self-checks |
  | `help` / `helpTint` | `#0E6B63` / `#E1F2EF` | `#6FD3C5` / `#0F3D39` | Help, calling |
  | `sun` / `sunInk` | `#FDF1D6` / `#8A5A00` | `#3A2E12` / `#F5BE4A` | Milestones |
  | `chartPain` | `#DB5A88` | `#F27BA6` | Pain bars (3:1 on surface) |

- [ ] **Type scale** (px at Default text size): title 32/800, detail title 34/800, section 21–23/800, reading 18/400 line-height 1.55, row 17/600, body 17/400, supporting 15/400, caption 13–14. Letter-spacing −0.01em on titles.
- [ ] **Spacing** 4-based; **radii** by hierarchy: panel 28, section 20, row tile 14, button 16, chip and pill fully round.
- [ ] **Contrast test:** a unit test that computes every foreground/background pair above and fails under 4.5:1 for text or 3:1 for chart and control marks.

## 2.3 Theme mode and text size

- [ ] Theme store: `mode: 'light' | 'dark' | 'system'` (default `system`, using `useColorScheme`). Migrate the old `isDarkMode` boolean (true → `dark`, false → `light`).
- [ ] Text-size store: `default | large | larger` → scale 1, 1.15, 1.3, applied by `AppText` and every component that sets a font size. OS font scaling stays on; cap tab labels at 1.3× so they still fit.

## 2.4 Components — `src/components/ui/`

Build each with light and dark, every text size, and real accessibility roles and labels.

- [ ] `Icon` (Lucide wrapper with a small name map) and `RibbonMark` (the single-stroke ribbon, sizes and colors).
- [ ] `Screen` (large title, optional subtitle, back link, right actions, scroll, pull to refresh, tab bar clearance) — replaces the gradient `AppHeader`.
- [ ] `Section` (title, subtitle, white rounded container), `ListRow` (leading icon tile, title, subtitle, trailing text or accessory, chevron; works as a link or button), `Divider`.
- [ ] `Button` variants: primary, secondary, quiet, help (call), destructive; loading and disabled states; full width or inline.
- [ ] `Chip` (toggle and radio), `SegmentedControl`, `Switch` (on and off differ in shape as well as color; replaces `PinkSwitch`), `Slider` row with value label.
- [ ] `TextField` (visible label, error, password show/hide), `SearchField`, `TextArea`.
- [ ] `Banner` (guard and info), `NextStepPanel` (night violet, ribbon, title, body, primary and quiet actions), `ProgressSegments`, `StepList`.
- [ ] `TabBar` (custom, 5 items, active pill) and `BottomActionBar` (sticky actions above the home indicator).
- [ ] Restyle `EmptyState`, `ErrorState`, `LoadingState` and `Toast` with the new tokens.
- [ ] Rebuild `/dev/components` as a gallery of all of the above, with a light/dark and text-size switcher.

## Done when

- [ ] The gallery matches the Foundations artboard in light and dark, on web and the iOS Simulator.
- [ ] Contrast test, lint, typecheck and tests pass.
- [ ] At "Larger" text size nothing in the gallery clips or overlaps at 375 px width.
- [ ] Existing screens still work (they keep the old components until their phase).
