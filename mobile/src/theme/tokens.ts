// Radius and animation durations from lib/utils/constants.dart.

export const radius = {
  small: 8,
  medium: 12,
  large: 16,
  /** Header bottom corners. */
  header: 24,
} as const;

// ---- Redesign (docs/redesign/02-phase-2-foundations.md) ----

/** 4-based spacing. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Corner radius by hierarchy: the bigger and more important, the rounder. */
export const radii = {
  /** The next-step panel. */
  panel: 28,
  /** Sections and cards. */
  section: 20,
  /** Buttons and inputs. */
  control: 16,
  /** Icon tiles in rows. */
  tile: 14,
  /** Chips, pills and round buttons. */
  round: 999,
} as const;

/** Minimum touch target and common control heights. */
export const sizes = {
  touch: 44,
  button: 54,
  row: 68,
} as const;

/** Milliseconds. */
export const durations = {
  short: 200,
  medium: 300,
  long: 500,
} as const;

/** Ambient shadows for surfaces and elevated cards across iOS, Android and web. */
export const shadows = {
  /** Subtle lift for card sections and containers. */
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },
  /** Floating controls, next-step panel and tab dock. */
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 6,
  },
  /** Elevated modal sheets and popups. */
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;
