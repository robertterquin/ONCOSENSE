import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/models/question.dart';
import 'package:cancerapp/models/answer.dart';
import 'package:cancerapp/services/forum_service.dart';
import 'package:cancerapp/providers/bookmark_provider.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:cancerapp/utils/theme.dart';

class QuestionDetailScreen extends ConsumerStatefulWidget {
  final String questionId;
  final Question? initialQuestion; // Optional pre-loaded question data

  const QuestionDetailScreen({
    super.key,
    required this.questionId,
    this.initialQuestion,
  });

  @override
  ConsumerState<QuestionDetailScreen> createState() => _QuestionDetailScreenState();
}

class _QuestionDetailScreenState extends ConsumerState<QuestionDetailScreen> {
  final _forumService = ForumService();
  final _answerController = TextEditingController();
  
  Question? _question;
  List<Answer> _answers = [];
  bool _isLoading = true;
  bool _isSubmittingAnswer = false;
  bool _isAnonymous = false;
  bool _hasUpvotedQuestion = false;
  bool _isBookmarked = false;
  Set<String> _upvotedAnswers = {};

  @override
  void initState() {
    super.initState();
    _loadBookmarkStatus();
    // Use initial question data if provided for instant display
    if (widget.initialQuestion != null) {
      _question = widget.initialQuestion;
      _isLoading = false;
      _loadAnswersOnly(); // Load only answers in background
    } else {
      _loadQuestionAndAnswers();
    }
  }

  @override
  void dispose() {
    _answerController.dispose();
    super.dispose();
  }

  Future<void> _loadBookmarkStatus() async {
    final isBookmarked = await ref.read(questionBookmarkProvider(widget.questionId).future);
    if (mounted) {
      setState(() {
        _isBookmarked = isBookmarked;
      });
    }
  }

