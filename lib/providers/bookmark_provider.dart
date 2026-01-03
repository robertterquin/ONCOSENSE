import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/bookmark_service.dart';
import 'package:cancerapp/models/article.dart';
import 'package:cancerapp/models/question.dart';
import 'package:cancerapp/models/resource.dart';

/// Bookmark service provider
final bookmarkServiceProvider = Provider<BookmarkService>((ref) {
  return getIt<BookmarkService>();
});

/// Bookmarked articles provider
final bookmarkedArticlesProvider = FutureProvider<List<Article>>((ref) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.getBookmarkedArticles();
});

/// Bookmarked questions provider
final bookmarkedQuestionsProvider = FutureProvider<List<Question>>((ref) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.getBookmarkedQuestions();
});

/// Bookmarked resources provider
final bookmarkedResourcesProvider = FutureProvider<List<Resource>>((ref) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.getBookmarkedResources();
});

/// Single article bookmark state provider (by URL)
final articleBookmarkProvider = FutureProvider.family<bool, String>((ref, articleUrl) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.isBookmarked(articleUrl);
});

/// Single question bookmark state provider
final questionBookmarkProvider = FutureProvider.family<bool, String>((ref, questionId) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.isQuestionBookmarked(questionId);
});

/// Single resource bookmark state provider
final resourceBookmarkProvider = FutureProvider.family<bool, String>((ref, resourceId) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.isResourceBookmarked(resourceId);
});

