import 'package:flutter/material.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:cancerapp/utils/routes.dart';
import 'package:cancerapp/services/supabase_service.dart';
import 'package:cancerapp/services/notification_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    
    // Initialize fade animation
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeIn,
    ));
    
    // Start animation
    _controller.forward();
    
    // Check for active session and navigate
    _checkSessionAndNavigate();
  }

  Future<void> _checkSessionAndNavigate() async {
    // Wait for 3 seconds for splash animation
    await Future.delayed(const Duration(seconds: 3));
    
    if (!mounted) return;

    try {
      final supabase = SupabaseService();
      final hasSession = await supabase.hasActiveSession();
      
      // Initialize notifications for logged-in users
      if (hasSession) {
        await _initializeNotifications();
        // User has active session, navigate to home
        Navigator.of(context).pushReplacementNamed(AppRoutes.home);
      } else {
        // No active session, navigate to welcome screen
        Navigator.of(context).pushReplacementNamed(AppRoutes.welcome);
      }
    } catch (e) {
      // If error checking session, go to welcome
      if (mounted) {
        Navigator.of(context).pushReplacementNamed(AppRoutes.welcome);
      }
    }
  }
  
  Future<void> _initializeNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final hasSetupNotifications = prefs.getBool('notifications_setup_complete') ?? false;
      
      if (!hasSetupNotifications) {
        // First time setup - request permissions and schedule notifications
        final notificationService = NotificationService();
        final granted = await notificationService.requestPermissions();
        
        if (granted) {
          await notificationService.enableAllNotifications();
          await prefs.setBool('notifications_setup_complete', true);
          debugPrint('✅ Initial notification setup complete');
        }
      }
    } catch (e) {
      debugPrint('Error initializing notifications: $e');
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: AppTheme.pinkGradient,
        ),
        child: Center(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: Image.asset(
              'assets/images/oncosense_logoo.png',
              width: 250,
              height: 250,
              fit: BoxFit.contain,
            ),
          ),
        ),
      ),
    );
  }
}
