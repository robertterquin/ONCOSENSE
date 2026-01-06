import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/bookmark_service.dart';
import 'package:cancerapp/models/article.dart';
import 'package:cancerapp/models/question.dart';
import 'package:cancerapp/models/resource.dart';

// ============================================================================
// BOOKMARK PROVIDERS - Make bookmark data reactive for widgets
// ============================================================================
// These providers expose BookmarkService methods to the UI in a reactive way
// When bookmarks change, widgets automatically rebuild

/// LEVEL 0: Get the bookmark service itself
/// This is the foundation - it gives us access to all bookmark methods
/// Think of it as: "Get me the BookmarkService object"
final bookmarkServiceProvider = Provider<BookmarkService>((ref) {
  return getIt<BookmarkService>();  // Retrieves the service from storage
});

// ============================================================================
// LEVEL 1: Get ALL bookmarks of each type
// ============================================================================

/// Get all bookmarked ARTICLES
/// Usage: ref.watch(bookmarkedArticlesProvider)
/// Returns: List of Article objects the user saved
/// Use this when you need to show all saved articles
final bookmarkedArticlesProvider = FutureProvider<List<Article>>((ref) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);  // Get the service
  return await bookmarkService.getBookmarkedArticles();  // Call service method
});

/// Get all bookmarked QUESTIONS
/// Usage: ref.watch(bookmarkedQuestionsProvider)
/// Returns: List of Question objects the user saved
/// Use this when you need to show all saved questions
final bookmarkedQuestionsProvider = FutureProvider<List<Question>>((ref) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.getBookmarkedQuestions();
});

/// Get all bookmarked RESOURCES
/// Usage: ref.watch(bookmarkedResourcesProvider)
/// Returns: List of Resource objects the user saved
/// Use this when you need to show all saved resources
final bookmarkedResourcesProvider = FutureProvider<List<Resource>>((ref) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.getBookmarkedResources();
});

// ============================================================================
// LEVEL 2: Check if a SINGLE item is bookmarked
// ============================================================================
// These providers check one specific item at a time
// The ".family" modifier lets you pass parameters (like article URL)

/// Check if ONE article is bookmarked
/// Usage: ref.watch(articleBookmarkProvider(article.url))
/// Parameter: articleUrl - the URL of the article to check
/// Returns: true if bookmarked, false if not
/// Use this to show/hide a bookmark button on a single article
final articleBookmarkProvider = FutureProvider.family<bool, String>((ref, articleUrl) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.isBookmarked(articleUrl);  // Check if this specific URL is bookmarked
});

/// Check if ONE question is bookmarked
/// Usage: ref.watch(questionBookmarkProvider(question.id))
/// Parameter: questionId - the ID of the question to check
/// Returns: true if bookmarked, false if not
final questionBookmarkProvider = FutureProvider.family<bool, String>((ref, questionId) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.isQuestionBookmarked(questionId);
});

/// Check if ONE resource is bookmarked
/// Usage: ref.watch(resourceBookmarkProvider(resource.id))
/// Parameter: resourceId - the ID of the resource to check
/// Returns: true if bookmarked, false if not
final resourceBookmarkProvider = FutureProvider.family<bool, String>((ref, resourceId) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.isResourceBookmarked(resourceId);
});

