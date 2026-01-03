import 'package:get_it/get_it.dart';
import 'package:cancerapp/services/supabase_service.dart';
import 'package:cancerapp/services/journey_service.dart';
import 'package:cancerapp/services/bookmark_service.dart';
import 'package:cancerapp/services/cancer_info_service.dart';
import 'package:cancerapp/services/prevention_service.dart';
import 'package:cancerapp/services/resources_service.dart';
import 'package:cancerapp/services/forum_service.dart';
import 'package:cancerapp/services/gnews_service.dart';
import 'package:cancerapp/services/health_tips_service.dart';
import 'package:cancerapp/services/health_reminders_service.dart';
import 'package:cancerapp/services/notification_service.dart';
import 'package:cancerapp/services/notification_storage_service.dart';

/// Global service locator instance
final getIt = GetIt.instance;

/// Setup all services for dependency injection
/// Call this once at app startup before runApp()
Future<void> setupServiceLocator() async {
  // Core services - register as singletons
  getIt.registerLazySingleton<SupabaseService>(() => SupabaseService());
  
  // Data services
  getIt.registerLazySingleton<JourneyService>(() => JourneyService());
  getIt.registerLazySingleton<BookmarkService>(() => BookmarkService());
  getIt.registerLazySingleton<CancerInfoService>(() => CancerInfoService());
  getIt.registerLazySingleton<PreventionService>(() => PreventionService());
  getIt.registerLazySingleton<ResourcesService>(() => ResourcesService());
  getIt.registerLazySingleton<ForumService>(() => ForumService());
  
  // External API services
  getIt.registerLazySingleton<GNewsService>(() => GNewsService());
  getIt.registerLazySingleton<HealthTipsService>(() => HealthTipsService());
  getIt.registerLazySingleton<HealthRemindersService>(() => HealthRemindersService());
  
  // Notification services
  getIt.registerLazySingleton<NotificationService>(() => NotificationService());
  getIt.registerLazySingleton<NotificationStorageService>(() => NotificationStorageService());
}
