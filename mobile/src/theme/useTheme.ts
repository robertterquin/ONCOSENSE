import { useColorScheme } from 'react-native';

import { useThemeStore, type ThemeMode } from '@/stores/themeStore';

import {
  darkPalette,
  highContrastDarkPalette,
  highContrastLightPalette,
  lightPalette,
  type Palette,
} from './palette';
import { scaledType, type TextSize, type TypeVariant } from './type';

/** Whether the app should be dark, given the setting and the phone's appearance. */
export function resolveIsDark(mode: ThemeMode, phone: string | null | undefined): boolean {
  return mode === 'dark' || (mode === 'system' && phone === 'dark');
}

function useIsDark(): boolean {
  const mode = useThemeStore((state) => state.mode);
  return resolveIsDark(mode, useColorScheme());
}

/** Redesign tokens: palette for the active theme and type at the user's text size. */
export function useDesign(): {
  isDark: boolean;
  palette: Palette;
  textSize: TextSize;
  highReadability: boolean;
  type: (variant: TypeVariant) => ReturnType<typeof scaledType>;
} {
  const isDark = useIsDark();
  const textSize = useThemeStore((state) => state.textSize);
  const highReadability = useThemeStore((state) => state.highReadability);

  const palette = highReadability
    ? isDark
      ? highContrastDarkPalette
      : highContrastLightPalette
    : isDark
      ? darkPalette
      : lightPalette;

  return {
    isDark,
    palette,
    textSize,
    highReadability,
    type: (variant) => scaledType(variant, textSize, highReadability),
  };
}
