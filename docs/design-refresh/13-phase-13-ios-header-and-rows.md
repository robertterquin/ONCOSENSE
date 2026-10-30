# Phase 13 — iOS header and rows

**Goal:** every tab opens the same way, like an iOS app: a large title with its buttons on the same line, a small title bar once you scroll, and list rows that show status at the right edge instead of an extra line.

**Branch:** `design/phase-13`

## Rules

- Tab header: large title on the left; `titleAside` on the right (search where a tab has no search field of its own, then the profile button). No icon tile, since the tab bar already shows the icon. A subtitle only when it carries information (Journey's "In treatment since…").
- Titles match the tab names: Today, Learn, Journey, Community, Help.
- Compact bar: once the large title scrolls past 56 pt, a small centered title fades in over a bar in the page colour with a hairline, which also keeps content off the status bar.
- Row status: `ListRow`'s `status` puts a teal check (done) or a small "Due" tag at the right edge, read with the row by VoiceOver.

Sources: Apple's HIG on [navigation bars](https://developer-mdn.apple.com/design/human-interface-guidelines/components/navigation-and-search/navigation-bars) (large titles that become standard titles on scroll); Apple Health's Summary layout.

## Tasks

- [x] 1. `Screen`: the `tab` prop gives the iOS header and compact bar; the icon tile is gone.
- [x] 2. `ProfileButton` moves to `components/account` and reads the user itself, so every tab can show it.
- [x] 3. `ListRow`: `status` slot for done and due.
- [x] 4. Learn: self-check rows lose the tag line; status sits at the right edge. The duplicate search button is removed (the search field stays).
- [x] 5. Today, Learn, Journey, Community and Help use the shared header; "Get help" becomes "Help" and "My journey" becomes "Journey".

## Done when

- [x] Lint, typecheck and tests pass.
- [x] iOS (dark): all five tabs and the compact bar on Community checked.
- [ ] Light and high-contrast modes on the device (the app's own Display setting is set to dark).
