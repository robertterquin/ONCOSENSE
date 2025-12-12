import 'package:flutter/material.dart';
import 'package:cancerapp/screens/splash/splash_screen.dart';
import 'package:cancerapp/screens/auth/welcome_screen.dart';
import 'package:cancerapp/screens/auth/register_screen.dart';
import 'package:cancerapp/screens/auth/login_screen.dart';
import 'package:cancerapp/screens/auth/forgot_password_screen.dart';
import 'package:cancerapp/screens/home/home_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String welcome = '/welcome';
  static const String register = '/register';
  static const String login = '/login';
  static const String forgotPassword = '/forgot-password';
  static const String home = '/home';

  static Map<String, WidgetBuilder> getRoutes() {
    return {
      splash: (context) => const SplashScreen(),
      welcome: (context) => const WelcomeScreen(),
      register: (context) => const RegisterScreen(),
      login: (context) => const LoginScreen(),
      forgotPassword: (context) => const ForgotPasswordScreen(),
      home: (context) => const HomeScreen(),
      // TODO: Add other routes (onboarding, etc.)
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
