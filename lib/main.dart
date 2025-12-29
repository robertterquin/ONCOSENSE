import 'package:flutter/material.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:cancerapp/utils/routes.dart';
import 'package:cancerapp/utils/constants.dart';
import 'package:cancerapp/services/supabase_service.dart';
import 'package:cancerapp/services/theme_provider.dart';
import 'package:cancerapp/services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase
  await SupabaseService.initialize();
  
  // Initialize Notification Service
  await NotificationService().initialize();
  
  runApp(const CancerApp());
}

class CancerApp extends StatefulWidget {
  const CancerApp({super.key});

  // Global key for accessing the state from anywhere
  static final GlobalKey<_CancerAppState> appKey = GlobalKey<_CancerAppState>();
  
  // Static method to get the ThemeProvider
  static ThemeProvider? of(BuildContext context) {
    final state = context.findAncestorStateOfType<_CancerAppState>();
    return state?.themeProvider;
  }

  @override
  State<CancerApp> createState() => _CancerAppState();
}

class _CancerAppState extends State<CancerApp> {
  late final ThemeProvider themeProvider;

  @override
  void initState() {
    super.initState();
    themeProvider = ThemeProvider();
    themeProvider.addListener(_onThemeChanged);
  }

  @override
  void dispose() {
    themeProvider.removeListener(_onThemeChanged);
    themeProvider.dispose();
    super.dispose();
  }

  void _onThemeChanged() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeProvider.themeMode,
      initialRoute: AppRoutes.splash,
      routes: AppRoutes.getRoutes(),
      onGenerateRoute: AppRoutes.onGenerateRoute,
      onUnknownRoute: AppRoutes.onUnknownRoute,
    );
  }
}
