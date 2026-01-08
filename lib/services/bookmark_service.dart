import 'package:cancerapp/models/article.dart';
import 'package:cancerapp/models/question.dart';
import 'package:cancerapp/models/resource.dart';
import 'package:cancerapp/services/supabase_service.dart';

/// Service for managing bookmarked articles, questions, and resources using Supabase
/// Data persists across sessions and devices for logged-in users
class BookmarkService {
  final _supabase = SupabaseService();

  /// Get current user ID, returns null if not authenticated
  String? get _currentUserId => _supabase.currentUser?.id;

  /// Check if user is authenticated
  bool get _isAuthenticated => _supabase.isAuthenticated;

  // ==================== ARTICLE BOOKMARKS ====================

  /// Get all bookmarked articles from Supabase
  Future<List<Article>> getBookmarkedArticles() async {
    try {
      if (!_isAuthenticated || _currentUserId == null) {
        print('BookmarkService: User not authenticated, returning empty list');
        return [];
      }

      print('BookmarkService: Loading articles from Supabase...');
      
      final response = await _supabase.client
          .from('article_bookmarks')
          .select()
          .eq('user_id', _currentUserId!)
          .order('created_at', ascending: false);

      final articles = (response as List).map((data) {
        return Article(
          title: data['title'] ?? '',
          description: data['description'] ?? '',
          url: data['url'] ?? '',
          imageUrl: data['image_url'],
          publishedAt: data['published_at'] ?? '',
          sourceName: data['source_name'] ?? 'Unknown',
        );
      }).toList();

      print('BookmarkService: Loaded ${articles.length} articles from Supabase');
      return articles;
    } catch (e, stack) {
      print('Error loading bookmarked articles: $e');
      print('Stack trace: $stack');
      return [];
    }
  }

  /// Check if an article is bookmarked
  Future<bool> isBookmarked(String articleUrl) async {
    try {
      if (!_isAuthenticated || _currentUserId == null) return false;

      final response = await _supabase.client
          .from('article_bookmarks')
          .select('id')
          .eq('user_id', _currentUserId!)
          .eq('url', articleUrl)
          .maybeSingle();

      return response != null;
    } catch (e) {
      print('Error checking bookmark status: $e');
      return false;
    }
  }

  /// Add an article to bookmarks
  Future<bool> addBookmark(Article article) async {
    try {
      if (!_isAuthenticated || _currentUserId == null) {
        print('BookmarkService: Cannot bookmark - user not authenticated');
        return false;
      }

      // Check if already bookmarked
      if (await isBookmarked(article.url)) {
        print('BookmarkService: Article already bookmarked');
        return false;
      }

      await _supabase.client.from('article_bookmarks').insert({
        'user_id': _currentUserId,
        'title': article.title,
        'description': article.description,
        'url': article.url,
        'image_url': article.imageUrl,
        'published_at': article.publishedAt,
        'source_name': article.sourceName,
      });

      print('BookmarkService: Article bookmarked successfully');
      return true;
    } catch (e, stack) {
      print('Error adding bookmark: $e');
      print('Stack trace: $stack');
      return false;
    }
  }

