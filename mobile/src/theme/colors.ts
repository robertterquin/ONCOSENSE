// Ported from lib/utils/theme.dart (AppTheme).

/** Pink ribbon brand colors; the same in light and dark mode. */
export const brand = {
  primaryPink: '#E91E63',
  lightPink: '#FCE4EC',
  mediumPink: '#F8BBD0',
  darkPink: '#C2185B',
  /** Header gradient start (CustomAppHeader). */
  headerPink: '#D81B60',
  accentPurple: '#9C27B0',
  white: '#FFFFFF',
  error: '#F44336',
  success: '#2E7D32',
} as const;

export type ColorScheme = {
  /** Screen background behind cards (AppTheme.getBackgroundColor). */
  background: string;
  /** Sheets, dialogs, tab bar (getSurfaceColor). */
  surface: string;
  /** Cards (getCardColor). */
  card: string;
  text: string;
  textSecondary: string;
  divider: string;
  inputFill: string;
  inputPlaceholder: string;
  primary: string;
  onPrimary: string;
};

export const lightColors: ColorScheme = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#212121',
  textSecondary: '#BDBDBD',
  divider: '#F5F5F5',
  inputFill: '#F5F5F5',
  inputPlaceholder: 'rgba(189, 189, 189, 0.6)',
  primary: brand.primaryPink,
  onPrimary: brand.white,
};

export const darkColors: ColorScheme = {
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2D2D2D',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  divider: '#3D3D3D',
  inputFill: '#2D2D2D',
  inputPlaceholder: '#B3B3B3',
  primary: brand.primaryPink,
  onPrimary: brand.white,
};

/** Gradient color stops (top-left → bottom-right unless noted). */
export const gradients = {
  pink: ['#FFFFFF', '#FCE4EC', '#F8BBD0'],
  /** Top → bottom. */
  softPink: ['#FFFFFF', '#FFF0F5'],
  /** Left → right. */
  button: ['#E91E63', '#EC407A'],
  header: ['#D81B60', '#E91E63'],
} as const;
