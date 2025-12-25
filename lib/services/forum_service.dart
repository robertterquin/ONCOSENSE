import 'package:cancerapp/models/question.dart';
import 'package:cancerapp/models/answer.dart';
import 'package:cancerapp/services/supabase_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Service for handling Q&A Forum operations with Supabase
class ForumService {
  final SupabaseService _supabase = SupabaseService();
  
  /// Get SupabaseService instance (for accessing current user)
  SupabaseService get supabaseService => _supabase;

  // ==================== QUESTIONS ====================

  /// Get all questions with optional filters
  Future<List<Question>> getQuestions({
    String? category,
    String? searchQuery,
    String sortBy = 'recent', // recent, trending, unanswered
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      // First, get questions
      dynamic query = _supabase.client
          .from('questions')
          .select('*');

      // Filter by category
      if (category != null && category.isNotEmpty) {
        query = query.eq('category', category);
      }

      // Search in title and content
      if (searchQuery != null && searchQuery.isNotEmpty) {
        query = query.or('title.ilike.%$searchQuery%,content.ilike.%$searchQuery%');
      }

      // Sort
      switch (sortBy) {
        case 'trending':
          query = query.order('upvotes', ascending: false);
          break;
        case 'unanswered':
          query = query.eq('answer_count', 0).order('created_at', ascending: false);
          break;
        case 'recent':
        default:
          query = query.order('created_at', ascending: false);
          break;
      }

      // Apply range limit at the end
      query = query.range(offset, offset + limit - 1);

      final response = await query;
      final questions = (response as List).map((json) {
        final question = Question.fromJson(json);
        
        // If user_name or profile_picture_url is null and not anonymous, 
        // fetch from current user if it's their question
        if (!question.isAnonymous && 
            (question.userName == null || question.profilePictureUrl == null)) {
          final currentUser = _supabase.currentUser;
          if (currentUser != null && currentUser.id == question.userId) {
            final metadata = _supabase.userMetadata;
            return question.copyWith(
              userName: question.userName ?? 
                       (metadata?['full_name'] as String? ?? 
                        metadata?['name'] as String? ?? 
                        currentUser.email?.split('@')[0]),
              profilePictureUrl: question.profilePictureUrl ?? 
                                metadata?['profile_picture_url'] as String?,
            );
          }
        }
        
        return question;
      }).toList();
      
      return questions;
    } catch (e) {
      print('❌ Error fetching questions: $e');
      rethrow;
    }
  }

  /// Get a single question by ID
  Future<Question?> getQuestion(String questionId) async {
    try {
      final response = await _supabase.client
          .from('questions')
          .select('*')
          .eq('id', questionId)
          .single();

      return Question.fromJson(response);
    } catch (e) {
      print('❌ Error fetching question: $e');
      return null;
    }
  }

  /// Create a new question
  Future<Question> createQuestion({
    required String title,
    required String content,
    required String category,
    required bool isAnonymous,
    List<String> tags = const [],
  }) async {
    try {
      final user = _supabase.currentUser;
      if (user == null) {
        throw Exception('User must be authenticated to post questions');
      }

      final userName = isAnonymous 
          ? null 
          : (_supabase.userMetadata?['full_name'] as String? ?? 
             _supabase.userMetadata?['name'] as String?);

      final profilePictureUrl = isAnonymous
          ? null
          : _supabase.userMetadata?['profile_picture_url'] as String?;

      final now = DateTime.now();
      final questionData = {
        'title': title,
        'content': content,
        'category': category,
        'user_id': user.id,
        'user_name': userName,
        'is_anonymous': isAnonymous,
        'upvotes': 0,
        'answer_count': 0,
        'created_at': now.toIso8601String(),
        'updated_at': now.toIso8601String(),
        'is_resolved': false,
        'tags': tags,
      };

      // Only add profile_picture_url if column exists and has a value
      if (profilePictureUrl != null) {
        questionData['profile_picture_url'] = profilePictureUrl;
      }

      final response = await _supabase.client
          .from('questions')
          .insert(questionData)
          .select()
          .single();

      return Question.fromJson(response);
    } catch (e) {
      print('❌ Error creating question: $e');
      rethrow;
    }
  }

