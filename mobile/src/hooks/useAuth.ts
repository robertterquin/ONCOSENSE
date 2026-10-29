import type { User } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';

import {
  deleteAccount,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updatePassword,
  updateProfile,
  type ProfileMetadata,
} from '@/api/auth';
import { uploadProfilePicture } from '@/api/profilePicture';
import { focusFromMetadata } from '@/lib/focus';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';

// Sign-in flows from the Flutter login, register and forgot-password screens.

/** Where a signed-in user goes: "What brings you here?" until they've answered, then Today. */
export function homeRouteFor(user: User | null): Href {
  return focusFromMetadata(user) ? '/today' : '/journey/focus';
}

export function useSignIn() {
  return useMutation({
    mutationFn: async (input: { email: string; password: string; rememberMe: boolean }) => {
      const { user } = await signIn(input.email.trim(), input.password);
      useAuthStore.getState().setRememberMe(input.rememberMe);
      return user;
    },
    onSuccess: (user) => {
      showToast('Welcome back', 'success');
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
        showToast('Welcome to OncoSense', 'success');
        router.replace('/journey/focus');
      } else {
        // The project requires email confirmation before the first sign-in.
        showToast('Account created. Check your email to confirm it, then sign in.', 'success');
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
  router.replace('/today');
}

/** Saves name/age/gender and, if chosen, a new or removed photo (edit_profile_screen.dart). */
export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (input: {
      fullName: string;
      age: number | null;
      gender: string | null;
      /** A newly picked local photo to upload. */
      newPhotoUri: string | null;
      /** The photo to keep (null removes it). Ignored when a new photo is uploaded. */
      currentPhotoUrl: string | null;
    }) => {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('You need to be signed in to edit your profile.');
      const photoUrl = input.newPhotoUri
        ? await uploadProfilePicture(user.id, input.newPhotoUri)
        : input.currentPhotoUrl;
      // Updating metadata also refreshes the signed-in user in the auth store.
      return updateProfile({
        full_name: input.fullName,
        age: input.age,
        gender: input.gender,
        profile_picture_url: photoUrl,
      });
    },
  });
}

/** Checks the current password by signing in again, then sets the new one (change_password_screen.dart). */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: { email: string; currentPassword: string; newPassword: string }) => {
      await signIn(input.email.trim(), input.currentPassword);
      await updatePassword(input.newPassword);
    },
  });
}

/** Deletes the account on the server, then clears everything on the device. */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      await deleteAccount();
      useAuthStore.getState().clear();
      queryClient.clear();
      // The server already removed the user; this just drops the local session.
      await signOut().catch(() => undefined);
    },
    onSuccess: () => {
      router.replace('/welcome');
      showToast('Your account has been deleted', 'success');
    },
    onError: (error) => showToast(error.message, 'error'),
  });
}
