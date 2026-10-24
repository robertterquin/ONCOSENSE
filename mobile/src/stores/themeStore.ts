import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';
import type { TextSize } from '@/theme/type';

// Started as a port of lib/providers/theme_provider.dart (a dark-mode switch). The
// redesign adds "match the phone" and a text-size setting for low vision and fatigue.

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
};

/**
 * Saved settings from before the redesign had only `isDarkMode`; keep that choice.
 * (The Flutter app defaulted to light, so `false` stays light rather than "phone".)
 */
export function migrateThemeState(persisted: unknown, version: number): unknown {
  if (version >= 1 || !persisted || typeof persisted !== 'object') return persisted;
  const { isDarkMode, ...rest } = persisted as { isDarkMode?: unknown };
  return { ...rest, mode: isDarkMode === true ? 'dark' : 'light', textSize: 'default' };
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
      textSize: 'default',
      setTextSize: (textSize) => set({ textSize }),
    }),
    {
      name: 'theme',
      storage: persistStorage,
      version: 1,
      migrate: (persisted, version) => migrateThemeState(persisted, version) as ThemeState,
    },
  ),
);
