import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Supabase service for handling all Supabase operations
class SupabaseService {
  static final SupabaseService _instance = SupabaseService._internal();
  
  factory SupabaseService() {
    return _instance;
  }
  
  SupabaseService._internal();

  /// Initialize Supabase with credentials from .env
  static Future<void> initialize() async {
    // Load environment variables
    await dotenv.load(fileName: ".env");
    
    final supabaseUrl = dotenv.env['SUPABASE_URL'];
    final supabaseAnonKey = dotenv.env['SUPABASE_ANON_KEY'];

    if (supabaseUrl == null || supabaseAnonKey == null) {
      throw Exception('Supabase credentials not found in .env file');
    }

    // Debug logging
    print('🔧 Initializing Supabase...');
    print('📍 URL: $supabaseUrl');
    print('🔑 Key: ${supabaseAnonKey.substring(0, 20)}...');

    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.implicit,
      ),
      realtimeClientOptions: const RealtimeClientOptions(
        logLevel: RealtimeLogLevel.info,
      ),
      storageOptions: const StorageClientOptions(
        retryAttempts: 10,
      ),
      debug: true,
    );
    
    print('✅ Supabase initialized successfully');
  }

  /// Get the Supabase client instance
  SupabaseClient get client => Supabase.instance.client;

  /// Get the current user
  User? get currentUser => client.auth.currentUser;

  /// Check if user is authenticated
  bool get isAuthenticated => currentUser != null;

  /// Sign up with email and password
  Future<AuthResponse> signUp({
    required String email,
    required String password,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final response = await client.auth.signUp(
        email: email,
        password: password,
        data: metadata,
        emailRedirectTo: null,
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  /// Sign in with email and password
  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    return await client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  /// Sign out
  Future<void> signOut() async {
    await client.auth.signOut();
  }

  /// Reset password
  Future<void> resetPassword(String email) async {
    await client.auth.resetPasswordForEmail(email);
  }

  /// Update user profile metadata
  Future<UserResponse> updateProfile(Map<String, dynamic> metadata) async {
    return await client.auth.updateUser(
      UserAttributes(data: metadata),
    );
  }

  /// Get user metadata
  Map<String, dynamic>? get userMetadata => currentUser?.userMetadata;

  /// Listen to auth state changes
  Stream<AuthState> get authStateChanges => client.auth.onAuthStateChange;

  // Remember Me Feature Keys
  static const String _rememberMeKey = 'remember_me';
  static const String _hasActiveSessionKey = 'has_active_session';

  /// Save remember me preference
  Future<void> saveRememberMePreference(bool rememberMe) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_rememberMeKey, rememberMe);
    if (rememberMe && isAuthenticated) {
      await prefs.setBool(_hasActiveSessionKey, true);
    }
  }

  /// Get remember me preference
  Future<bool> getRememberMePreference() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_rememberMeKey) ?? false;
  }

  /// Check if user has an active session (remembered)
  Future<bool> hasActiveSession() async {
    final prefs = await SharedPreferences.getInstance();
    final rememberMe = prefs.getBool(_rememberMeKey) ?? false;
    final hasSession = prefs.getBool(_hasActiveSessionKey) ?? false;
    
    // Check if user is authenticated and remember me is enabled
    return rememberMe && hasSession && isAuthenticated;
  }

  /// Clear remember me session
  Future<void> clearRememberMeSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_hasActiveSessionKey);
    await prefs.remove(_rememberMeKey);
  }

  /// Sign out and clear remember me
  Future<void> signOutAndClearSession() async {
    await clearRememberMeSession();
    await signOut();
  }

  /// Delete user account permanently
  /// This will clear all local data and sign out the user
  /// Note: Full account deletion from Supabase requires backend implementation
  Future<void> deleteAccount() async {
    try {
      final userId = currentUser?.id;
      
      // Clear all local data first
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      
      // Clear remember me session
      await clearRememberMeSession();
      
      // Sign out from Supabase
      await signOut();
      
      print('🗑️ Account data cleared for user: $userId');
    } catch (e) {
      throw Exception('Failed to delete account data: ${e.toString()}');
    }
  }
}
