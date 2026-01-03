import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/supabase_service.dart';

/// Auth state provider - watches authentication changes
final authStateProvider = StreamProvider<AuthState>((ref) {
  final supabaseService = getIt<SupabaseService>();
  return supabaseService.authStateChanges;
});

/// Current user provider
final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.when(
    data: (state) => state.session?.user,
    loading: () => null,
    error: (_, __) => null,
  );
});

/// User ID provider - returns current user's ID
final userIdProvider = Provider<String?>((ref) {
  final user = ref.watch(currentUserProvider);
  return user?.id;
});

/// Is authenticated provider
final isAuthenticatedProvider = Provider<bool>((ref) {
  final user = ref.watch(currentUserProvider);
  return user != null;
});

/// User display name provider
final userDisplayNameProvider = Provider<String>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return 'Guest';
  return user.userMetadata?['full_name'] ?? 
         user.email?.split('@')[0] ?? 
         'User';
});

/// User profile picture provider
final userProfilePictureProvider = Provider<String?>((ref) {
  final user = ref.watch(currentUserProvider);
  return user?.userMetadata?['profile_picture_url'];
});
