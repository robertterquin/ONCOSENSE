import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/models/article.dart';
import 'package:cancerapp/providers/bookmark_provider.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:url_launcher/url_launcher.dart';

class SavedArticlesScreen extends ConsumerWidget {
  const SavedArticlesScreen({super.key});

  Future<void> _removeBookmark(WidgetRef ref, BuildContext context, Article article) async {
    // Get bookmark service from provider
    final bookmarkService = ref.read(bookmarkServiceProvider);
    final removed = await bookmarkService.removeBookmark(article.url);
    
    if (removed) {
      // Refresh the bookmarked articles list to show updated data
      ref.invalidate(bookmarkedArticlesProvider);
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Article removed from bookmarks'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }

  Future<void> _openArticle(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open article')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch the bookmarked articles provider - it handles loading/error/data automatically
    final articlesAsync = ref.watch(bookmarkedArticlesProvider);
    
    return Scaffold(
      backgroundColor: AppTheme.getSurfaceColor(context),
      body: CustomScrollView(
        slivers: [
          // Custom App Header matching main pages
          CustomAppHeader(
            title: 'Saved Articles',
            subtitle: 'Your bookmarked articles',
            showBackButton: true,
          ),

          // Provider automatically handles loading, error, and data states
          articlesAsync.when(
            loading: () => const SliverFillRemaining(
              child: Center(
                child: CircularProgressIndicator(
                  color: Color(0xFFD81B60),
                ),
              ),
            ),
            error: (error, stackTrace) => SliverFillRemaining(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 64,
                        color: Colors.red,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Error loading saved articles',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.getTextColor(context),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        error.toString(),
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppTheme.getSecondaryTextColor(context),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            data: (articles) => articles.isEmpty
                ? SliverFillRemaining(
                    child: _buildEmptyState(context),
                  )
                : SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final article = articles[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: _buildArticleCard(context, ref, article),
                          );
                        },
                        childCount: articles.length,
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
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
              decoration: BoxDecoration(
                color: const Color(0xFFFCE4EC),
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
              'No Saved Articles',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppTheme.getTextColor(context),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Articles you bookmark will appear here for easy access later.',
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
              icon: const Icon(Icons.explore),
              label: const Text('Explore Articles'),
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

  Widget _buildArticleCard(BuildContext context, WidgetRef ref, Article article) {
    final isDark = AppTheme.isDarkMode(context);
    return InkWell(
      onTap: () => _openArticle(context, article.url),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Section
            if (article.imageUrl != null && article.imageUrl!.isNotEmpty)
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                    child: Image.network(
                      article.imageUrl!,
                      width: double.infinity,
                      height: 180,
                      fit: BoxFit.cover,
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Container(
                          height: 180,
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Color(0xFFFCE4EC),
                                Color(0xFFF8BBD0),
                              ],
                            ),
                            borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(16),
                              topRight: Radius.circular(16),
                            ),
                          ),
                          child: Center(
                            child: CircularProgressIndicator(
                              value: loadingProgress.expectedTotalBytes != null
                                  ? loadingProgress.cumulativeBytesLoaded /
                                      loadingProgress.expectedTotalBytes!
                                  : null,
                              color: const Color(0xFFD81B60),
                            ),
                          ),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          height: 180,
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Color(0xFFFCE4EC),
                                Color(0xFFF8BBD0),
                              ],
                            ),
                            borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(16),
                              topRight: Radius.circular(16),
                            ),
                          ),
                          child: Center(
                            child: Icon(
                              Icons.article_rounded,
                              size: 64,
                              color: const Color(0xFFD81B60).withOpacity(0.3),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: IconButton(
                        icon: const Icon(
                          Icons.bookmark,
                          color: Color(0xFFD81B60),
                        ),
                        onPressed: () => _removeBookmark(ref, context, article),
                        tooltip: 'Remove bookmark',
                      ),
                    ),
                  ),
                ],
              ),

            // Content Section
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Source and Date
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFCE4EC),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          article.sourceName,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFFD81B60),
                          ),
                        ),
                      ),
                      const Spacer(),
                      Icon(
                        Icons.schedule,
                        size: 14,
                        color: AppTheme.getSecondaryTextColor(context),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        article.readTime,
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.getSecondaryTextColor(context),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Title
                  Text(
                    article.title,
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

                  // Description
                  Text(
                    article.description,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppTheme.getSecondaryTextColor(context),
                      height: 1.4,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),

                  // Actions
                  Row(
                    children: [
                      TextButton.icon(
                        onPressed: () => _openArticle(context, article.url),
                        icon: const Icon(Icons.open_in_new, size: 16),
                        label: const Text('Read Article'),
                        style: TextButton.styleFrom(
                          foregroundColor: const Color(0xFFD81B60),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                        ),
                      ),
                      const Spacer(),
                      TextButton.icon(
                        onPressed: () => _removeBookmark(ref, context, article),
                        icon: const Icon(Icons.bookmark_remove, size: 16),
                        label: const Text('Remove'),
                        style: TextButton.styleFrom(
                          foregroundColor: AppTheme.getSecondaryTextColor(context),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
