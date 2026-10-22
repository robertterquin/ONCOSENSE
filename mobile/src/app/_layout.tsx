import { useFonts } from '@expo-google-fonts/poppins';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { queryClient } from '@/lib/queryClient';
import { startAuthListener } from '@/stores/authStore';
import { fontAssets } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const { isDark } = useTheme();

  useEffect(() => startAuthListener(), []);

  useEffect(() => {
    // Phase 3 also waits for the restored session before hiding the splash.
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
