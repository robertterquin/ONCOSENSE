import type { ViewStyle } from 'react-native';

import type { Palette } from './palette';

// How far a container sits above the page (docs/redesign/README.md, 2026-10-29).
// Card fills are within a few percent of the page in every palette, so every raised
// container keeps a visible `border` edge; the shadow adds the lift on top. Light uses a
// violet-tinted shadow, dark a deep black one (a shadow barely shows on a dark page).

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

export function elevation(level: Elevation, palette: Palette, isDark: boolean): ViewStyle {
  const shadow = SHADOW[isDark ? 'dark' : 'light'][level === 'resting' ? 'resting' : 'floating'];
  // A violet panel stands out on a light page by itself; on a dark page it needs an edge.
  const edge =
    level === 'panel' ? (isDark ? 'rgba(255, 255, 255, 0.12)' : 'transparent') : palette.border;
  return {
    borderWidth: 1,
    borderColor: edge,
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: shadow.y },
    shadowOpacity: shadow.opacity,
    shadowRadius: shadow.radius,
    elevation: shadow.android,
  };
}

/** A tapped card settles onto the page: no shadow, 2% smaller. */
export const pressedCard: ViewStyle = {
  shadowOpacity: 0,
  elevation: 0,
  transform: [{ scale: 0.98 }],
};