  /// Update a question
  Future<Question> updateQuestion(String questionId, {
    String? title,
    String? content,
    String? category,
    bool? isResolved,
  }) async {
    try {
      final updateData = <String, dynamic>{
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (title != null) updateData['title'] = title;
      if (content != null) updateData['content'] = content;
      if (category != null) updateData['category'] = category;
      if (isResolved != null) updateData['is_resolved'] = isResolved;

      final response = await _supabase.client
          .from('questions')
          .update(updateData)
          .eq('id', questionId)
          .select()
          .single();

      return Question.fromJson(response);
    } catch (e) {
      print('❌ Error updating question: $e');
      rethrow;
    }
  }

  /// Delete a question
  Future<void> deleteQuestion(String questionId) async {
    try {
      await _supabase.client
          .from('questions')
          .delete()
          .eq('id', questionId);
    } catch (e) {
      print('❌ Error deleting question: $e');
      rethrow;
    }
  }

  /// Upvote a question
  Future<void> upvoteQuestion(String questionId) async {
    try {
      final user = _supabase.currentUser;
      if (user == null) throw Exception('User must be authenticated to upvote');

      // Check if user already upvoted
      final existingVote = await _supabase.client
          .from('question_votes')
          .select('id')
          .eq('question_id', questionId)
          .eq('user_id', user.id)
          .maybeSingle();

      if (existingVote != null) {
        // Remove upvote
        await _supabase.client
            .from('question_votes')
            .delete()
            .eq('question_id', questionId)
            .eq('user_id', user.id);

        // Decrement upvotes count
        await _supabase.client.rpc('decrement_question_upvotes', 
          params: {'question_id_param': questionId}
        );
      } else {
        // Add upvote
        await _supabase.client.from('question_votes').insert({
          'question_id': questionId,
          'user_id': user.id,
          'created_at': DateTime.now().toIso8601String(),
        });

        // Increment upvotes count
        await _supabase.client.rpc('increment_question_upvotes', 
          params: {'question_id_param': questionId}
        );
      }
    } catch (e) {
      print('❌ Error upvoting question: $e');
      rethrow;
    }
  }

  /// Check if current user has upvoted a question
  Future<bool> hasUpvotedQuestion(String questionId) async {
    try {
      final user = _supabase.currentUser;
      if (user == null) return false;

      final vote = await _supabase.client
          .from('question_votes')
          .select('id')
          .eq('question_id', questionId)
          .eq('user_id', user.id)
          .maybeSingle();

      return vote != null;
    } catch (e) {
      print('❌ Error checking question upvote: $e');
      return false;
    }
  }

  // ==================== ANSWERS ====================

  /// Get answers for a question
  Future<List<Answer>> getAnswers(String questionId) async {
    try {
      final response = await _supabase.client
          .from('answers')
          .select('*')
          .eq('question_id', questionId)
          .order('is_accepted', ascending: false)
          .order('upvotes', ascending: false)
          .order('created_at', ascending: false);

      return (response as List).map((json) => Answer.fromJson(json)).toList();
    } catch (e) {
      print('❌ Error fetching answers: $e');
      rethrow;
    }
  }

  /// Create a new answer
  Future<Answer> createAnswer({
    required String questionId,
    required String content,
    required bool isAnonymous,
    String? parentAnswerId,
  }) async {
    try {
      final user = _supabase.currentUser;
      if (user == null) {
        throw Exception('User must be authenticated to post answers');
      }

      final userName = isAnonymous 
          ? null 
          : _supabase.userMetadata?['name'] as String?;

      final now = DateTime.now();
      final answerData = {
        'question_id': questionId,
        'content': content,
        'user_id': user.id,
        'user_name': userName,
        'is_anonymous': isAnonymous,
        'upvotes': 0,
        'created_at': now.toIso8601String(),
        'updated_at': now.toIso8601String(),
        'is_accepted': false,
        'parent_answer_id': parentAnswerId,
      };

      final response = await _supabase.client
          .from('answers')
          .insert(answerData)
          .select()
          .single();

      // Increment answer count on question
      await _supabase.client.rpc('increment_answer_count', 
        params: {'question_id_param': questionId}
      );

      return Answer.fromJson(response);
    } catch (e) {
      print('❌ Error creating answer: $e');
      rethrow;
    }
  }

  /// Update an answer
  Future<Answer> updateAnswer(String answerId, String content) async {
    try {
      final updateData = {
        'content': content,
        'updated_at': DateTime.now().toIso8601String(),
      };

      final response = await _supabase.client
          .from('answers')
          .update(updateData)
          .eq('id', answerId)
          .select()
          .single();

      return Answer.fromJson(response);
    } catch (e) {
      print('❌ Error updating answer: $e');
      rethrow;
    }
  }

  /// Delete an answer
  Future<void> deleteAnswer(String answerId, String questionId) async {
    try {
      await _supabase.client
          .from('answers')
          .delete()
          .eq('id', answerId);

      // Decrement answer count on question
      await _supabase.client.rpc('decrement_answer_count', 
        params: {'question_id_param': questionId}
      );
    } catch (e) {
      print('❌ Error deleting answer: $e');
      rethrow;
    }
  }

  /// Mark answer as accepted (best answer)
  Future<void> acceptAnswer(String answerId, String questionId) async {
    try {
      // First, unaccept any currently accepted answer
      await _supabase.client
          .from('answers')
          .update({'is_accepted': false})
          .eq('question_id', questionId);

      // Mark this answer as accepted
      await _supabase.client
          .from('answers')
          .update({'is_accepted': true})
          .eq('id', answerId);
    } catch (e) {
      print('❌ Error accepting answer: $e');
      rethrow;
    }
  }

  /// Upvote an answer
  Future<void> upvoteAnswer(String answerId) async {
    try {
      final user = _supabase.currentUser;
      if (user == null) throw Exception('User must be authenticated to upvote');

      // Check if user already upvoted
      final existingVote = await _supabase.client
          .from('answer_votes')
          .select('id')
          .eq('answer_id', answerId)
          .eq('user_id', user.id)
          .maybeSingle();

      if (existingVote != null) {
        // Remove upvote
        await _supabase.client
            .from('answer_votes')
            .delete()
            .eq('answer_id', answerId)
            .eq('user_id', user.id);

        // Decrement upvotes count
        await _supabase.client.rpc('decrement_answer_upvotes', 
          params: {'answer_id_param': answerId}
        );
      } else {
        // Add upvote
        await _supabase.client.from('answer_votes').insert({
          'answer_id': answerId,
          'user_id': user.id,
          'created_at': DateTime.now().toIso8601String(),
        });

        // Increment upvotes count
        await _supabase.client.rpc('increment_answer_upvotes', 
          params: {'answer_id_param': answerId}
        );
      }
    } catch (e) {
      print('❌ Error upvoting answer: $e');
      rethrow;
    }
  }

  /// Check if current user has upvoted an answer
  Future<bool> hasUpvotedAnswer(String answerId) async {
    try {
      final user = _supabase.currentUser;
      if (user == null) return false;

      final vote = await _supabase.client
          .from('answer_votes')
          .select('id')
          .eq('answer_id', answerId)
          .eq('user_id', user.id)
          .maybeSingle();

      return vote != null;
    } catch (e) {
      print('❌ Error checking answer upvote: $e');
      return false;
    }
  }

  // ==================== REPORTS ====================

  /// Report a question or answer
  Future<void> reportContent({
    required String contentType, // 'question' or 'answer'
    required String contentId,
    required String reason,
    String? additionalInfo,
  }) async {
    try {
      final user = _supabase.currentUser;
      if (user == null) throw Exception('User must be authenticated to report');

      await _supabase.client.from('reports').insert({
        'content_type': contentType,
        'content_id': contentId,
        'user_id': user.id,
        'reason': reason,
        'additional_info': additionalInfo,
        'created_at': DateTime.now().toIso8601String(),
        'status': 'pending',
      });
    } catch (e) {
      print('❌ Error reporting content: $e');
      rethrow;
    }
  }
}
