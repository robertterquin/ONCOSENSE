import { Redirect } from 'expo-router';

import { homeRouteFor } from '@/hooks/useAuth';
import { hasRememberedSession, useAuthStore } from '@/stores/authStore';

/**
 * Launch route (replaces splash_screen.dart): signed-in users who chose "remember me"
 * skip login; everyone else starts at Welcome. The root layout keeps the native
 * splash screen up until the session has been restored.
 */
export default function LaunchScreen() {
  const state = useAuthStore();
  if (hasRememberedSession(state)) return <Redirect href={homeRouteFor(state.user)} />;
  return <Redirect href="/welcome" />;
}
