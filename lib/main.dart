import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:cancerapp/utils/routes.dart';
import 'package:cancerapp/utils/constants.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/supabase_service.dart';
import 'package:cancerapp/services/notification_service.dart';
import 'package:cancerapp/services/notification_storage_service.dart';
import 'package:cancerapp/providers/theme_provider.dart' as theme_provider;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase
  await SupabaseService.initialize();
  
  // Setup dependency injection
  await setupServiceLocator();
  
  // Initialize Notification Service
  await NotificationService().initialize();
  
  // Initialize Notification Storage Service
  await NotificationStorageService().initialize();
  
  runApp(
    // Wrap app with ProviderScope for Riverpod
    const ProviderScope(
      child: CancerApp(),
    ),
  );
}

class CancerApp extends ConsumerWidget {
  const CancerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch theme mode from provider
    final themeMode = ref.watch(theme_provider.themeModeProvider);
    
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      initialRoute: AppRoutes.splash,
      routes: AppRoutes.getRoutes(),
      onGenerateRoute: AppRoutes.onGenerateRoute,
      onUnknownRoute: AppRoutes.onUnknownRoute,
    );
  }
}
