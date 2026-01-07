import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/providers/auth_provider.dart';
import 'package:cancerapp/providers/supabase_provider.dart';
import 'package:cancerapp/providers/bookmark_provider.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/journey_service.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:cancerapp/screens/profile/edit_profile_screen.dart';
import 'package:cancerapp/screens/profile/saved_articles_screen.dart';
import 'package:cancerapp/screens/profile/saved_questions_screen.dart';
import 'package:cancerapp/screens/profile/saved_resources_screen.dart';
import 'package:cancerapp/screens/profile/settings_screen.dart';
import 'package:cancerapp/screens/profile/notifications_screen.dart';
import 'package:cancerapp/utils/theme.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  Future<void> _handleLogout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: const Color(0xFFD81B60),
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      // Reset journey service state before logout
      getIt<JourneyService>().reset();
      await ref.read(supabaseServiceProvider).signOutAndClearSession();
      if (context.mounted) {
        Navigator.of(context).pushReplacementNamed('/welcome');
      }
    }
  }

  void _showHelpSupportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.help_rounded, color: Color(0xFF4CAF50), size: 20),
            ),
            const SizedBox(width: 12),
            const Text('Help & Support'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Need assistance?',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Text(
              'For questions, feedback, or support, please contact us:',
              style: TextStyle(color: Colors.grey[600], height: 1.5),
            ),
            const SizedBox(height: 16),
            _buildContactItem(Icons.email_rounded, 'support@oncosense.app'),
            const SizedBox(height: 8),
            _buildContactItem(Icons.phone_rounded, '+63 123 456 7890'),
            const SizedBox(height: 16),
            Text(
              'You can also visit our FAQ section for common questions.',
              style: TextStyle(color: Colors.grey[600], height: 1.5),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildContactItem(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF4CAF50)),
        const SizedBox(width: 8),
        Text(
          text,
          style: const TextStyle(fontSize: 14),
        ),
      ],
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFD81B60), Color(0xFFE91E63)],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.favorite, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            const Text('OncoSense'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Version 1.0.0',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Text(
              'OncoSense is a cancer awareness and education app designed to provide reliable information about cancer types, prevention strategies, and support resources.',
              style: TextStyle(color: Colors.grey[600], height: 1.5),
            ),
            const SizedBox(height: 16),
            Text(
              'Empowering Awareness. Saving Lives.',
              style: TextStyle(
                color: const Color(0xFFD81B60),
                fontWeight: FontWeight.w500,
                fontStyle: FontStyle.italic,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              '© 2024 OncoSense Team. All rights reserved.',
              style: TextStyle(color: Colors.grey[500], fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch user data from providers
    final userName = ref.watch(userDisplayNameProvider);
    final userEmail = ref.watch(userEmailProvider);
    final profilePictureUrl = ref.watch(userProfilePictureProvider);
    
    // Watch bookmark counts
    final articleCountAsync = ref.watch(articleBookmarkCountProvider);
    final questionCountAsync = ref.watch(questionBookmarkCountProvider);
    final resourceCountAsync = ref.watch(resourceBookmarkCountProvider);
    
    final bookmarkCount = articleCountAsync.value ?? 0;
    final questionBookmarkCount = questionCountAsync.value ?? 0;
    final resourceBookmarkCount = resourceCountAsync.value ?? 0;
    
    return Scaffold(
      backgroundColor: AppTheme.getBackgroundColor(context),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // App Bar
            const CustomAppHeader(
              title: 'Profile',
              subtitle: 'Manage your account and preferences',
              showBackButton: true,
            ),

            // Content
            SliverToBoxAdapter(
              child: Column(
                children: [
                  const SizedBox(height: 20),

                  // Profile Header
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: _buildProfileHeader(context, userName, userEmail, profilePictureUrl),
                  ),

                  const SizedBox(height: 24),

                  // Menu Section Title
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Your Content',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.getSecondaryTextColor(context),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Content Menu Items
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.getCardColor(context),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          _buildModernMenuItem(
                            context: context,
                            icon: Icons.edit_rounded,
                            title: 'Edit Profile',
                            subtitle: 'Update your personal information',
                            iconColor: const Color(0xFFD81B60),
                            iconBg: const Color(0xFFFCE4EC),
                            onTap: () async {
                              final result = await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const EditProfileScreen(),
                                ),
                              );
                              // Refresh user data if changes were made
                              if (result == true) {
                                ref.invalidate(currentUserProvider);
                              }
                            },
                          ),
                          _buildDivider(context),
                          _buildModernMenuItem(
                            context: context,
                            icon: Icons.bookmark_rounded,
                            title: 'Saved Articles',
                            subtitle: bookmarkCount > 0 
                                ? '$bookmarkCount saved article${bookmarkCount != 1 ? 's' : ''}'
                                : 'View your bookmarked articles',
                            iconColor: const Color(0xFFE91E63),
                            iconBg: const Color(0xFFFCE4EC),
                            badge: bookmarkCount > 0 ? bookmarkCount.toString() : null,
                            onTap: () async {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const SavedArticlesScreen(),
                                ),
                              );
                              // Invalidate to refresh counts
                              ref.invalidate(articleBookmarkCountProvider);
                            },
                          ),
                          _buildDivider(context),
                          _buildModernMenuItem(
                            context: context,
                            icon: Icons.question_answer_rounded,
                            title: 'Saved Questions',
                            subtitle: questionBookmarkCount > 0
                                ? '$questionBookmarkCount saved question${questionBookmarkCount != 1 ? 's' : ''}'
                                : 'Your saved forum discussions',
                            iconColor: const Color(0xFF9C27B0),
                            iconBg: const Color(0xFFF3E5F5),
                            badge: questionBookmarkCount > 0 ? questionBookmarkCount.toString() : null,
                            onTap: () async {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const SavedQuestionsScreen(),
                                ),
                              );
                              // Invalidate to refresh counts
                              ref.invalidate(questionBookmarkCountProvider);
                            },
                          ),
                          _buildDivider(context),
                          _buildModernMenuItem(
                            context: context,
                            icon: Icons.favorite_rounded,
                            title: 'Saved Resources',
                            subtitle: resourceBookmarkCount > 0
                                ? '$resourceBookmarkCount saved resource${resourceBookmarkCount != 1 ? 's' : ''}'
                                : 'Your favorite support resources',
                            iconColor: const Color(0xFFEC407A),
                            iconBg: const Color(0xFFFCE4EC),
                            badge: resourceBookmarkCount > 0 ? resourceBookmarkCount.toString() : null,
                            onTap: () async {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const SavedResourcesScreen(),
                                ),
                              );
                              // Invalidate to refresh counts
                              ref.invalidate(resourceBookmarkCountProvider);
                            },
                            isLast: true,
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Settings Section Title
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Preferences',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.getSecondaryTextColor(context),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Settings Menu Items
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.getCardColor(context),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          _buildModernMenuItem(
                            context: context,
                            icon: Icons.settings_rounded,
                            title: 'Settings',
                            subtitle: 'App preferences and privacy',
                            iconColor: const Color(0xFF2196F3),
                            iconBg: const Color(0xFFE3F2FD),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const SettingsScreen(),
                                ),
                              );
                            },
                          ),
                          _buildDivider(context),
                          _buildModernMenuItem(
                            context: context,
                            icon: Icons.lock_rounded,
                            title: 'Change Password',
                            subtitle: 'Update your account password',
                            iconColor: const Color(0xFFFF7043),
                            iconBg: const Color(0xFFFFE0B2),
                            onTap: () {
                              Navigator.pushNamed(context, '/change-password');
                            },
                          ),
                          _buildDivider(context),
                          _buildModernMenuItem(
                            context: context,
                            icon: Icons.notifications_rounded,
                            title: 'Notifications',
                            subtitle: 'Manage your notifications',
                            iconColor: const Color(0xFFFF9800),
                            iconBg: const Color(0xFFFFF3E0),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const NotificationsScreen(),
                                ),
                              );
                            },
                          ),
                          _buildDivider(context),
                          _buildModernMenuItem(
                            context: context,
                            icon: Icons.help_rounded,
                            title: 'Help & Support',
                            subtitle: 'Get help and contact us',
                            iconColor: const Color(0xFF4CAF50),
                            iconBg: const Color(0xFFE8F5E9),
                            onTap: () {
                              _showHelpSupportDialog(context);
                            },
                          ),
                          _buildDivider(context),
                          _buildModernMenuItem(
                            context: context,
                            icon: Icons.info_rounded,
                            title: 'About',
                            subtitle: 'App version and information',
                            iconColor: const Color(0xFF607D8B),
                            iconBg: const Color(0xFFECEFF1),
                            onTap: () {
                              _showAboutDialog(context);
                            },
                            isLast: true,
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Logout Button
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.getCardColor(context),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: _buildModernMenuItem(
                        context: context,
                        icon: Icons.logout_rounded,
                        title: 'Log Out',
                        subtitle: 'Sign out of your account',
                        iconColor: const Color(0xFFF44336),
                        iconBg: const Color(0xFFFFEBEE),
                        titleColor: const Color(0xFFF44336),
                        onTap: () => _handleLogout(context, ref),
                        isLast: true,
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, String? userName, String? userEmail, String? profilePictureUrl) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFD81B60),
            Color(0xFFE91E63),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFD81B60).withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          // Profile Picture
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
              border: Border.all(
                color: Colors.white.withOpacity(0.3),
                width: 3,
              ),
            ),
            child: ClipOval(
              child: profilePictureUrl != null
                  ? Image.network(
                      profilePictureUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Center(
                          child: Text(
                            (userName?.isNotEmpty ?? false) ? userName![0].toUpperCase() : 'U',
                            style: const TextStyle(
                              color: Color(0xFFD81B60),
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        );
                      },
                    )
                  : Center(
                      child: Text(
                        (userName?.isNotEmpty ?? false) ? userName![0].toUpperCase() : 'U',
                        style: const TextStyle(
                          color: Color(0xFFD81B60),
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
            ),
          ),
          const SizedBox(width: 16),
          
          // User Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  userName ?? 'Guest',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  userEmail ?? 'guest@oncosense.app',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withOpacity(0.9),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.3),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.verified,
                        color: Colors.white,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      const Text(
                        'Active Member',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModernMenuItem({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required Color iconColor,
    required Color iconBg,
    required VoidCallback onTap,
    Color? titleColor,
    String? badge,
    bool isLast = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.vertical(
        top: Radius.circular(isLast ? 0 : 16),
        bottom: Radius.circular(isLast ? 16 : 0),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: iconColor,
                size: 22,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: titleColor ?? AppTheme.getTextColor(context),
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.getSecondaryTextColor(context),
                      letterSpacing: 0.1,
                    ),
                  ),
                ],
              ),
            ),
            if (badge != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: iconColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  badge,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
            ],
            Icon(
              Icons.arrow_forward_ios_rounded,
              size: 16,
              color: AppTheme.getSecondaryTextColor(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDivider(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 68),
      child: Divider(
        height: 1,
        thickness: 1,
        color: AppTheme.getDividerColor(context),
      ),
    );
  }
}
