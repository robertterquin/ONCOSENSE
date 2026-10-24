import { useColorScheme } from 'react-native';

import { useThemeStore, type ThemeMode } from '@/stores/themeStore';

import { brand, darkColors, lightColors } from './colors';
import { darkPalette, lightPalette, type Palette } from './palette';
import { scaledType, type TextSize, type TypeVariant } from './type';

/** Whether the app should be dark, given the setting and the phone's appearance. */
export function resolveIsDark(mode: ThemeMode, phone: string | null | undefined): boolean {
  return mode === 'dark' || (mode === 'system' && phone === 'dark');
}

function useIsDark(): boolean {
  const mode = useThemeStore((state) => state.mode);
  return resolveIsDark(mode, useColorScheme());
}

/** The active color scheme (the Flutter-era colors; screens move to `useDesign`). */
export function useTheme() {
  const isDark = useIsDark();
  return { isDark, colors: isDark ? darkColors : lightColors, brand };
}

/** Redesign tokens: palette for the active theme and type at the user's text size. */
export function useDesign(): {
  isDark: boolean;
  palette: Palette;
  textSize: TextSize;
  type: (variant: TypeVariant) => ReturnType<typeof scaledType>;
} {
  const isDark = useIsDark();
  const textSize = useThemeStore((state) => state.textSize);
  return {
    isDark,
    palette: isDark ? darkPalette : lightPalette,
    textSize,
    type: (variant) => scaledType(variant, textSize),
  };
}