  /// Remove an article from bookmarks
  Future<bool> removeBookmark(String articleUrl) async {
    try {
      if (!_isAuthenticated || _currentUserId == null) return false;

      await _supabase.client
          .from('article_bookmarks')
          .delete()
          .eq('user_id', _currentUserId!)
          .eq('url', articleUrl);

      print('BookmarkService: Article removed from bookmarks');
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

  /// Clear all article bookmarks
  Future<void> clearAllBookmarks() async {
    try {
      if (!_isAuthenticated || _currentUserId == null) return;

      await _supabase.client
          .from('article_bookmarks')
          .delete()
          .eq('user_id', _currentUserId!);
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

  /// Get all bookmarked questions from Supabase
  Future<List<Question>> getBookmarkedQuestions() async {
    try {
      if (!_isAuthenticated || _currentUserId == null) {
        print('BookmarkService: User not authenticated, returning empty list');
        return [];
      }

      print('BookmarkService: Loading questions from Supabase...');

      final response = await _supabase.client
          .from('question_bookmarks')
          .select()
          .eq('user_id', _currentUserId!)
          .order('created_at', ascending: false);

      final questions = (response as List).map((data) {
        return Question(
          id: data['question_id'] ?? '',
          title: data['title'] ?? '',
          content: data['content'] ?? '',
          category: data['category'] ?? '',
          userId: data['question_user_id'] ?? '',
          userName: data['question_user_name'],
          profilePictureUrl: data['profile_picture_url'],
          isAnonymous: data['is_anonymous'] ?? false,
          upvotes: data['upvotes'] ?? 0,
          answerCount: data['answer_count'] ?? 0,
          createdAt: DateTime.parse(data['question_created_at']),
          updatedAt: DateTime.parse(data['question_updated_at']),
          isResolved: data['is_resolved'] ?? false,
          tags: data['tags'] != null ? List<String>.from(data['tags']) : [],
        );
      }).toList();

      print('BookmarkService: Loaded ${questions.length} questions from Supabase');
      return questions;
    } catch (e, stack) {
      print('Error loading bookmarked questions: $e');
      print('Stack trace: $stack');
      return [];
    }
  }

  /// Check if a question is bookmarked
  Future<bool> isQuestionBookmarked(String questionId) async {
    try {
      if (!_isAuthenticated || _currentUserId == null) return false;

      final response = await _supabase.client
          .from('question_bookmarks')
          .select('id')
          .eq('user_id', _currentUserId!)
          .eq('question_id', questionId)
          .maybeSingle();

      return response != null;
    } catch (e) {
      print('Error checking question bookmark status: $e');
      return false;
    }
  }

  /// Add a question to bookmarks
  Future<bool> addQuestionBookmark(Question question) async {
    try {
      if (!_isAuthenticated || _currentUserId == null) {
        print('BookmarkService: Cannot bookmark - user not authenticated');
        return false;
      }

      // Check if already bookmarked
      if (await isQuestionBookmarked(question.id)) {
        print('BookmarkService: Question already bookmarked');
        return false;
      }

      await _supabase.client.from('question_bookmarks').insert({
        'user_id': _currentUserId,
        'question_id': question.id,
        'title': question.title,
        'content': question.content,
        'category': question.category,
        'question_user_id': question.userId,
        'question_user_name': question.userName,
        'profile_picture_url': question.profilePictureUrl,
        'is_anonymous': question.isAnonymous,
        'upvotes': question.upvotes,
        'answer_count': question.answerCount,
        'question_created_at': question.createdAt.toIso8601String(),
        'question_updated_at': question.updatedAt.toIso8601String(),
        'is_resolved': question.isResolved,
        'tags': question.tags,
      });

      print('BookmarkService: Question bookmarked successfully');
      return true;
    } catch (e, stack) {
      print('Error adding question bookmark: $e');
      print('Stack trace: $stack');
      return false;
    }
  }

  /// Remove a question from bookmarks
  Future<bool> removeQuestionBookmark(String questionId) async {
    try {
      if (!_isAuthenticated || _currentUserId == null) return false;

      await _supabase.client
          .from('question_bookmarks')
          .delete()
          .eq('user_id', _currentUserId!)
          .eq('question_id', questionId);

      print('BookmarkService: Question removed from bookmarks');
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
      if (!_isAuthenticated || _currentUserId == null) return;

      await _supabase.client
          .from('question_bookmarks')
          .delete()
          .eq('user_id', _currentUserId!);
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

  /// Get all bookmarked resources from Supabase
  Future<List<Resource>> getBookmarkedResources() async {
    try {
      if (!_isAuthenticated || _currentUserId == null) {
        print('BookmarkService: User not authenticated, returning empty list');
        return [];
      }

      print('BookmarkService: Loading resources from Supabase...');

      final response = await _supabase.client
          .from('resource_bookmarks')
          .select()
          .eq('user_id', _currentUserId!)
          .order('created_at', ascending: false);

      final resources = (response as List).map((data) {
        return Resource(
          id: data['resource_id'] ?? '',
          name: data['name'] ?? '',
          type: data['type'] ?? '',
          description: data['description'] ?? '',
          phone: data['phone'],
          location: data['location'],
          address: data['address'],
          website: data['website'],
          email: data['email'],
          isVerified: data['is_verified'] ?? false,
          isActive: data['is_active'] ?? true,
          createdAt: data['resource_created_at'] != null
              ? DateTime.parse(data['resource_created_at'])
              : DateTime.now(),
        );
      }).toList();

      print('BookmarkService: Loaded ${resources.length} resources from Supabase');
      return resources;
    } catch (e, stack) {
      print('Error loading bookmarked resources: $e');
      print('Stack trace: $stack');
      return [];
    }
  }

  /// Check if a resource is bookmarked
  Future<bool> isResourceBookmarked(String resourceId) async {
    try {
      if (!_isAuthenticated || _currentUserId == null) return false;

      final response = await _supabase.client
          .from('resource_bookmarks')
          .select('id')
          .eq('user_id', _currentUserId!)
          .eq('resource_id', resourceId)
          .maybeSingle();

      return response != null;
    } catch (e) {
      print('Error checking resource bookmark status: $e');
      return false;
    }
  }

  /// Add a resource to bookmarks
  Future<bool> addResourceBookmark(Resource resource) async {
    try {
      if (!_isAuthenticated || _currentUserId == null) {
        print('BookmarkService: Cannot bookmark - user not authenticated');
        return false;
      }

      // Check if already bookmarked
      if (await isResourceBookmarked(resource.id)) {
        print('BookmarkService: Resource already bookmarked');
        return false;
      }

      await _supabase.client.from('resource_bookmarks').insert({
        'user_id': _currentUserId,
        'resource_id': resource.id,
        'name': resource.name,
        'type': resource.type,
        'description': resource.description,
        'phone': resource.phone,
        'location': resource.location,
        'address': resource.address,
        'website': resource.website,
        'email': resource.email,
        'is_verified': resource.isVerified,
        'is_active': resource.isActive,
        'resource_created_at': resource.createdAt.toIso8601String(),
      });

      print('BookmarkService: Resource bookmarked successfully');
      return true;
    } catch (e, stack) {
      print('Error adding resource bookmark: $e');
      print('Stack trace: $stack');
      return false;
    }
  }

  /// Remove a resource from bookmarks
  Future<bool> removeResourceBookmark(String resourceId) async {
    try {
      if (!_isAuthenticated || _currentUserId == null) return false;

      await _supabase.client
          .from('resource_bookmarks')
          .delete()
          .eq('user_id', _currentUserId!)
          .eq('resource_id', resourceId);

      print('BookmarkService: Resource removed from bookmarks');
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
      if (!_isAuthenticated || _currentUserId == null) return;

      await _supabase.client
          .from('resource_bookmarks')
          .delete()
          .eq('user_id', _currentUserId!);
    } catch (e) {
      print('Error clearing resource bookmarks: $e');
    }
  }

  /// Get resource bookmark count
  Future<int> getResourceBookmarkCount() async {
    final bookmarks = await getBookmarkedResources();
    return bookmarks.length;
  }

  // ==================== UTILITIES ====================

  /// Get total bookmark count (articles + questions + resources)
  Future<int> getTotalBookmarkCount() async {
    final articles = await getBookmarkCount();
    final questions = await getQuestionBookmarkCount();
    final resources = await getResourceBookmarkCount();
    return articles + questions + resources;
  }
}
