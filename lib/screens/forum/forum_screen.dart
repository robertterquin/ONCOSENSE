import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:cancerapp/models/question.dart';
import 'package:cancerapp/providers/forum_provider.dart';
import 'package:cancerapp/screens/forum/ask_question_screen.dart';
import 'package:cancerapp/screens/forum/question_detail_screen.dart';
import 'package:cancerapp/utils/theme.dart';

class ForumScreen extends ConsumerStatefulWidget {
  const ForumScreen({super.key});

  @override
  ConsumerState<ForumScreen> createState() => _ForumScreenState();
}

class _ForumScreenState extends ConsumerState<ForumScreen> with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  
  final _searchController = TextEditingController();
  Timer? _updateTimer;

  @override
  void initState() {
    super.initState();
    // Update time display every 10 seconds for responsive updates
    _updateTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      if (mounted) {
        setState(() {}); // Rebuild to update relative times
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _updateTimer?.cancel();
    super.dispose();
  }

  Future<void> _navigateToAskQuestion() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const AskQuestionScreen(),
      ),
    );

    if (result == true) {
      ref.read(forumQuestionsProvider.notifier).refresh();
    }
  }

  void _navigateToQuestionDetail(Question question) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => QuestionDetailScreen(
          questionId: question.id,
          initialQuestion: question, // Pass the question data for instant display
        ),
      ),
    );
    // Removed automatic reload on return - only reload when explicitly needed
  }

  void _onCategorySelected(String? category) {
    ref.read(forumQuestionsProvider.notifier).setCategory(category);
  }

  void _onSortChanged(String sortBy) {
    ref.read(forumQuestionsProvider.notifier).setSortBy(sortBy);
  }

  void _onSearchSubmitted() {
    ref.read(forumQuestionsProvider.notifier).setSearchQuery(
      _searchController.text.isEmpty ? null : _searchController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    
    final questionsAsync = ref.watch(forumQuestionsProvider);
    final notifier = ref.read(forumQuestionsProvider.notifier);
    final selectedCategory = notifier.currentCategory;
    final sortBy = notifier.currentSortBy;
    
    return Scaffold(
      backgroundColor: AppTheme.getSurfaceColor(context),
      body: CustomScrollView(
        clipBehavior: Clip.antiAlias,
        slivers: [
            const CustomAppHeader(
              title: 'Q&A Forum',
              subtitle: 'Ask questions, share experiences',
            ),
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: ElevatedButton.icon(
                      onPressed: _navigateToAskQuestion,
                      icon: const Icon(Icons.add),
                      label: const Text('Ask a Question'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFD81B60),
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Search discussions...',
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: () {
                                  _searchController.clear();
                                  _onSearchSubmitted();
                                },
                              )
                            : null,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onSubmitted: (_) => _onSearchSubmitted(),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: AppTheme.getCardColor(context),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.getDividerColor(context)),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String?>(
                                value: selectedCategory,
                                hint: Row(
                                  children: [
                                    Icon(Icons.category_outlined, size: 20, color: AppTheme.getSecondaryTextColor(context)),
                                    const SizedBox(width: 8),
                                    Text('All Categories', style: TextStyle(color: AppTheme.getSecondaryTextColor(context))),
                                  ],
                                ),
                                isExpanded: true,
                                dropdownColor: AppTheme.getCardColor(context),
                                icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFFD81B60)),
                                items: [
                                  DropdownMenuItem<String?>(
                                    value: null,
                                    child: Row(
                                      children: [
                                        Icon(Icons.category_outlined, size: 20, color: AppTheme.getSecondaryTextColor(context)),
                                        const SizedBox(width: 8),
                                        Text('All Categories', style: TextStyle(color: AppTheme.getTextColor(context))),
                                      ],
                                    ),
                                  ),
                                  ...ForumCategory.all.map((category) => DropdownMenuItem<String?>(
                                    value: category,
                                    child: Row(
                                      children: [
                                        Text(ForumCategory.getIcon(category), style: const TextStyle(fontSize: 18)),
                                        const SizedBox(width: 8),
                                        Text(category, style: TextStyle(color: AppTheme.getTextColor(context))),
                                      ],
                                    ),
                                  )),
                                ],
                                onChanged: (value) {
                                  _onCategorySelected(value);
                                },
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          decoration: BoxDecoration(
                            color: AppTheme.getCardColor(context),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.getDividerColor(context)),
                          ),
                          child: PopupMenuButton<String>(
                            icon: const Icon(Icons.sort, color: Color(0xFFD81B60)),
                            tooltip: 'Sort by',
                            color: AppTheme.getCardColor(context),
                            onSelected: _onSortChanged,
                            itemBuilder: (context) => [
                              PopupMenuItem(
                                value: 'recent',
                                child: Row(
                                  children: [
                                    Icon(Icons.access_time, size: 20, color: sortBy == 'recent' ? const Color(0xFFD81B60) : Colors.grey),
                                    const SizedBox(width: 8),
                                    Text('Most Recent', style: TextStyle(color: sortBy == 'recent' ? const Color(0xFFD81B60) : null)),
                                  ],
                                ),
                              ),
                              PopupMenuItem(
                                value: 'trending',
                                child: Row(
                                  children: [
                                    Icon(Icons.trending_up, size: 20, color: sortBy == 'trending' ? const Color(0xFFD81B60) : Colors.grey),
                                    const SizedBox(width: 8),
                                    Text('Trending', style: TextStyle(color: sortBy == 'trending' ? const Color(0xFFD81B60) : null)),
                                  ],
                                ),
                              ),
                              PopupMenuItem(
                                value: 'unanswered',
                                child: Row(
                                  children: [
                                    Icon(Icons.help_outline, size: 20, color: sortBy == 'unanswered' ? const Color(0xFFD81B60) : Colors.grey),
                                    const SizedBox(width: 8),
                                    Text('Unanswered', style: TextStyle(color: sortBy == 'unanswered' ? const Color(0xFFD81B60) : null)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Recent Discussions',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  const SizedBox(height: 12),
                  questionsAsync.when(
                    loading: () => const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: CircularProgressIndicator(color: Color(0xFFD81B60)),
                      ),
                    ),
                    error: (error, _) => Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Text('Error: $error'),
                      ),
                    ),
                    data: (questions) => questions.isEmpty
                        ? _buildEmptyState()
                        : Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: questions.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                return _buildDiscussionCard(questions[index]);
                              },
                            ),
                          ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ],
        ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(
              Icons.forum_outlined,
              size: 64,
              color: AppTheme.isDarkMode(context) ? Colors.grey[700] : Colors.grey[300],
            ),
            const SizedBox(height: 16),
            Text(
              _searchController.text.isNotEmpty
                  ? 'No questions found'
                  : 'No questions yet',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: AppTheme.getSecondaryTextColor(context),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _searchController.text.isNotEmpty
                  ? 'Try different search terms'
                  : 'Be the first to ask!',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.getSecondaryTextColor(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiscussionCard(Question question) {
    final isDark = AppTheme.isDarkMode(context);
    return InkWell(
      onTap: () => _navigateToQuestionDetail(question),
      borderRadius: BorderRadius.circular(12),
      child: Container(
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
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFCE4EC),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${ForumCategory.getIcon(question.category)} ${question.category}',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFD81B60),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              question.title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppTheme.getTextColor(context),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              question.content,
              style: TextStyle(
                fontSize: 12,
                color: AppTheme.getSecondaryTextColor(context),
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                // Profile Picture or Anonymous Icon
                _buildUserAvatar(question),
                const SizedBox(width: 6),
                Expanded(
                  child: Row(
                    children: [
                      Flexible(
                        child: Text(
                          question.displayName,
                          style: TextStyle(
                            fontSize: 11,
                            color: AppTheme.getSecondaryTextColor(context),
                            fontWeight: FontWeight.w500,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.message_outlined,
                          size: 14, color: AppTheme.getSecondaryTextColor(context)),
                      const SizedBox(width: 4),
                      Text(
                        '${question.answerCount}',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.getSecondaryTextColor(context),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.schedule, size: 14, color: AppTheme.getSecondaryTextColor(context)),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          question.relativeTime,
                          style: TextStyle(
                            fontSize: 11,
                            color: AppTheme.getSecondaryTextColor(context),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFCE4EC),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.thumb_up_outlined,
                          size: 12, color: Color(0xFFD81B60)),
                      const SizedBox(width: 2),
                      Text(
                        '${question.upvotes}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFFD81B60),
                          fontWeight: FontWeight.w600,
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
    );
  }

  Widget _buildUserAvatar(Question question) {
    final hasProfilePicture = !question.isAnonymous &&
        question.profilePictureUrl != null &&
        question.profilePictureUrl!.isNotEmpty;

    if (hasProfilePicture) {
      // Show profile picture with no child
      return CircleAvatar(
        radius: 10,
        backgroundColor: const Color(0xFFFCE4EC),
        backgroundImage: NetworkImage(question.profilePictureUrl!),
      );
    } else {
      // Show initials or anonymous icon
      return CircleAvatar(
        radius: 10,
        backgroundColor: question.isAnonymous
            ? const Color(0xFFE0E0E0)
            : const Color(0xFFFCE4EC),
        child: Text(
          question.isAnonymous
              ? '?'
              : (question.userName?.isNotEmpty == true
                  ? question.userName![0].toUpperCase()
                  : 'U'),
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: question.isAnonymous
                ? const Color(0xFF9E9E9E)
                : const Color(0xFFD81B60),
          ),
        ),
      );
    }
  }}