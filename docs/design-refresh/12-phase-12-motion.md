# Phase 12 — Motion

**Goal:** state changes ease instead of snapping, calmly and without bounce, and every one of them respects Reduce Motion.

**Branch:** `design/phase-12`

## Rules

- Tokens in `theme/motion.ts`: 150 ms presses, 250 ms controls and fades, 400 ms content and progress. One curve, `cubic-bezier(0.2, 0, 0, 1)`: a quick start that slows gently. No overshoot.
- Animate only position, size, opacity and colour.
- Reduce Motion: `useTransition` sets durations to 0; Reanimated layout animations skip themselves. Tabs keep their cross-fade, which Apple lists as the reduced-motion alternative.
- Nothing loops, spins, parallaxes or animates every time a screen opens.

Sources: Apple's [Reduce Motion criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria/) and [Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/); [Material 3 easing and duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs); healthcare motion guides ([co.vet](https://co.vet/brand/motion/), [Aleris](https://aleris-brand-os.vercel.app/baseline/reference/aleris-baseline-animation)).

## Tasks

- [x] 1. Press feedback: `PressableScale` eases to 97% (buttons, icon buttons, chips, tiles, tip cards, mood, Helpful) or dims (list rows).
- [x] 2. Switch: the thumb slides and grows; the track colour fades.
- [x] 3. Chips fade their colours; the segmented control's selection is one shape that glides.
- [x] 4. Content arriving: `Arrive` and `useArrival` fade the four tabs' content up 6 pt after their skeleton, only if a skeleton was shown.
- [x] 5. Expanding detail: the chart's day panel fades in and the chart slides down to make room.
- [x] 6. Tab change: 'fade'.
- [x] 7. Self-check steps: rows slide to new heights, the new step's detail fades in, markers and segments fill.
- [x] 8. Mood picker: the chosen tile's colour fades in.
- [x] 9. Save and done states: icon buttons, the habit pill and Helpful fade their fills.
- [x] 10. Lists: Section rows keep their own keys, fade out when removed, and the rest close the gap.
- [x] 11. Week thread: a knot's filled state fades in when a check-in is saved.
- [x] 12. Treatment cycles: `ProgressSegments` fill over 400 ms.
- [x] 13. Fields: the focus border fades; password-rule ticks fade in.
- [x] 14. Chart bars rise from the baseline when the chart first appears; height changes ease.

## Done when

- [x] Lint, typecheck and tests pass.
- [x] iOS: tabs, chart, segmented glide checked; web: switch checked.
- [ ] Reduce Motion turned on in the simulator (not done: it changes the simulator's accessibility settings).
- [ ] Detail screens (cancer, self-check, question) and Saved: content arrives without the fade; only the four tabs have it.
