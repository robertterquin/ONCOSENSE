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
// STATE NOTIFIER - Manages bookmark mutations with automatic invalidation
// ============================================================================

/// Bookmark Notifier - Handles all bookmark add/remove/toggle operations
/// This automatically refreshes all dependent providers when bookmarks change
/// No need for manual ref.invalidate() in UI code
class BookmarkNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref ref;
  
  BookmarkNotifier(this.ref) : super(const AsyncValue.data(null));
  
  /// Toggle bookmark for an article - add if not bookmarked, remove if bookmarked
  Future<bool> toggleArticleBookmark(Article article) async {
    final bookmarkService = ref.read(bookmarkServiceProvider);
    final isBookmarked = await bookmarkService.toggleBookmark(article);
    
    // Automatically refresh all bookmark providers
    ref.invalidate(bookmarkedArticlesProvider);
    ref.invalidate(bookmarkedArticleUrlsProvider);
    ref.invalidate(articleBookmarkCountProvider);
    ref.invalidate(totalBookmarkCountProvider);
    
    return isBookmarked;
  }
  
  /// Add an article bookmark
  Future<void> addArticleBookmark(Article article) async {
    final bookmarkService = ref.read(bookmarkServiceProvider);
    await bookmarkService.addBookmark(article);
    
    // Automatically refresh all bookmark providers
    ref.invalidate(bookmarkedArticlesProvider);
    ref.invalidate(bookmarkedArticleUrlsProvider);
    ref.invalidate(articleBookmarkCountProvider);
    ref.invalidate(totalBookmarkCountProvider);
  }
  
  /// Remove an article bookmark
  Future<void> removeArticleBookmark(String articleUrl) async {
    final bookmarkService = ref.read(bookmarkServiceProvider);
    await bookmarkService.removeBookmark(articleUrl);
    
    // Automatically refresh all bookmark providers
    ref.invalidate(bookmarkedArticlesProvider);
    ref.invalidate(bookmarkedArticleUrlsProvider);
    ref.invalidate(articleBookmarkCountProvider);
    ref.invalidate(totalBookmarkCountProvider);
  }
  
  /// Toggle bookmark for a question
  Future<bool> toggleQuestionBookmark(Question question) async {
    final bookmarkService = ref.read(bookmarkServiceProvider);
    final isBookmarked = await bookmarkService.toggleQuestionBookmark(question);
    
    // Automatically refresh question bookmark providers
    ref.invalidate(bookmarkedQuestionsProvider);
    ref.invalidate(bookmarkedQuestionIdsProvider);
    ref.invalidate(questionBookmarkCountProvider);
    ref.invalidate(totalBookmarkCountProvider);
    
    return isBookmarked;
  }
  
  /// Toggle bookmark for a resource
  Future<bool> toggleResourceBookmark(Resource resource) async {
    final bookmarkService = ref.read(bookmarkServiceProvider);
    final isBookmarked = await bookmarkService.toggleResourceBookmark(resource);
    
    // Automatically refresh resource bookmark providers
    ref.invalidate(bookmarkedResourcesProvider);
    ref.invalidate(bookmarkedResourceIdsProvider);
    ref.invalidate(resourceBookmarkCountProvider);
    ref.invalidate(totalBookmarkCountProvider);
    
    return isBookmarked;
  }
}

/// Bookmark Notifier Provider - Use this for all bookmark mutations
/// Usage in UI: ref.read(bookmarkNotifierProvider.notifier).toggleArticleBookmark(article)
final bookmarkNotifierProvider = StateNotifierProvider<BookmarkNotifier, AsyncValue<void>>((ref) {
  return BookmarkNotifier(ref);
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

// ============================================================================
// LEVEL 3: Bookmark counts
// ============================================================================

/// Article bookmark count provider
/// Usage: ref.watch(articleBookmarkCountProvider)
final articleBookmarkCountProvider = FutureProvider<int>((ref) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.getBookmarkCount();
});

/// Question bookmark count provider
/// Usage: ref.watch(questionBookmarkCountProvider)
final questionBookmarkCountProvider = FutureProvider<int>((ref) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.getQuestionBookmarkCount();
});

/// Resource bookmark count provider
/// Usage: ref.watch(resourceBookmarkCountProvider)
final resourceBookmarkCountProvider = FutureProvider<int>((ref) async {
  final bookmarkService = ref.watch(bookmarkServiceProvider);
  return await bookmarkService.getResourceBookmarkCount();
});

/// Total bookmark count across all types
/// Usage: ref.watch(totalBookmarkCountProvider)
final totalBookmarkCountProvider = Provider<int>((ref) {
  final articlesAsync = ref.watch(articleBookmarkCountProvider);
  final questionsAsync = ref.watch(questionBookmarkCountProvider);
  final resourcesAsync = ref.watch(resourceBookmarkCountProvider);
  
  final articleCount = articlesAsync.value ?? 0;
  final questionCount = questionsAsync.value ?? 0;
  final resourceCount = resourcesAsync.value ?? 0;
  
  return articleCount + questionCount + resourceCount;
});

// ============================================================================
// LEVEL 4: Bookmarked Resource IDs (for efficient UI state)
// ============================================================================

/// Get all bookmarked article URLs as a Set for quick lookup
/// Usage: ref.watch(bookmarkedArticleUrlsProvider)
final bookmarkedArticleUrlsProvider = FutureProvider<Set<String>>((ref) async {
  final articles = await ref.watch(bookmarkedArticlesProvider.future);
  return articles.map((a) => a.url).toSet();
});

/// Get all bookmarked question IDs as a Set for quick lookup
/// Usage: ref.watch(bookmarkedQuestionIdsProvider)
final bookmarkedQuestionIdsProvider = FutureProvider<Set<String>>((ref) async {
  final questions = await ref.watch(bookmarkedQuestionsProvider.future);
  return questions.map((q) => q.id).toSet();
});

/// Get all bookmarked resource IDs as a Set for quick lookup
/// Usage: ref.watch(bookmarkedResourceIdsProvider)
final bookmarkedResourceIdsProvider = FutureProvider<Set<String>>((ref) async {
  final resources = await ref.watch(bookmarkedResourcesProvider.future);
  return resources.map((r) => r.id).toSet();
});
