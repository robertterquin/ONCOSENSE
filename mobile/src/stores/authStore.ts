import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

// Replaces lib/providers/auth_provider.dart and supabase_provider.dart, plus the
// "remember me" flags from supabase_service.dart.

type AuthState = {
  session: Session | null;
  user: User | null;
  /** True once the stored session has been restored at launch. */
  isRestored: boolean;
  /** "Remember me" from the login screen; persisted on the device. */
  rememberMe: boolean;
  setRememberMe: (rememberMe: boolean) => void;
  setSession: (session: Session | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      isRestored: false,
      rememberMe: false,
      setRememberMe: (rememberMe) => set({ rememberMe }),
      setSession: (session) => set({ session, user: session?.user ?? null, isRestored: true }),
    }),
    {
      name: 'auth',
      storage: persistStorage,
      // The session itself is stored by the Supabase client; only keep the preference here.
      partialize: (state) => ({ rememberMe: state.rememberMe }),
    },
  ),
);

/** Restores the stored session and keeps the store in sync. Returns a cleanup function. */
export function startAuthListener(): () => void {
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.getState().setSession(data.session);
  });
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });
  return () => data.subscription.unsubscribe();
}

/** Signed in and "remember me" was chosen (the splash screen's rule for skipping login). */
export function hasRememberedSession(state: AuthState = useAuthStore.getState()): boolean {
  return state.rememberMe && state.user !== null;
}

export const useUser = () => useAuthStore((state) => state.user);
export const useUserId = () => useAuthStore((state) => state.user?.id ?? null);
export const useIsSignedIn = () => useAuthStore((state) => state.user !== null);
