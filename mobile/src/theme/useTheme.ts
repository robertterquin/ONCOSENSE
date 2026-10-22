import { useThemeStore } from '@/stores/themeStore';

import { brand, darkColors, lightColors } from './colors';

/** The active color scheme (light unless dark mode is on in Settings). */
export function useTheme() {
  const isDark = useThemeStore((state) => state.isDarkMode);
  return { isDark, colors: isDark ? darkColors : lightColors, brand };
}
