import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cancerapp/models/article.dart';
import 'package:cancerapp/models/question.dart';
import 'package:cancerapp/models/resource.dart';

/// Service for managing bookmarked articles, questions, and resources using local storage
class BookmarkService {
  static const String _bookmarksKey = 'bookmarked_articles';
  static const String _questionsKey = 'bookmarked_questions';
  static const String _resourcesKey = 'bookmarked_resources';

  /// Get all bookmarked articles
  Future<List<Article>> getBookmarkedArticles() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final bookmarksJson = prefs.getString(_bookmarksKey);
      
      if (bookmarksJson == null) {
        return [];
      }

      final List<dynamic> bookmarksList = json.decode(bookmarksJson);
      return bookmarksList
          .map((json) => Article.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error loading bookmarked articles: $e');
      return [];
    }
  }

  /// Check if an article is bookmarked
  Future<bool> isBookmarked(String articleUrl) async {
    try {
      final bookmarks = await getBookmarkedArticles();
      return bookmarks.any((article) => article.url == articleUrl);
    } catch (e) {
      print('Error checking bookmark status: $e');
      return false;
    }
  }

  /// Add an article to bookmarks
  Future<bool> addBookmark(Article article) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final bookmarks = await getBookmarkedArticles();
      
      // Check if already bookmarked
      if (bookmarks.any((a) => a.url == article.url)) {
        return false; // Already bookmarked
      }

      // Add to bookmarks
      bookmarks.insert(0, article); // Add at the beginning
      
      // Save to storage
      final bookmarksJson = json.encode(
        bookmarks.map((a) => a.toJson()).toList(),
      );
      await prefs.setString(_bookmarksKey, bookmarksJson);
      
      return true;
    } catch (e) {
      print('Error adding bookmark: $e');
      return false;
    }
  }

  /// Remove an article from bookmarks
  Future<bool> removeBookmark(String articleUrl) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final bookmarks = await getBookmarkedArticles();
      
      // Remove the article
      bookmarks.removeWhere((article) => article.url == articleUrl);
      
      // Save to storage
      final bookmarksJson = json.encode(
        bookmarks.map((a) => a.toJson()).toList(),
      );
      await prefs.setString(_bookmarksKey, bookmarksJson);
      
      return true;
    } catch (e) {
      print('Error removing bookmark: $e');
      return false;
    }
  }

  /// Toggle bookmark status
  Future<bool> toggleBookmark(Article article) async {
    final isCurrentlyBookmarked = await isBookmarked(article.url);
    
    if (isCurrentlyBookmarked) {
      await removeBookmark(article.url);
      return false; // Now not bookmarked
    } else {
      await addBookmark(article);
      return true; // Now bookmarked
    }
  }

  /// Clear all bookmarks
  Future<void> clearAllBookmarks() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_bookmarksKey);
    } catch (e) {
      print('Error clearing bookmarks: $e');
    }
  }

  /// Get bookmark count
  Future<int> getBookmarkCount() async {
    final bookmarks = await getBookmarkedArticles();
    return bookmarks.length;
  }

  // ==================== QUESTION BOOKMARKS ====================

  /// Get all bookmarked questions
  Future<List<Question>> getBookmarkedQuestions() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final questionsJson = prefs.getString(_questionsKey);
      
      if (questionsJson == null) {
        return [];
      }

      final List<dynamic> questionsList = json.decode(questionsJson);
      return questionsList
          .map((json) => Question.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error loading bookmarked questions: $e');
      return [];
    }
  }

  /// Check if a question is bookmarked
  Future<bool> isQuestionBookmarked(String questionId) async {
    try {
      final bookmarks = await getBookmarkedQuestions();
      return bookmarks.any((question) => question.id == questionId);
    } catch (e) {
      print('Error checking question bookmark status: $e');
      return false;
    }
  }

  /// Add a question to bookmarks
  Future<bool> addQuestionBookmark(Question question) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final bookmarks = await getBookmarkedQuestions();
      
      // Check if already bookmarked
      if (bookmarks.any((q) => q.id == question.id)) {
        return false; // Already bookmarked
      }

      // Add to bookmarks
      bookmarks.insert(0, question); // Add at the beginning
      
      // Save to storage
      final bookmarksJson = json.encode(
        bookmarks.map((q) => q.toJson()).toList(),
      );
      await prefs.setString(_questionsKey, bookmarksJson);
      
      return true;
    } catch (e) {
      print('Error adding question bookmark: $e');
      return false;
    }
  }

  /// Remove a question from bookmarks
  Future<bool> removeQuestionBookmark(String questionId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final bookmarks = await getBookmarkedQuestions();
      
      // Remove the question
      bookmarks.removeWhere((question) => question.id == questionId);
      
      // Save to storage
      final bookmarksJson = json.encode(
        bookmarks.map((q) => q.toJson()).toList(),
      );
      await prefs.setString(_questionsKey, bookmarksJson);
      
      return true;
    } catch (e) {
      print('Error removing question bookmark: $e');
      return false;
    }
  }

  /// Toggle question bookmark status
  Future<bool> toggleQuestionBookmark(Question question) async {
    final isCurrentlyBookmarked = await isQuestionBookmarked(question.id);
    
    if (isCurrentlyBookmarked) {
      await removeQuestionBookmark(question.id);
      return false; // Now not bookmarked
    } else {
      await addQuestionBookmark(question);
      return true; // Now bookmarked
    }
  }

  /// Clear all question bookmarks
  Future<void> clearAllQuestionBookmarks() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_questionsKey);
    } catch (e) {
      print('Error clearing question bookmarks: $e');
    }
  }

  /// Get question bookmark count
  Future<int> getQuestionBookmarkCount() async {
    final bookmarks = await getBookmarkedQuestions();
    return bookmarks.length;
  }

  // ==================== RESOURCE BOOKMARKS ====================

  /// Get all bookmarked resources
  Future<List<Resource>> getBookmarkedResources() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final resourcesJson = prefs.getString(_resourcesKey);
      
      if (resourcesJson == null) {
        return [];
      }

      final List<dynamic> resourcesList = json.decode(resourcesJson);
      return resourcesList
          .map((json) => Resource.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error loading bookmarked resources: $e');
      return [];
    }
  }

  /// Check if a resource is bookmarked
  Future<bool> isResourceBookmarked(String resourceId) async {
    try {
      final bookmarks = await getBookmarkedResources();
      return bookmarks.any((resource) => resource.id == resourceId);
    } catch (e) {
      print('Error checking resource bookmark status: $e');
      return false;
    }
  }

  /// Add a resource to bookmarks
  Future<bool> addResourceBookmark(Resource resource) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final bookmarks = await getBookmarkedResources();
      
      // Check if already bookmarked
      if (bookmarks.any((r) => r.id == resource.id)) {
        return false; // Already bookmarked
      }

      // Add to bookmarks
      bookmarks.insert(0, resource); // Add at the beginning
      
      // Save to storage
      final bookmarksJson = json.encode(
        bookmarks.map((r) => r.toJson()).toList(),
      );
      await prefs.setString(_resourcesKey, bookmarksJson);
      
      return true;
    } catch (e) {
      print('Error adding resource bookmark: $e');
      return false;
    }
  }

  /// Remove a resource from bookmarks
  Future<bool> removeResourceBookmark(String resourceId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final bookmarks = await getBookmarkedResources();
      
      // Remove the resource
      bookmarks.removeWhere((resource) => resource.id == resourceId);
      
      // Save to storage
      final bookmarksJson = json.encode(
        bookmarks.map((r) => r.toJson()).toList(),
      );
      await prefs.setString(_resourcesKey, bookmarksJson);
      
      return true;
    } catch (e) {
      print('Error removing resource bookmark: $e');
      return false;
    }
  }

  /// Toggle resource bookmark status
  Future<bool> toggleResourceBookmark(Resource resource) async {
    final isCurrentlyBookmarked = await isResourceBookmarked(resource.id);
    
    if (isCurrentlyBookmarked) {
      await removeResourceBookmark(resource.id);
      return false; // Now not bookmarked
    } else {
      await addResourceBookmark(resource);
      return true; // Now bookmarked
    }
  }

  /// Clear all resource bookmarks
  Future<void> clearAllResourceBookmarks() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_resourcesKey);
    } catch (e) {
      print('Error clearing resource bookmarks: $e');
    }
  }

  /// Get resource bookmark count
  Future<int> getResourceBookmarkCount() async {
    final bookmarks = await getBookmarkedResources();
    return bookmarks.length;
  }
}
