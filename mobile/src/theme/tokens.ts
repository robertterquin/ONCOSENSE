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

/** Milliseconds. */
export const durations = {
  short: 200,
  medium: 300,
  long: 500,
} as const;
