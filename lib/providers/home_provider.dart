import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/gnews_service.dart';
import 'package:cancerapp/services/health_tips_service.dart';
import 'package:cancerapp/services/health_reminders_service.dart';
import 'package:cancerapp/models/article.dart';
import 'package:cancerapp/models/health_tip.dart';
import 'package:cancerapp/models/health_reminder.dart';

/// GNews articles provider - cancer news
final cancerArticlesProvider = FutureProvider<List<Article>>((ref) async {
  final gNewsService = getIt<GNewsService>();
  return await gNewsService.fetchCancerArticles(maxResults: 10);
});

/// Survivor story provider
final survivorStoryProvider = FutureProvider<Article?>((ref) async {
  final gNewsService = getIt<GNewsService>();
  final stories = await gNewsService.fetchCancerArticles(
    maxResults: 1,
    query: 'cancer survivor story recovery',
  );
  return stories.isNotEmpty ? stories.first : null;
});

/// Daily health tip provider
final dailyHealthTipProvider = Provider<HealthTip>((ref) {
  return HealthTipsService.getTipOfTheDay();
});

/// Health reminders provider
final healthRemindersProvider = FutureProvider<List<HealthReminder>>((ref) async {
  final healthRemindersService = getIt<HealthRemindersService>();
  return await healthRemindersService.getRemindersToShow(count: 2);
});
