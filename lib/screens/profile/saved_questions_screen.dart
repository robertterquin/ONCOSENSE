import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/models/question.dart';
import 'package:cancerapp/providers/bookmark_provider.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:cancerapp/screens/forum/question_detail_screen.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:intl/intl.dart';

class SavedQuestionsScreen extends ConsumerWidget {
  const SavedQuestionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedQuestionsAsync = ref.watch(bookmarkedQuestionsProvider);

    return Scaffold(
      backgroundColor: AppTheme.getBackgroundColor(context),
      body: CustomScrollView(
        slivers: [
          const CustomAppHeader(
            title: 'Saved Questions',
            subtitle: 'Your bookmarked forum discussions',
            showBackButton: true,
          ),
          savedQuestionsAsync.when(
            loading: () => const SliverFillRemaining(
              child: Center(
                child: CircularProgressIndicator(color: Color(0xFFD81B60)),
              ),
            ),
            error: (error, _) => SliverFillRemaining(
              child: Center(
                child: Text('Error loading saved questions: $error'),
              ),
            ),
            data: (savedQuestions) => savedQuestions.isEmpty
                ? SliverFillRemaining(child: _buildEmptyState(context))
                : SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildQuestionCard(context, ref, savedQuestions[index]),
                        ),
                        childCount: savedQuestions.length,
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Future<void> _removeBookmark(BuildContext context, WidgetRef ref, Question question) async {
    // Use the bookmark notifier - it handles invalidation automatically
    final notifier = ref.read(bookmarkNotifierProvider.notifier);
    await notifier.toggleQuestionBookmark(question);
    
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Question removed from bookmarks'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _openQuestion(BuildContext context, WidgetRef ref, Question question) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => QuestionDetailScreen(
          questionId: question.id,
          initialQuestion: question,
        ),
      ),
    );

    // Reload if the question was unbookmarked from detail screen
    if (result == true) {
      ref.invalidate(bookmarkedQuestionsProvider);
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        if (difference.inMinutes == 0) {
          return 'Just now';
        }
        return '${difference.inMinutes}m ago';
      }
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM d, yyyy').format(date);
    }
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              decoration: const BoxDecoration(
                color: Color(0xFFFCE4EC),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.bookmark_border_rounded,
                size: 80,
                color: Color(0xFFD81B60),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'No Saved Questions',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppTheme.getTextColor(context),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Questions you bookmark will appear here for easy access later.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: AppTheme.getSecondaryTextColor(context),
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.forum),
              label: const Text('Browse Q&A Forum'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD81B60),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuestionCard(BuildContext context, WidgetRef ref, Question question) {
    final isDark = AppTheme.isDarkMode(context);
    return InkWell(
      onTap: () => _openQuestion(context, ref, question),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.getCardColor(context),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.getDividerColor(context)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Category, Bookmark, Resolved Badge
              Row(
                children: [
                  // Category Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFCE4EC),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _getCategoryIcon(question.category),
                          size: 14,
                          color: const Color(0xFFD81B60),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          question.category,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFFD81B60),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),

                  // Resolved Badge
                  if (question.isResolved)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F5E9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.check_circle,
                            size: 12,
                            color: Color(0xFF4CAF50),
                          ),
                          const SizedBox(width: 4),
                          const Text(
                            'Resolved',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF4CAF50),
                            ),
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(width: 8),

                  // Bookmark Button
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.getCardColor(context),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.getDividerColor(context)),
                    ),
                    child: IconButton(
                      icon: const Icon(
                        Icons.bookmark,
                        color: Color(0xFFD81B60),
                        size: 20,
                      ),
                      onPressed: () => _removeBookmark(context, ref, question),
                      tooltip: 'Remove bookmark',
                      padding: const EdgeInsets.all(6),
                      constraints: const BoxConstraints(),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Question Title
              Text(
                question.title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.getTextColor(context),
                  height: 1.3,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),

              // Question Content Preview
              Text(
                question.content,
                style: TextStyle(
                  fontSize: 14,
                  color: AppTheme.getSecondaryTextColor(context),
                  height: 1.4,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),

              // Tags
              if (question.tags.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: question.tags.take(3).map((tag) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '#$tag',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey[700],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),

              // Footer: Author, Date, Stats
              Row(
                children: [
                  // Author Avatar & Name
                  if (!question.isAnonymous)
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 12,
                          backgroundColor: const Color(0xFFFCE4EC),
                          backgroundImage: question.profilePictureUrl != null
                              ? NetworkImage(question.profilePictureUrl!)
                              : null,
                          child: question.profilePictureUrl == null
                              ? Text(
                                  question.userName?.substring(0, 1).toUpperCase() ?? 'U',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    color: Color(0xFFD81B60),
                                    fontWeight: FontWeight.bold,
                                  ),
                                )
                              : null,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          question.userName ?? 'User',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[700],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    )
                  else
                    Row(
                      children: [
                        Icon(Icons.person_outline, size: 14, color: Colors.grey[600]),
                        const SizedBox(width: 4),
                        Text(
                          'Anonymous',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ),

                  const SizedBox(width: 8),
                  Text(
                    '•',
                    style: TextStyle(color: Colors.grey[400]),
                  ),
                  const SizedBox(width: 8),

                  // Date
                  Text(
                    _formatDate(question.createdAt),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),

                  const Spacer(),

                  // Answer Count
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: question.answerCount > 0
                          ? const Color(0xFFE8F5E9)
                          : Colors.grey[100],
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline,
                          size: 14,
                          color: question.answerCount > 0
                              ? const Color(0xFF4CAF50)
                              : Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${question.answerCount}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: question.answerCount > 0
                                ? const Color(0xFF4CAF50)
                                : Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: 8),

                  // Upvotes
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.arrow_upward,
                          size: 14,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${question.upvotes}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey[700],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'symptoms':
        return Icons.medical_services_outlined;
      case 'diagnosis':
        return Icons.science_outlined;
      case 'mental health':
        return Icons.psychology_outlined;
      case 'lifestyle':
        return Icons.fitness_center_outlined;
      case 'family support':
        return Icons.family_restroom_outlined;
      case 'treatment':
        return Icons.healing_outlined;
      case 'nutrition':
        return Icons.restaurant_outlined;
      default:
        return Icons.help_outline;
    }
  }
}
