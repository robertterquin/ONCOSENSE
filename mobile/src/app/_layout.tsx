import {
  Lexend_400Regular,
  Lexend_600SemiBold,
  Lexend_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/lexend';
import { Figtree_800ExtraBold } from '@expo-google-fonts/figtree/800ExtraBold';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { ToastHost } from '@/components/ui';
import { focusFromMetadata } from '@/lib/focus';
import { clearHabits, startHabitSync, syncHabits } from '@/lib/habitSync';
import { initializeNotifications, startNotificationListeners } from '@/lib/notifications/service';
import { queryClient } from '@/lib/queryClient';
import { clearSelfChecks, startSelfCheckSync, syncSelfChecks } from '@/lib/selfCheckSync';
import { startAuthListener, useAuthStore, useUserId } from '@/stores/authStore';
import { useDesign } from '@/theme/useTheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_600SemiBold,
    Lexend_800ExtraBold,
    Figtree_800ExtraBold,
  });
  const sessionRestored = useAuthStore((state) => state.isRestored);
  const userId = useUserId();
  const { isDark, palette } = useDesign();
  // shortcut: read once at launch, so changing Reduce Motion applies after a restart; fine for a setting people rarely toggle.
  const reduceMotion = useReducedMotion();
  const ready = (fontsLoaded || !!fontError) && sessionRestored;

  useEffect(() => startAuthListener(), []);
  useEffect(() => startSelfCheckSync(), []);
  useEffect(() => startHabitSync(), []);

  // Self-checks and habits follow the account: load them at sign-in, drop them at sign-out.
  const wasSignedIn = useRef(false);
  useEffect(() => {
    if (userId) {
      void syncSelfChecks();
      void syncHabits();
    } else if (wasSignedIn.current) {
      clearSelfChecks();
      clearHabits();
    }
    wasSignedIn.current = userId !== null;
  }, [userId]);

  // Web: the browser's 1px focus ring is hard to see, so keyboard focus gets a two-tone
  // ring (surface inside, action outside) that shows on light, dark and the violet panel.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const style = document.createElement('style');
    style.textContent = `:focus-visible { outline: none !important; box-shadow: 0 0 0 2px ${palette.surface}, 0 0 0 5px ${palette.action} !important; }`;
    document.head.append(style);
    return () => style.remove();
  }, [palette]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // After the navigator is mounted, so a tapped notification can open its screen.
  useEffect(() => (ready ? startNotificationListeners() : undefined), [ready]);

  // Set up reminders for signed-in users once they've answered "What brings you here?",
  // so the first permission prompt offers the right reminders (redesign Phase 6).
  const hasFocus = useAuthStore((state) => focusFromMetadata(state.user) !== null);
  useEffect(() => {
    if (ready && userId && hasFocus) initializeNotifications();
  }, [ready, userId, hasFocus]);

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: { ...baseTheme.colors, background: palette.ground, card: palette.surface },
  };

  // Keep the native splash screen (the ribbon on violet) until fonts and the session are ready.
  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1, backgroundColor: palette.ground }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {/* The navigator's own colours match the app's, so nothing light shows between screens. */}
        <ThemeProvider value={navigationTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: reduceMotion ? 'fade' : 'default',
            }}
          />
        </ThemeProvider>
        <ToastHost />
      </View>
    </QueryClientProvider>
  );
}
