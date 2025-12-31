import 'package:flutter/material.dart';
import 'package:cancerapp/screens/splash/splash_screen.dart';
import 'package:cancerapp/screens/auth/welcome_screen.dart';
import 'package:cancerapp/screens/auth/register_screen.dart';
import 'package:cancerapp/screens/auth/login_screen.dart';
import 'package:cancerapp/screens/auth/forgot_password_screen.dart';
import 'package:cancerapp/screens/main_navigation.dart';
import 'package:cancerapp/screens/profile/change_password_screen.dart';
import 'package:cancerapp/screens/profile/settings_screen.dart';
import 'package:cancerapp/screens/journey/journey_onboarding_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String welcome = '/welcome';
  static const String register = '/register';
  static const String login = '/login';
  static const String forgotPassword = '/forgot-password';
  static const String home = '/home';
  static const String changePassword = '/change-password';
  static const String settings = '/settings';
  static const String journeySetup = '/journey-setup';

  static Map<String, WidgetBuilder> getRoutes() {
    return {
      splash: (context) => const SplashScreen(),
      welcome: (context) => const WelcomeScreen(),
      register: (context) => const RegisterScreen(),
      login: (context) => const LoginScreen(),
      forgotPassword: (context) => const ForgotPasswordScreen(),
      home: (context) => const MainNavigation(),
      changePassword: (context) => const ChangePasswordScreen(),
      settings: (context) => const SettingsScreen(),
      journeySetup: (context) => const JourneyOnboardingScreen(),
    };
  }

  static Route<dynamic>? onGenerateRoute(RouteSettings settings) {
    // Handle dynamic routes here if needed
    return null;
  }

  static Route<dynamic> onUnknownRoute(RouteSettings settings) {
    return MaterialPageRoute(
      builder: (context) => const WelcomeScreen(),
    );
  }
}
