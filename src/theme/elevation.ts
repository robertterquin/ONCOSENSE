import type { ViewStyle } from 'react-native';

import { contrastRatio } from './contrast';
import type { Palette } from './palette';

// How far a container sits above the page (docs/redesign/README.md, 2026-10-29).
// Like iOS grouped lists, a card that's a clear step off the page stands out by tone alone
// and drops its outline; one that isn't (high-contrast themes, pale tints on a light page)
// keeps a `border` edge. The shadow adds lift on top: violet-tinted in light, black in dark.

/** Card-to-page contrast at which tone alone separates a card (iOS: #1C1C1E on black, 1.23). */
export const TONAL_CONTRAST = 1.2;

/** `resting`: cards and lists. `floating`: the tab bar. `panel`: the night-violet panels. */
export type Elevation = 'resting' | 'floating' | 'panel';

const SHADOW = {
  light: {
    resting: { color: '#2E1F66', y: 4, opacity: 0.1, radius: 14, android: 2 },
    floating: { color: '#2E1F66', y: 12, opacity: 0.22, radius: 28, android: 8 },
  },
  dark: {
    resting: { color: '#000000', y: 6, opacity: 0.45, radius: 18, android: 3 },
    floating: { color: '#000000', y: 14, opacity: 0.6, radius: 32, android: 10 },
  },
} as const;

const TOP_LIGHT = 'rgba(255, 255, 255, 0.12)';

export function elevation(
  level: Elevation,
  palette: Palette,
  isDark: boolean,
  /** The container's fill, when it isn't `surface` (a tinted section). */
  background: string = palette.surface,
): ViewStyle {
  const shadow = SHADOW[isDark ? 'dark' : 'light'][level === 'resting' ? 'resting' : 'floating'];
  const tonal = contrastRatio(background, palette.ground) >= TONAL_CONTRAST;
  const edge =
    level === 'panel'
      ? isDark && !tonal
        ? 'rgba(255, 255, 255, 0.12)'
        : 'transparent'
      : level === 'resting' && tonal
        ? 'transparent'
        : palette.border;
  // Dark tonal cards are lit from above: a faint top edge that tapers into the corners.
  const lit = isDark && tonal && level !== 'floating';
  return {
    borderWidth: 1,
    borderColor: edge,
    ...(lit && { borderTopColor: TOP_LIGHT }),
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: shadow.y },
    shadowOpacity: shadow.opacity,
    shadowRadius: shadow.radius,
    elevation: shadow.android,
  };
}

/** A tapped card settles onto the page: no shadow (PressableScale eases the scale). */
export const pressedCard: ViewStyle = {
  shadowOpacity: 0,
  elevation: 0,
};
