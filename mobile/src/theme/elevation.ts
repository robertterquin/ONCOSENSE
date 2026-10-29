import type { ViewStyle } from 'react-native';

// How far a container sits above the page (docs/redesign/README.md, 2026-10-29).
// Light: a soft violet-tinted shadow does the work, so cards drop their border.
// Dark: shadows barely show on a near-black page, so a faint light edge marks the card
// and a deep black shadow separates it.

export type Elevation = 'resting' | 'floating';

const LIGHT: Record<Elevation, ViewStyle> = {
  resting: {
    borderWidth: 0,
    shadowColor: '#2E1F66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },
  floating: {
    borderWidth: 0,
    shadowColor: '#2E1F66',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
};

const DARK: Record<Elevation, ViewStyle> = {
  resting: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 3,
  },
  floating: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 10,
  },
};

export function elevation(level: Elevation, isDark: boolean): ViewStyle {
  return (isDark ? DARK : LIGHT)[level];
}

/** A tapped card settles onto the page: no shadow, 2% smaller. */
export const pressedCard: ViewStyle = {
  shadowOpacity: 0,
  elevation: 0,
  transform: [{ scale: 0.98 }],
};
