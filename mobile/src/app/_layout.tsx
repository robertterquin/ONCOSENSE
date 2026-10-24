import { useFonts } from '@expo-google-fonts/poppins';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ToastHost } from '@/components/Toast';
import { focusFromMetadata } from '@/lib/focus';
import { initializeNotifications, startNotificationListeners } from '@/lib/notifications/service';
import { queryClient } from '@/lib/queryClient';
import { startAuthListener, useAuthStore, useUserId } from '@/stores/authStore';
import { fontAssets } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const sessionRestored = useAuthStore((state) => state.isRestored);
  const userId = useUserId();
  const { isDark, colors } = useTheme();
  const ready = (fontsLoaded || !!fontError) && sessionRestored;

  useEffect(() => startAuthListener(), []);

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

  // Keep the native splash screen (logo on white) until fonts and the session are ready.
  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }} />
        <ToastHost />
      </View>
    </QueryClientProvider>
  );
}
