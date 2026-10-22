// Provides a persistent `localStorage` on iOS and Android for the auth session.
import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { getSupabaseConfig } from '@/lib/env';

const { url, anonKey } = getSupabaseConfig();

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    // There is no URL to read a session from on iOS and Android.
    detectSessionInUrl: false,
  },
});

// Only refresh the session token while the app is in the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
