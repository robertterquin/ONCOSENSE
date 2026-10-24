import { useFonts } from '@expo-google-fonts/poppins';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ToastHost } from '@/components/Toast';
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

  // Like the Flutter splash screen, set up reminders for signed-in users.
  useEffect(() => {
    if (ready && userId) initializeNotifications();
  }, [ready, userId]);

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
