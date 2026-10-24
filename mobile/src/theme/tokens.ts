// Spacing, radius and animation durations from lib/utils/constants.dart.

export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
  extraLarge: 32,
} as const;

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
