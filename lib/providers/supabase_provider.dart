import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/supabase_service.dart';

// =============================================================================
// SUPABASE PROVIDERS - Core Supabase service access
// =============================================================================
// NOTE: User/auth providers are in auth_provider.dart to avoid duplication

/// Base provider for SupabaseService access
final supabaseServiceProvider = Provider<SupabaseService>((ref) {
  return getIt<SupabaseService>();
});

/// User email provider (unique to this file, not in auth_provider)
final userEmailProvider = Provider<String>((ref) {
  final supabaseService = ref.watch(supabaseServiceProvider);
  return supabaseService.currentUser?.email ?? '';
});
