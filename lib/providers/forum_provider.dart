import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/forum_service.dart';
import 'package:cancerapp/models/question.dart';
import 'package:cancerapp/models/answer.dart';

// =============================================================================
// FORUM PROVIDERS - Questions, answers, and forum interactions
// =============================================================================

/// Base provider for ForumService access
final forumServiceProvider = Provider<ForumService>((ref) {
  return getIt<ForumService>();
});

/// All questions provider
/// Usage: ref.watch(questionsProvider)
final questionsProvider = FutureProvider<List<Question>>((ref) async {
  final forumService = ref.watch(forumServiceProvider);
  return await forumService.getQuestions();
});

/// Single question by ID
/// Usage: ref.watch(questionByIdProvider(questionId))
final questionByIdProvider = FutureProvider.family<Question?, String>((ref, questionId) async {
  final forumService = ref.watch(forumServiceProvider);
  return await forumService.getQuestion(questionId);
});

/// Answers for a specific question
/// Usage: ref.watch(answersProvider(questionId))
final answersProvider = FutureProvider.family<List<Answer>, String>((ref, questionId) async {
  final forumService = ref.watch(forumServiceProvider);
  return await forumService.getAnswers(questionId);
});

/// User questions provider (questions asked by current user)
/// Note: Uses client-side filtering since backend doesn't have a dedicated endpoint
/// Usage: ref.watch(userQuestionsProvider(userId))
final userQuestionsProvider = FutureProvider.family<List<Question>, String>((ref, userId) async {
  final forumService = ref.watch(forumServiceProvider);
  final allQuestions = await forumService.getQuestions();
  return allQuestions.where((q) => q.userId == userId).toList();
});

/// Check if user has upvoted a question
/// Usage: ref.watch(hasUpvotedQuestionProvider(questionId))
final hasUpvotedQuestionProvider = FutureProvider.family<bool, String>((ref, questionId) async {
  final forumService = ref.watch(forumServiceProvider);
  return await forumService.hasUpvotedQuestion(questionId);
});

/// Check if user has upvoted an answer
/// Usage: ref.watch(hasUpvotedAnswerProvider(answerId))
final hasUpvotedAnswerProvider = FutureProvider.family<bool, String>((ref, answerId) async {
  final forumService = ref.watch(forumServiceProvider);
  return await forumService.hasUpvotedAnswer(answerId);
});

/// Forum questions with management (StateNotifier for mutations)
final forumQuestionsProvider = StateNotifierProvider<ForumQuestionsNotifier, AsyncValue<List<Question>>>((ref) {
  return ForumQuestionsNotifier(ref);
});

class ForumQuestionsNotifier extends StateNotifier<AsyncValue<List<Question>>> {
  final Ref ref;
  String? _category;
  String? _searchQuery;
  String _sortBy = 'recent';
  
  ForumQuestionsNotifier(this.ref) : super(const AsyncValue.loading()) {
    _loadQuestions();
  }

  final ForumService _forumService = getIt<ForumService>();

  // Getters for current filter state
  String? get currentCategory => _category;
  String? get currentSearchQuery => _searchQuery;
  String get currentSortBy => _sortBy;

  Future<void> _loadQuestions() async {
    state = const AsyncValue.loading();
    try {
      final questions = await _forumService.getQuestions(
        category: _category,
        searchQuery: _searchQuery,
        sortBy: _sortBy,
      );
      state = AsyncValue.data(questions);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> refresh() async {
    await _loadQuestions();
  }

  void setCategory(String? category) {
    _category = category;
    _loadQuestions();
  }

  void setSearchQuery(String? query) {
    _searchQuery = query;
    _loadQuestions();
  }

  void setSortBy(String sortBy) {
    _sortBy = sortBy;
    _loadQuestions();
  }

  Future<void> submitQuestion({
    required String title,
    required String content,
    required String category,
    required bool isAnonymous,
  }) async {
    try {
      await _forumService.createQuestion(
        title: title,
        content: content,
        category: category,
        isAnonymous: isAnonymous,
      );
      await _loadQuestions();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> upvoteQuestion(String questionId) async {
    await _forumService.upvoteQuestion(questionId);
    await _loadQuestions();
  }
}

/// Answers manager for a specific question
class AnswersNotifier extends StateNotifier<AsyncValue<List<Answer>>> {
  final ForumService _forumService = getIt<ForumService>();
  final String questionId;
  
  AnswersNotifier(this.questionId) : super(const AsyncValue.loading()) {
    _loadAnswers();
  }

  Future<void> _loadAnswers() async {
    state = const AsyncValue.loading();
    try {
      final answers = await _forumService.getAnswers(questionId);
      state = AsyncValue.data(answers);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> refresh() async {
    await _loadAnswers();
  }

  Future<void> submitAnswer({
    required String content,
    required bool isAnonymous,
  }) async {
    await _forumService.createAnswer(
      questionId: questionId,
      content: content,
      isAnonymous: isAnonymous,
    );
    await _loadAnswers();
  }

  Future<void> upvoteAnswer(String answerId) async {
    await _forumService.upvoteAnswer(answerId);
    await _loadAnswers();
  }
}
