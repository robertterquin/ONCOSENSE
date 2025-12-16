import 'package:flutter/material.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:cancerapp/models/question.dart';
import 'package:cancerapp/services/forum_service.dart';
import 'package:cancerapp/screens/forum/ask_question_screen.dart';
import 'package:cancerapp/screens/forum/question_detail_screen.dart';

class ForumScreen extends StatefulWidget {
  const ForumScreen({super.key});

  @override
  State<ForumScreen> createState() => _ForumScreenState();
}

class _ForumScreenState extends State<ForumScreen> {
  final _forumService = ForumService();
  final _searchController = TextEditingController();
  
  List<Question> _questions = [];
  bool _isLoading = true;
  String? _selectedCategory;
  String _sortBy = 'recent';

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadQuestions() async {
    setState(() => _isLoading = true);
    
    try {
      final questions = await _forumService.getQuestions(
        category: _selectedCategory,
        searchQuery: _searchController.text,
        sortBy: _sortBy,
      );

      if (mounted) {
        setState(() {
          _questions = questions;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading questions: $e')),
        );
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _navigateToAskQuestion() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const AskQuestionScreen(),
      ),
    );

    if (result == true) {
      _loadQuestions();
    }
  }

  void _navigateToQuestionDetail(String questionId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => QuestionDetailScreen(questionId: questionId),
      ),
    ).then((_) => _loadQuestions());
  }

  void _onCategorySelected(String? category) {
    setState(() {
      _selectedCategory = _selectedCategory == category ? null : category;
    });
    _loadQuestions();
  }

  void _onSortChanged(String sortBy) {
    setState(() => _sortBy = sortBy);
    _loadQuestions();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: CustomScrollView(
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
                                  _loadQuestions();
                                },
                              )
                            : null,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onSubmitted: (_) => _loadQuestions(),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Categories',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        PopupMenuButton<String>(
                          icon: const Icon(Icons.sort),
                          onSelected: _onSortChanged,
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              value: 'recent',
                              child: Text('Most Recent'),
                            ),
                            const PopupMenuItem(
                              value: 'trending',
                              child: Text('Trending'),
                            ),
                            const PopupMenuItem(
                              value: 'unanswered',
                              child: Text('Unanswered'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: ForumCategory.all
                          .map(
                            (category) => FilterChip(
                              label: Text(
                                '${ForumCategory.getIcon(category)} $category',
                              ),
                              selected: _selectedCategory == category,
                              onSelected: (_) => _onCategorySelected(category),
                              selectedColor: const Color(0xFFFCE4EC),
                              backgroundColor: Colors.white,
                              labelStyle: TextStyle(
                                color: _selectedCategory == category
                                    ? const Color(0xFFD81B60)
                                    : const Color(0xFF757575),
                              ),
                              side: BorderSide(
                                color: _selectedCategory == category
                                    ? const Color(0xFFD81B60)
                                    : const Color(0xFFE0E0E0),
                              ),
                            ),
                          )
                          .toList(),
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
                  _isLoading
                      ? const Padding(
                          padding: EdgeInsets.all(32),
                          child: Center(child: CircularProgressIndicator()),
                        )
                      : _questions.isEmpty
                          ? _buildEmptyState()
                          : Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: _questions.length,
                                separatorBuilder: (_, __) =>
                                    const SizedBox(height: 12),
                                itemBuilder: (context, index) {
                                  return _buildDiscussionCard(_questions[index]);
                                },
                              ),
                            ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Icon(
            Icons.forum_outlined,
            size: 64,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 16),
          Text(
            _searchController.text.isNotEmpty
                ? 'No questions found'
                : 'No questions yet',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchController.text.isNotEmpty
                ? 'Try different search terms'
                : 'Be the first to ask!',
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF757575),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDiscussionCard(Question question) {
    return InkWell(
      onTap: () => _navigateToQuestionDetail(question.id),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE0E0E0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
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
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF212121),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              question.content,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF757575),
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
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF9E9E9E),
                            fontWeight: FontWeight.w500,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Icon(Icons.message_outlined,
                          size: 14, color: Color(0xFF9E9E9E)),
                      const SizedBox(width: 4),
                      Text(
                        '${question.answerCount}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF9E9E9E),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Icon(Icons.schedule, size: 14, color: Color(0xFF9E9E9E)),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          question.relativeTime,
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF9E9E9E),
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