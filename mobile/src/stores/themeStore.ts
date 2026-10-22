import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';

// Port of lib/providers/theme_provider.dart. Like the Flutter app, the app starts
// in light mode until the user turns dark mode on in Settings.

type ThemeState = {
  isDarkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      setDarkMode: (isDarkMode) => set({ isDarkMode }),
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    { name: 'theme', storage: persistStorage },
  ),
);
