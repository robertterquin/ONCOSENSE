import 'package:flutter/material.dart';
import 'package:cancerapp/services/supabase_service.dart';
import 'package:cancerapp/services/gnews_service.dart';
import 'package:cancerapp/services/health_tips_service.dart';
import 'package:cancerapp/services/health_reminders_service.dart';
import 'package:cancerapp/services/bookmark_service.dart';
import 'package:cancerapp/services/notification_storage_service.dart';
import 'package:cancerapp/services/notification_service.dart';
import 'package:cancerapp/models/article.dart';
import 'package:cancerapp/models/health_tip.dart';
import 'package:cancerapp/models/health_reminder.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cancerapp/screens/profile/profile_screen.dart';
import 'package:cancerapp/screens/notifications/notification_center_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true; // Keep state when navigating away
  
  final supabase = SupabaseService();
  final gNewsService = GNewsService();
  final healthRemindersService = HealthRemindersService();
  final _bookmarkService = BookmarkService();
  final _notificationStorageService = NotificationStorageService();
  final _notificationService = NotificationService();
  String userName = 'Guest';
  String? profilePictureUrl;
  String? currentUserId;
  List<Article> articles = [];
  List<HealthReminder> healthReminders = [];
  Article? survivorStory;
  bool isLoadingArticles = true;
  bool isLoadingReminders = true;
  bool isLoadingSurvivorStory = true;
  HealthTip dailyTip = HealthTipsService.getTipOfTheDay();
  Map<String, bool> _bookmarkStates = {};
  int _unreadNotificationCount = 0;

  // Get current month's cancer awareness information
  Map<String, String> _getAwarenessMonth() {
    final month = DateTime.now().month;
    const awarenessList = {
      1: {'emoji': '🎗️', 'month': 'January', 'title': 'Cervical Cancer', 'subtitle': 'Know the signs and prevention methods'},
      2: {'emoji': '🛡️', 'month': 'February', 'title': 'Cancer Prevention', 'subtitle': 'Healthy habits reduce your risk'},
      3: {'emoji': '🎗️', 'month': 'March', 'title': 'Colorectal Cancer', 'subtitle': 'Early screening saves lives'},
      4: {'emoji': '💪', 'month': 'April', 'title': 'Testicular Cancer', 'subtitle': 'Self-checks are important'},
      5: {'emoji': '☀️', 'month': 'May', 'title': 'Skin Cancer', 'subtitle': 'Protect yourself from UV rays'},
      6: {'emoji': '🧠', 'month': 'June', 'title': 'Brain Tumor', 'subtitle': 'Awareness and early detection'},
      7: {'emoji': '👩', 'month': 'July', 'title': 'Ovarian Cancer', 'subtitle': 'Know the symptoms'},
      8: {'emoji': '🗣️', 'month': 'August', 'title': 'Head & Neck Cancer', 'subtitle': 'Screening and prevention'},
      9: {'emoji': '👩', 'month': 'September', 'title': 'Ovarian Cancer', 'subtitle': 'Support and awareness'},
      10: {'emoji': '💗', 'month': 'October', 'title': 'Breast Cancer', 'subtitle': 'Early detection matters'},
      11: {'emoji': '💨', 'month': 'November', 'title': 'Lung Cancer', 'subtitle': 'Learn about prevention'},
      12: {'emoji': '🎗️', 'month': 'December', 'title': 'National Cancer', 'subtitle': 'Learn about early detection & prevention'},
    };
    
    return awarenessList[month] ?? awarenessList[12]!;
  }
  
  @override
  void initState() {
    super.initState();
    _loadUserData();
    _loadArticles();
    _loadSurvivorStory();
    _loadHealthReminders(forceRefresh: true); // Force new reminders on app start
    _loadNotificationCount();
    _notificationStorageService.addListener(_onNotificationChange);
  }

  @override
  void dispose() {
    _notificationStorageService.removeListener(_onNotificationChange);
    super.dispose();
  }

  void _onNotificationChange() {
    _loadNotificationCount();
  }

  Future<void> _loadNotificationCount() async {
    await _notificationStorageService.initialize();
    if (mounted) {
      setState(() {
        _unreadNotificationCount = _notificationStorageService.unreadCount;
      });
    }
    
    // Add sample notifications for demo (only if empty)
    if (_notificationStorageService.notifications.isEmpty) {
      await _addSampleNotifications();
    }
  }

  // Add some sample notifications for demonstration
  Future<void> _addSampleNotifications() async {
    final sampleNotifications = [
      {
        'title': '💡 Daily Health Tip',
        'body': 'Drink at least 8 glasses of water daily to help reduce cancer risk and maintain overall health.',
        'type': 'health_tip',
      },
      {
        'title': '💧 Hydration Reminder',
        'body': 'Time to drink water! Stay hydrated throughout the day.',
        'type': 'hydration',
      },
      {
        'title': '🚶 Movement Reminder',
        'body': 'Take a 5-minute walk break. Regular movement helps reduce cancer risk!',
        'type': 'movement',
      },
    ];

    for (final notification in sampleNotifications) {
      await _notificationStorageService.addNotificationFromData(
        title: notification['title']!,
        body: notification['body']!,
        type: notification['type']!,
      );
    }

    if (mounted) {
      setState(() {
        _unreadNotificationCount = _notificationStorageService.unreadCount;
      });
    }
  }

  void _loadUserData() {
    final user = supabase.currentUser;
    if (user != null) {
      final newUserId = user.id;
      final userChanged = currentUserId != newUserId;
      
      setState(() {
        userName = user.userMetadata?['full_name'] ?? user.email?.split('@')[0] ?? 'User';
        profilePictureUrl = user.userMetadata?['profile_picture_url'];
        currentUserId = newUserId;
      });
      
      // Refresh reminders when user logs in or changes
      if (userChanged) {
        _loadHealthReminders(forceRefresh: true);
      }
    } else {
      setState(() {
        userName = 'Guest';
        profilePictureUrl = null;
        currentUserId = null;
      });
    }
  }

  Future<void> _loadArticles() async {
    try {
      final fetchedArticles = await gNewsService.fetchCancerArticles(maxResults: 3);
      setState(() {
        articles = fetchedArticles;
        isLoadingArticles = false;
      });
      
      // Load bookmark states for all articles
      await _loadBookmarkStates();
    } catch (e) {
      setState(() {
        isLoadingArticles = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load articles: $e')),
        );
      }
    }
  }

  Future<void> _loadBookmarkStates() async {
    final states = <String, bool>{};
    for (final article in articles) {
      states[article.url] = await _bookmarkService.isBookmarked(article.url);
    }
    if (survivorStory != null) {
      states[survivorStory!.url] = await _bookmarkService.isBookmarked(survivorStory!.url);
    }
    setState(() {
      _bookmarkStates = states;
    });
  }

  Future<void> _toggleBookmark(Article article) async {
    final isBookmarked = await _bookmarkService.toggleBookmark(article);
    
    setState(() {
      _bookmarkStates[article.url] = isBookmarked;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isBookmarked 
                ? 'Article saved to bookmarks' 
                : 'Article removed from bookmarks',
          ),
          duration: const Duration(seconds: 2),
          action: SnackBarAction(
            label: 'View',
            textColor: Colors.white,
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ProfileScreen(),
                ),
              );
            },
          ),
        ),
      );
    }
  }

  Future<void> _loadSurvivorStory() async {
    try {
      // Fetch articles with survivor story filters - prioritize Filipino stories
      final stories = await gNewsService.fetchCancerArticles(
        maxResults: 5,
        query: '"cancer survivor" OR "cancer journey" OR "cancer recovery story" OR "beating cancer" OR "Filipino cancer survivor" OR "Pinoy cancer fighter"',
      );
      
      if (stories.isNotEmpty) {
        setState(() {
          survivorStory = stories.first;
          isLoadingSurvivorStory = false;
        });
      } else {
        setState(() {
          isLoadingSurvivorStory = false;
        });
      }
    } catch (e) {
      setState(() {
        isLoadingSurvivorStory = false;
      });
      print('Error loading survivor story: $e');
    }
  }

  Future<void> _loadHealthReminders({bool forceRefresh = false}) async {
    try {
      final reminders = await healthRemindersService.getRemindersToShow(count: 2, forceRefresh: forceRefresh);
      setState(() {
        healthReminders = reminders;
        isLoadingReminders = false;
      });
    } catch (e) {
      setState(() {
        isLoadingReminders = false;
      });
      print('Error loading health reminders: $e');
    }
  }

  Future<void> _openArticle(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open article')),
        );
      }
    }
  }

  // For testing: Send test notification and store it
  Future<void> _sendTestNotification() async {
    await _notificationService.showTestNotification();
    await _loadNotificationCount();
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ Test notification sent! Check the notification center.'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    final topPadding = MediaQuery.of(context).padding.top;
    
    return Scaffold(
      backgroundColor: AppTheme.getSurfaceColor(context),
      body: CustomScrollView(
        clipBehavior: Clip.antiAlias,
        slivers: [
          // App Bar with custom design
          SliverAppBar(
            floating: true,
            pinned: false,
            expandedHeight: 85 + topPadding,
            collapsedHeight: 85 + topPadding,
            toolbarHeight: 85 + topPadding,
            backgroundColor: const Color(0xFFD81B60),
            elevation: 0,
            automaticallyImplyLeading: false,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            flexibleSpace: ClipRRect(
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
              child: Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color(0xFFD81B60),
                      Color(0xFFE91E63),
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFD81B60).withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // Decorative circles
                    Positioned(
                      right: -30,
                      top: -30,
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.1),
                        ),
                      ),
                    ),
                    Positioned(
                      left: -20,
                      bottom: -20,
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.08),
                        ),
                      ),
                    ),
                    // Pink ribbon decoration
                    Positioned(
                      right: 70,
                      top: topPadding + 10,
                      child: Icon(
                        Icons.favorite,
                        color: Colors.white.withOpacity(0.15),
                        size: 40,
                      ),
                    ),
                    // Content - positioned to avoid SafeArea overlap
                    Positioned(
                      left: 20,
                      right: 20,
                      top: topPadding + 12,
                      bottom: 12,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Flexible(
                                  child: Text(
                                    'Hello, $userName 👋',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 0.3,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  'Your wellness journey starts here',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.9),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 6),
                                // Decorative line
                                Container(
                                  width: 40,
                                  height: 2,
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.8),
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          // Notification Bell Icon
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const NotificationCenterScreen(),
                                ),
                              ).then((_) {
                                _loadNotificationCount();
                              });
                            },
                            onLongPress: () {
                              _sendTestNotification();
                            },
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white.withOpacity(0.2),
                              ),
                              child: Stack(
                                children: [
                                  const Center(
                                    child: Icon(
                                      Icons.notifications_outlined,
                                      color: Colors.white,
                                      size: 24,
                                    ),
                                  ),
                                  if (_unreadNotificationCount > 0)
                                    Positioned(
                                      right: 6,
                                      top: 6,
                                      child: Container(
                                        padding: const EdgeInsets.all(4),
                                        decoration: const BoxDecoration(
                                          color: Colors.redAccent,
                                          shape: BoxShape.circle,
                                        ),
                                        constraints: const BoxConstraints(
                                          minWidth: 18,
                                          minHeight: 18,
                                        ),
                                        child: Center(
                                          child: Text(
                                            _unreadNotificationCount > 9
                                                ? '9+'
                                                : '$_unreadNotificationCount',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Profile Icon
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const ProfileScreen(),
                                ),
                              ).then((_) {
                                _loadUserData();
                                _loadHealthReminders(forceRefresh: true); // Refresh reminders on return
                              });
                            },
                            child: Container(
                              width: 45,
                              height: 45,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white,
                                border: Border.all(
                                  color: Colors.white.withOpacity(0.3),
                                  width: 3,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: ClipOval(
                                child: profilePictureUrl != null
                                    ? Image.network(
                                        profilePictureUrl!,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) {
                                          return const Icon(
                                            Icons.person,
                                            color: Color(0xFFD81B60),
                                            size: 24,
                                          );
                                        },
                                      )
                                    : const Icon(
                                        Icons.person,
                                        color: Color(0xFFD81B60),
                                        size: 24,
                                      ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

            // Content
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),

                  // Daily Health Tip
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _buildDailyTipCard(),
                  ),

                  const SizedBox(height: 20),

                  // Awareness Month Banner
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _buildAwarenessBanner(),
                  ),

                  const SizedBox(height: 24),

                  // Health Reminders Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Health Reminders',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.getTextColor(context),
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            setState(() {
                              isLoadingReminders = true;
                            });
                            _loadHealthReminders(forceRefresh: true);
                          },
                          icon: const Icon(
                            Icons.refresh,
                            color: Color(0xFFD81B60),
                            size: 20,
                          ),
                          tooltip: 'Refresh reminders',
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Health Reminders List
                  isLoadingReminders
                      ? const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 16),
                          child: Center(
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      : healthReminders.isEmpty
                          ? const SizedBox.shrink()
                          : Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Column(
                                children: healthReminders.map((reminder) {
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 8),
                                    child: _buildHealthReminderCard(
                                      icon: _getIconData(reminder.icon),
                                      title: reminder.title,
                                      message: reminder.message,
                                      color: _getColorFromHex(reminder.color),
                                      reminder: reminder,
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),

                  const SizedBox(height: 24),

                  // Survivor Story Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Inspiring Stories',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.getTextColor(context),
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            // TODO: Navigate to all stories
                          },
                          child: const Text(
                            'See All',
                            style: TextStyle(
                              color: Color(0xFFD81B60),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: isLoadingSurvivorStory
                        ? const Center(
                            child: Padding(
                              padding: EdgeInsets.all(32),
                              child: CircularProgressIndicator(color: Color(0xFFD81B60)),
                            ),
                          )
                        : survivorStory != null
                            ? _buildSurvivorStoryCard(survivorStory!)
                            : const SizedBox.shrink(),
                  ),

                  const SizedBox(height: 24),

                  // Latest Articles Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Latest Articles',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.getTextColor(context),
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            // TODO: Navigate to all articles
                          },
                          child: const Text(
                            'View All',
                            style: TextStyle(
                              color: Color(0xFFD81B60),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Articles Preview List
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: isLoadingArticles
                        ? const Center(
                            child: Padding(
                              padding: EdgeInsets.all(20.0),
                              child: CircularProgressIndicator(
                                color: Color(0xFFD81B60),
                              ),
                            ),
                          )
                        : articles.isEmpty
                            ? Center(
                                child: Column(
                                  children: [
                                    Icon(
                                      Icons.article_outlined,
                                      size: 48,
                                      color: Colors.grey[400],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'No articles available',
                                      style: TextStyle(
                                        color: Colors.grey[600],
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : Column(
                                children: articles
                                    .where((article) => article.imageUrl != null && article.imageUrl!.isNotEmpty)
                                    .map((article) => Padding(
                                          padding: const EdgeInsets.only(bottom: 12),
                                          child: _buildArticlePreview(
                                            article.title,
                                            article.description,
                                            article.readTime,
                                            article.url,
                                            article.imageUrl,
                                            article,
                                          ),
                                        ))
                                    .toList(),
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

  // Daily Tip Card Widget
  Widget _buildDailyTipCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFF48FB1),
            Color(0xFFF06292),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFF48FB1).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.lightbulb_outline,
              color: Colors.white,
              size: 32,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text(
                      'Daily Health Tip',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        dailyTip.category,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  dailyTip.tip,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Awareness Banner Widget
  Widget _buildAwarenessBanner() {
    return Container(
      width: double.infinity,
      height: 240,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFFCE4EC),
            Color(0xFFF8BBD0),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Stack(
        children: [
          // Decorative circles
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.3),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            right: 40,
            bottom: -30,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
            ),
          ),
          
          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD81B60),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${_getAwarenessMonth()['emoji']} ${_getAwarenessMonth()['month']}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${_getAwarenessMonth()['title']}\nAwareness Month',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.getTextColor(context),
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  _getAwarenessMonth()['subtitle']!,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.getSecondaryTextColor(context),
                  ),
                ),
                const SizedBox(height: 10),
                ElevatedButton(
                  onPressed: () {
                    // TODO: Navigate to awareness content
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD81B60),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Learn More',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Health Reminder Card Widget
  Widget _buildHealthReminderCard({
    required IconData icon,
    required String title,
    required String message,
    required Color color,
    HealthReminder? reminder,
  }) {
    return InkWell(
      onTap: reminder != null
          ? () async {
              // Mark as shown when user interacts
              await healthRemindersService.markReminderAsShown(reminder.id);
              // Show source information
              if (reminder.source != null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Source: ${reminder.source}'),
                    duration: const Duration(seconds: 2),
                  ),
                );
              }
            }
          : null,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.isDarkMode(context) 
              ? color.withOpacity(0.15) 
              : color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                color: color,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.getTextColor(context),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    message,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.getSecondaryTextColor(context),
                    ),
                  ),
                  if (reminder?.source != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      '📚 ${reminder!.source}',
                      style: TextStyle(
                        fontSize: 10,
                        color: color,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Icon(
              Icons.check_circle_outline,
              color: color,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  // Helper method to convert icon string to IconData
  IconData _getIconData(String iconName) {
    switch (iconName) {
      case 'water_drop':
        return Icons.water_drop;
      case 'local_drink':
        return Icons.local_drink;
      case 'directions_walk':
        return Icons.directions_walk;
      case 'fitness_center':
        return Icons.fitness_center;
      case 'self_improvement':
        return Icons.self_improvement;
      case 'restaurant':
        return Icons.restaurant;
      case 'eco':
        return Icons.eco;
      case 'local_hospital':
        return Icons.local_hospital;
      case 'health_and_safety':
        return Icons.health_and_safety;
      case 'spa':
        return Icons.spa;
      case 'wb_sunny':
        return Icons.wb_sunny;
      case 'wb_twilight':
        return Icons.wb_twilight;
      case 'bedtime':
        return Icons.bedtime;
      case 'favorite':
        return Icons.favorite;
      case 'healing':
        return Icons.healing;
      default:
        return Icons.notifications_active;
    }
  }

  // Helper method to convert hex color to Color
  Color _getColorFromHex(String hexColor) {
    final hex = hexColor.replaceAll('#', '');
    return Color(int.parse('FF$hex', radix: 16));
  }

  // Survivor Story Card Widget
  Widget _buildSurvivorStoryCard(Article article) {
    final isBookmarked = _bookmarkStates[article.url] ?? false;
    final isDark = AppTheme.isDarkMode(context);
    
    return InkWell(
      onTap: () => _openArticle(article.url),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.getCardColor(context),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isDark ? AppTheme.darkDivider : const Color(0xFFE0E0E0)),
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
            // Image
            Stack(
              children: [
                Container(
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
                  child: article.imageUrl != null && article.imageUrl!.isNotEmpty
                      ? ClipRRect(
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
                              return Center(
                                child: CircularProgressIndicator(
                                  value: loadingProgress.expectedTotalBytes != null
                                      ? loadingProgress.cumulativeBytesLoaded /
                                          loadingProgress.expectedTotalBytes!
                                      : null,
                                  color: const Color(0xFFD81B60),
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) {
                              return Center(
                                child: Icon(
                                  Icons.favorite_rounded,
                                  size: 64,
                                  color: const Color(0xFFD81B60).withOpacity(0.3),
                                ),
                              );
                            },
                          ),
                        )
                      : Center(
                          child: Icon(
                            Icons.favorite_rounded,
                            size: 64,
                            color: const Color(0xFFD81B60).withOpacity(0.3),
                          ),
                        ),
                ),
                // Bookmark button
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
                      icon: Icon(
                        isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                        color: const Color(0xFFD81B60),
                      ),
                      onPressed: () => _toggleBookmark(article),
                      tooltip: isBookmarked ? 'Remove bookmark' : 'Add bookmark',
                    ),
                  ),
                ),
              ],
            ),
            
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFCE4EC),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Survivor Story',
                      style: TextStyle(
                        color: Color(0xFFD81B60),
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    article.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.getTextColor(context),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    article.description,
                    style: TextStyle(
                      fontSize: 13,
                      color: AppTheme.getSecondaryTextColor(context),
                      height: 1.4,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: const Color(0xFFFCE4EC),
                        child: Text(
                          article.sourceName.isNotEmpty ? article.sourceName[0].toUpperCase() : 'N',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFD81B60),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              article.sourceName,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.getTextColor(context),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              article.publishedAt,
                              style: TextStyle(
                                fontSize: 11,
                                color: AppTheme.getSecondaryTextColor(context),
                              ),
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () => _openArticle(article.url),
                        style: TextButton.styleFrom(
                          foregroundColor: const Color(0xFFD81B60),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        ),
                        child: const Text(
                          'Read More',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
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

  // Article Preview Widget
  Widget _buildArticlePreview(String title, String excerpt, String readTime, [String? url, String? imageUrl, Article? article]) {
    final isBookmarked = article != null ? (_bookmarkStates[article.url] ?? false) : false;
    final isDark = AppTheme.isDarkMode(context);
    
    return InkWell(
      onTap: url != null ? () => _openArticle(url) : null,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.getCardColor(context),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isDark ? AppTheme.darkDivider : const Color(0xFFE0E0E0)),
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
            // Image Section
            Stack(
              children: [
                Container(
                  width: double.infinity,
                  height: 120,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Color(0xFFFCE4EC),
                        Color(0xFFF8BBD0),
                      ],
                    ),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(12),
                      topRight: Radius.circular(12),
                    ),
                  ),
                  child: imageUrl != null && imageUrl.isNotEmpty
                      ? ClipRRect(
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(12),
                            topRight: Radius.circular(12),
                          ),
                          child: Image.network(
                            imageUrl,
                            fit: BoxFit.cover,
                            width: double.infinity,
                            height: 120,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Center(
                                child: CircularProgressIndicator(
                                  value: loadingProgress.expectedTotalBytes != null
                                      ? loadingProgress.cumulativeBytesLoaded /
                                          loadingProgress.expectedTotalBytes!
                                      : null,
                                  color: const Color(0xFFD81B60),
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) {
                              return Center(
                                child: Icon(
                                  Icons.article_rounded,
                                  color: const Color(0xFFD81B60).withOpacity(0.3),
                                  size: 48,
                                ),
                              );
                            },
                          ),
                        )
                      : Center(
                          child: Icon(
                            Icons.article_rounded,
                            color: const Color(0xFFD81B60).withOpacity(0.3),
                            size: 48,
                          ),
                        ),
                ),
                // Bookmark button
                if (article != null)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: IconButton(
                        padding: const EdgeInsets.all(6),
                        constraints: const BoxConstraints(),
                        icon: Icon(
                          isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                          color: const Color(0xFFD81B60),
                          size: 20,
                        ),
                        onPressed: () => _toggleBookmark(article),
                        tooltip: isBookmarked ? 'Remove bookmark' : 'Add bookmark',
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
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.getTextColor(context),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    excerpt,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.getSecondaryTextColor(context),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 12,
                        color: AppTheme.getSecondaryTextColor(context),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        readTime,
                        style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.getSecondaryTextColor(context),
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
