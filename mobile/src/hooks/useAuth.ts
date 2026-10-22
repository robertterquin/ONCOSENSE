import type { User } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';

import {
  hasCompletedJourneySetup,
  resetPassword,
  signIn,
  signOut,
  signUp,
  type ProfileMetadata,
} from '@/api/auth';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';

// Sign-in flows from the Flutter login, register and forgot-password screens.

/** Where a signed-in user goes: journey setup until it's done, then the Home tab. */
export function homeRouteFor(user: User | null): Href {
  return hasCompletedJourneySetup(user) ? '/home' : '/journey/onboarding';
}

export function useSignIn() {
  return useMutation({
    mutationFn: async (input: { email: string; password: string; rememberMe: boolean }) => {
      const { user } = await signIn(input.email.trim(), input.password);
      useAuthStore.getState().setRememberMe(input.rememberMe);
      return user;
    },
    onSuccess: (user) => {
      showToast('Welcome back!', 'success');
      router.replace(homeRouteFor(user));
    },
    onError: (error) => showToast(error.message, 'error'),
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (input: { email: string; password: string; metadata: ProfileMetadata }) =>
      signUp(input.email.trim(), input.password, input.metadata),
    onSuccess: ({ session }) => {
      if (session) {
        showToast('🎉 Welcome to OncoSense!', 'success');
        router.replace('/journey/onboarding');
      } else {
        // The project requires email confirmation before the first sign-in.
        showToast('Account created! Check your email to confirm it, then log in.', 'success');
        router.replace('/login');
      }
    },
    onError: (error) => showToast(error.message, 'error'),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => resetPassword(email.trim()),
    onError: (error) => showToast(error.message, 'error'),
  });
}

/** Signs out, forgets "remember me", clears cached data and returns to Welcome. */
export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      try {
        await signOut();
      } finally {
        useAuthStore.getState().clear();
        queryClient.clear();
      }
    },
    onSettled: () => router.replace('/welcome'),
  });
}

/** "Continue as Guest": browse without an account until the app is closed. */
export function continueAsGuest() {
  useAuthStore.getState().continueAsGuest();
  router.replace('/home');
}