  Future<void> _toggleBookmark() async {
    if (_question == null) return;

    final wasBookmarked = _isBookmarked;
    setState(() {
      _isBookmarked = !wasBookmarked;
    });

    try {
      // Use the bookmark notifier - it handles invalidation automatically
      final notifier = ref.read(bookmarkNotifierProvider.notifier);
      final newStatus = await notifier.toggleQuestionBookmark(_question!);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              newStatus 
                  ? '✅ Question bookmarked!'
                  : 'Question removed from bookmarks',
            ),
            duration: const Duration(seconds: 2),
            backgroundColor: newStatus ? Colors.green : Colors.grey[700],
          ),
        );
      }
    } catch (e) {
      // Revert on error
      if (mounted) {
        setState(() {
          _isBookmarked = wasBookmarked;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _loadAnswersOnly() async {
    try {
      final answers = await _forumService.getAnswers(widget.questionId);
      final hasUpvoted = await _forumService.hasUpvotedQuestion(widget.questionId);
      
      // Check which answers user has upvoted
      final upvotedAnswers = <String>{};
      for (var answer in answers) {
        final hasUpvotedAnswer = await _forumService.hasUpvotedAnswer(answer.id);
        if (hasUpvotedAnswer) {
          upvotedAnswers.add(answer.id);
        }
      }

      if (mounted) {
        setState(() {
          _answers = answers;
          _hasUpvotedQuestion = hasUpvoted;
          _upvotedAnswers = upvotedAnswers;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading answers: $e')),
        );
      }
    }
  }

  Future<void> _loadQuestionAndAnswers() async {
    setState(() => _isLoading = true);
    
    try {
      final question = await _forumService.getQuestion(widget.questionId);
      final answers = await _forumService.getAnswers(widget.questionId);
      final hasUpvoted = await _forumService.hasUpvotedQuestion(widget.questionId);
      
      // Check which answers user has upvoted
      final upvotedAnswers = <String>{};
      for (var answer in answers) {
        final hasUpvotedAnswer = await _forumService.hasUpvotedAnswer(answer.id);
        if (hasUpvotedAnswer) {
          upvotedAnswers.add(answer.id);
        }
      }

      if (mounted) {
        setState(() {
          _question = question;
          _answers = answers;
          _hasUpvotedQuestion = hasUpvoted;
          _upvotedAnswers = upvotedAnswers;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading question: $e')),
        );
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _toggleQuestionUpvote() async {
    if (_question == null) return;
    
    // Optimistically update UI
    final wasUpvoted = _hasUpvotedQuestion;
    final previousUpvotes = _question!.upvotes;
    
    setState(() {
      _hasUpvotedQuestion = !wasUpvoted;
      _question = _question!.copyWith(
        upvotes: wasUpvoted ? previousUpvotes - 1 : previousUpvotes + 1,
      );
    });
    
    try {
      await _forumService.upvoteQuestion(widget.questionId);
    } catch (e) {
      // Revert on error
      if (mounted) {
        setState(() {
          _hasUpvotedQuestion = wasUpvoted;
          _question = _question!.copyWith(upvotes: previousUpvotes);
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _toggleAnswerUpvote(String answerId) async {
    // Find the answer
    final answerIndex = _answers.indexWhere((a) => a.id == answerId);
    if (answerIndex == -1) return;
    
    final answer = _answers[answerIndex];
    final wasUpvoted = _upvotedAnswers.contains(answerId);
    final previousUpvotes = answer.upvotes;
    
    // Optimistically update UI
    setState(() {
      if (wasUpvoted) {
        _upvotedAnswers.remove(answerId);
      } else {
        _upvotedAnswers.add(answerId);
      }
      _answers[answerIndex] = answer.copyWith(
        upvotes: wasUpvoted ? previousUpvotes - 1 : previousUpvotes + 1,
      );
    });
    
    try {
      await _forumService.upvoteAnswer(answerId);
    } catch (e) {
      // Revert on error
      if (mounted) {
        setState(() {
          if (wasUpvoted) {
            _upvotedAnswers.add(answerId);
          } else {
            _upvotedAnswers.remove(answerId);
          }
          _answers[answerIndex] = answer.copyWith(upvotes: previousUpvotes);
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _submitAnswer() async {
    if (_answerController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an answer')),
      );
      return;
    }

    setState(() => _isSubmittingAnswer = true);
    final answerContent = _answerController.text.trim();
    final wasAnonymous = _isAnonymous;

    try {
      final newAnswer = await _forumService.createAnswer(
        questionId: widget.questionId,
        content: answerContent,
        isAnonymous: wasAnonymous,
      );

      _answerController.clear();
      
      // Add the new answer locally and update question answer count
      if (mounted) {
        setState(() {
          _answers.add(newAnswer);
          _isAnonymous = false;
          if (_question != null) {
            _question = _question!.copyWith(
              answerCount: _question!.answerCount + 1,
            );
          }
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Answer posted successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Error posting answer: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmittingAnswer = false);
      }
    }
  }

  bool _isQuestionOwner() {
    final currentUser = _forumService.supabaseService.currentUser;
    return currentUser != null && _question?.userId == currentUser.id;
  }

  bool _isAnswerOwner(Answer answer) {
    final currentUser = _forumService.supabaseService.currentUser;
    return currentUser != null && answer.userId == currentUser.id;
  }

  Future<void> _deleteQuestion() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Question'),
        content: const Text(
          'Are you sure you want to delete this question? This action cannot be undone and will also delete all answers.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _forumService.deleteQuestion(widget.questionId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Question deleted successfully'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context, true); // Return to forum screen
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error deleting question: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _deleteAnswer(Answer answer) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Answer'),
        content: const Text(
          'Are you sure you want to delete this answer? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _forumService.deleteAnswer(answer.id, widget.questionId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Answer deleted successfully'),
              backgroundColor: Colors.green,
            ),
          );
          await _loadQuestionAndAnswers(); // Reload the page
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error deleting answer: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _showReportDialog() async {
    final reasons = [
      'Spam or misleading',
      'Inappropriate content',
      'Harmful medical advice',
      'Harassment or hate speech',
      'Other',
    ];

    String? selectedReason;
    final additionalInfoController = TextEditingController();

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Report Question'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Why are you reporting this?'),
                const SizedBox(height: 16),
                ...reasons.map((reason) => RadioListTile<String>(
                      title: Text(reason),
                      value: reason,
                      groupValue: selectedReason,
                      onChanged: (value) {
                        setDialogState(() => selectedReason = value);
                      },
                      activeColor: const Color(0xFFD81B60),
                    )),
                const SizedBox(height: 16),
                TextField(
                  controller: additionalInfoController,
                  decoration: const InputDecoration(
                    labelText: 'Additional information (optional)',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 3,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: selectedReason == null
                  ? null
                  : () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD81B60),
              ),
              child: const Text('Report'),
            ),
          ],
        ),
      ),
    );

    if (result == true && selectedReason != null) {
      try {
        await _forumService.reportContent(
          contentType: 'question',
          contentId: widget.questionId,
          reason: selectedReason!,
          additionalInfo: additionalInfoController.text,
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Report submitted. Thank you for helping keep our community safe.'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error submitting report: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.getSurfaceColor(context),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: Color(0xFFD81B60),
              ),
            )
          : _question == null
              ? const Center(child: Text('Question not found'))
              : CustomScrollView(
                  slivers: [
                    // Custom App Header matching other pages
                    CustomAppHeader(
                      title: 'Question Details',
                      subtitle: 'Discussion thread',
                      showBackButton: true,
                    ),
                    SliverToBoxAdapter(
                      child: Column(
                        children: [
                          const SizedBox(height: 16),
                          // Question Card
                          _buildQuestionCard(),
                          const SizedBox(height: 24),
                          
                          // Answers Section
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Row(
                              children: [
                                Text(
                                  '${_answers.length} ${_answers.length == 1 ? 'Answer' : 'Answers'}',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.getTextColor(context),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          
                          // Answers List
                          if (_answers.isEmpty)
                            Padding(
                              padding: const EdgeInsets.all(32),
                              child: Column(
                                children: [
                                  Icon(
                                    Icons.question_answer_outlined,
                                    size: 64,
                                    color: Colors.grey[300],
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'No answers yet',
                                    style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  const Text(
                                    'Be the first to answer!',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Color(0xFF757575),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          else
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: _answers.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 16),
                              itemBuilder: (context, index) {
                                return _buildAnswerCard(_answers[index]);
                              },
                            ),
                          const SizedBox(height: 100),
                        ],
                      ),
                    ),
                  ],
                ),
      bottomSheet: _buildAnswerInput(),
    );
  }

  Widget _buildQuestionCard() {
    final isDark = AppTheme.isDarkMode(context);
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.getCardColor(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.getDividerColor(context)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFCE4EC),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${ForumCategory.getIcon(_question!.category)} ${_question!.category}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFD81B60),
                  ),
                ),
              ),
              const Spacer(),
              // Bookmark button
              IconButton(
                icon: Icon(
                  _isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                  size: 20,
                ),
                onPressed: _toggleBookmark,
                color: _isBookmarked ? const Color(0xFFD81B60) : const Color(0xFF757575),
                tooltip: _isBookmarked ? 'Remove bookmark' : 'Bookmark question',
              ),
              if (_isQuestionOwner())
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 20),
                  onPressed: _deleteQuestion,
                  color: Colors.red,
                  tooltip: 'Delete question',
                ),
              IconButton(
                icon: const Icon(Icons.flag_outlined, size: 20),
                onPressed: _showReportDialog,
                color: const Color(0xFF757575),
                tooltip: 'Report question',
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _question!.title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.getTextColor(context),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _question!.content,
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.getSecondaryTextColor(context),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(Icons.person_outline, size: 14, color: Color(0xFF9E9E9E)),
              const SizedBox(width: 4),
              Text(
                _question!.displayName,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF9E9E9E),
                ),
              ),
              const SizedBox(width: 16),
              const Icon(Icons.schedule, size: 14, color: Color(0xFF9E9E9E)),
              const SizedBox(width: 4),
              Text(
                _question!.relativeTime,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF9E9E9E),
                ),
              ),
              const Spacer(),
              InkWell(
                onTap: _toggleQuestionUpvote,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _hasUpvotedQuestion 
                        ? const Color(0xFFFCE4EC) 
                        : AppTheme.getCardColor(context),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: _hasUpvotedQuestion
                          ? const Color(0xFFD81B60)
                          : AppTheme.getDividerColor(context),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _hasUpvotedQuestion 
                            ? Icons.thumb_up 
                            : Icons.thumb_up_outlined,
                        size: 14,
                        color: _hasUpvotedQuestion
                            ? const Color(0xFFD81B60)
                            : const Color(0xFF757575),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${_question!.upvotes}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: _hasUpvotedQuestion
                              ? const Color(0xFFD81B60)
                              : const Color(0xFF757575),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAnswerCard(Answer answer) {
    final hasUpvoted = _upvotedAnswers.contains(answer.id);
    final isDark = AppTheme.isDarkMode(context);
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: answer.isAccepted 
            ? (isDark ? const Color(0xFF1B3D2E) : const Color(0xFFF1F8F4))
            : AppTheme.getCardColor(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: answer.isAccepted 
              ? const Color(0xFF4CAF50) 
              : AppTheme.getDividerColor(context),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (answer.isAccepted)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF4CAF50),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle, size: 14, color: Colors.white),
                  SizedBox(width: 4),
                  Text(
                    'Best Answer',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          Text(
            answer.content,
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.getSecondaryTextColor(context),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.person_outline, size: 14, color: Color(0xFF9E9E9E)),
              const SizedBox(width: 4),
              Text(
                answer.displayName,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF9E9E9E),
                ),
              ),
              const SizedBox(width: 16),
              const Icon(Icons.schedule, size: 14, color: Color(0xFF9E9E9E)),
              const SizedBox(width: 4),
              Text(
                answer.relativeTime,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF9E9E9E),
                ),
              ),
              const Spacer(),
              if (_isAnswerOwner(answer))
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 16),
                  onPressed: () => _deleteAnswer(answer),
                  color: Colors.red,
                  tooltip: 'Delete answer',
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              if (_isAnswerOwner(answer))
                const SizedBox(width: 8),
              InkWell(
                onTap: () => _toggleAnswerUpvote(answer.id),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: hasUpvoted 
                        ? const Color(0xFFFCE4EC) 
                        : AppTheme.getCardColor(context),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: hasUpvoted
                          ? const Color(0xFFD81B60)
                          : AppTheme.getDividerColor(context),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        hasUpvoted ? Icons.thumb_up : Icons.thumb_up_outlined,
                        size: 14,
                        color: hasUpvoted
                            ? const Color(0xFFD81B60)
                            : const Color(0xFF757575),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${answer.upvotes}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: hasUpvoted
                              ? const Color(0xFFD81B60)
                              : const Color(0xFF757575),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAnswerInput() {
    final isDark = AppTheme.isDarkMode(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.getCardColor(context),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.3 : 0.05),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Checkbox(
                  value: _isAnonymous,
                  onChanged: (value) {
                    setState(() => _isAnonymous = value ?? false);
                  },
                  activeColor: const Color(0xFFD81B60),
                ),
                const Text(
                  'Post anonymously',
                  style: TextStyle(fontSize: 12),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _answerController,
                    decoration: InputDecoration(
                      hintText: 'Write your answer...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    maxLines: null,
                  ),
                ),
                const SizedBox(width: 8),
                _isSubmittingAnswer
                    ? const SizedBox(
                        width: 48,
                        height: 48,
                        child: Center(
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      )
                    : IconButton(
                        onPressed: _submitAnswer,
                        icon: const Icon(Icons.send),
                        color: const Color(0xFFD81B60),
                        iconSize: 28,
                      ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
