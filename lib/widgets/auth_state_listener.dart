import 'package:flutter/material.dart';
import 'package:cancerapp/services/supabase_service.dart';

/// Widget that listens to authentication state changes
/// and redirects users based on their authentication status
class AuthStateListener extends StatefulWidget {
  final Widget child;
  final String? authenticatedRoute;
  final String? unauthenticatedRoute;

  const AuthStateListener({
    super.key,
    required this.child,
    this.authenticatedRoute,
    this.unauthenticatedRoute,
  });

  @override
  State<AuthStateListener> createState() => _AuthStateListenerState();
}

class _AuthStateListenerState extends State<AuthStateListener> {
  @override
  void initState() {
    super.initState();
    _setupAuthListener();
  }

  void _setupAuthListener() {
    final supabase = SupabaseService();
    
    supabase.authStateChanges.listen((authState) {
      if (!mounted) return;

      final session = authState.session;
      
      if (session != null && widget.authenticatedRoute != null) {
        // User signed in
        Navigator.pushReplacementNamed(context, widget.authenticatedRoute!);
      } else if (session == null && widget.unauthenticatedRoute != null) {
        // User signed out
        Navigator.pushReplacementNamed(context, widget.unauthenticatedRoute!);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}

/// Helper widget to protect routes that require authentication
class AuthGuard extends StatelessWidget {
  final Widget child;
  final String loginRoute;

  const AuthGuard({
    super.key,
    required this.child,
    this.loginRoute = '/login',
  });

  @override
  Widget build(BuildContext context) {
    final supabase = SupabaseService();
    
    if (!supabase.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushReplacementNamed(context, loginRoute);
      });
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }
    
    return child;
  }
}
