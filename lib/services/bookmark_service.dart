import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cancerapp/models/article.dart';

/// Service for managing bookmarked articles using local storage
class BookmarkService {
  static const String _bookmarksKey = 'bookmarked_articles';

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
}
