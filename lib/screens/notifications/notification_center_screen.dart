import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/models/app_notification.dart';
import 'package:cancerapp/providers/notification_provider.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:cancerapp/widgets/modern_back_button.dart';

class NotificationCenterScreen extends ConsumerWidget {
  const NotificationCenterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = AppTheme.isDarkMode(context);
    final notificationsAsync = ref.watch(notificationsProvider);
    final notifier = ref.read(notificationsProvider.notifier);

    return Scaffold(
      backgroundColor: AppTheme.getBackgroundColor(context),
      body: SafeArea(
        child: notificationsAsync.when(
          loading: () => const Center(
            child: CircularProgressIndicator(color: Color(0xFFD81B60)),
          ),
          error: (error, _) => Center(
            child: Text('Error loading notifications: $error'),
          ),
          data: (notifications) => _buildContent(
            context,
            ref,
            notifications,
            notifier,
            isDark,
          ),
        ),
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    WidgetRef ref,
    List<AppNotification> notifications,
    NotificationsNotifier notifier,
    bool isDark,
  ) {
    final unreadCount = notifications.where((n) => !n.isRead).length;

    return CustomScrollView(
      slivers: [
        // App Bar
        SliverAppBar(
          floating: true,
          expandedHeight: 85,
          backgroundColor: const Color(0xFFD81B60),
          elevation: 0,
          leading: const ModernBackButton(),
          actions: [
            if (notifications.isNotEmpty) ...[
              if (unreadCount > 0)
                IconButton(
                  icon: const Icon(Icons.done_all, color: Colors.white),
                  tooltip: 'Mark all as read',
                  onPressed: () => _markAllAsRead(context, notifier),
                ),
              IconButton(
                icon: const Icon(Icons.delete_sweep, color: Colors.white),
                tooltip: 'Clear all',
                onPressed: () => _clearAllNotifications(context, notifier),
              ),
              const SizedBox(width: 8),
            ],
          ],
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(24),
              bottomRight: Radius.circular(24),
            ),
          ),
          flexibleSpace: Container(
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFFD81B60),
                  Color(0xFFE91E63),
                ],
              ),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
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
                // Title
                Positioned(
                  left: 60,
                  right: 100,
                  top: 0,
                  bottom: 0,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Notifications',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        unreadCount > 0
                            ? '$unreadCount unread notification${unreadCount > 1 ? 's' : ''}'
                            : 'All caught up!',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // Content
        if (notifications.isEmpty)
          SliverFillRemaining(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: (isDark ? Colors.white10 : Colors.grey.shade100),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.notifications_off_outlined,
                      size: 48,
                      color: isDark ? Colors.white38 : Colors.grey.shade400,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'No notifications yet',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.getTextColor(context),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your health reminders and updates\nwill appear here',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? Colors.white54 : Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final notification = notifications[index];
                  return _buildNotificationCard(context, notification, isDark, notifier);
                },
                childCount: notifications.length,
              ),
            ),
          ),
      ],
    );
  }

  void _markAllAsRead(BuildContext context, NotificationsNotifier notifier) async {
    await notifier.markAllAsRead();
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('All notifications marked as read'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _clearAllNotifications(BuildContext context, NotificationsNotifier notifier) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear All Notifications'),
        content: const Text('Are you sure you want to delete all notifications? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Clear All'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await notifier.clearAll();
    }
  }

  IconData _getIconForType(String iconName) {
    switch (iconName) {
      case 'lightbulb':
        return Icons.lightbulb_outline;
      case 'water_drop':
        return Icons.water_drop_outlined;
      case 'directions_walk':
        return Icons.directions_walk;
      case 'wb_sunny':
        return Icons.wb_sunny_outlined;
      case 'health_and_safety':
        return Icons.health_and_safety_outlined;
      case 'calendar_today':
        return Icons.calendar_today_outlined;
      case 'reply':
        return Icons.reply;
      case 'thumb_up':
        return Icons.thumb_up_outlined;
      case 'check_circle':
        return Icons.check_circle_outline;
      default:
        return Icons.notifications_outlined;
    }
  }

  Color _getColorForType(String type) {
    switch (type) {
      case 'health_tip':
        return const Color(0xFFFFB300); // Amber
      case 'hydration':
        return const Color(0xFF2196F3); // Blue
      case 'movement':
        return const Color(0xFF4CAF50); // Green
      case 'sun_protection':
        return const Color(0xFFFF9800); // Orange
      case 'self_check':
        return const Color(0xFFD81B60); // Pink
      case 'screening':
        return const Color(0xFF9C27B0); // Purple
      case 'forum_reply':
        return const Color(0xFF00BCD4); // Cyan
      case 'forum_upvote':
        return const Color(0xFF8BC34A); // Light Green
      case 'weekly_check_in':
        return const Color(0xFF3F51B5); // Indigo
      default:
        return const Color(0xFFD81B60);
    }
  }

  void _markAsRead(AppNotification notification, NotificationsNotifier notifier) {
    if (!notification.isRead) {
      notifier.markAsRead(notification.id);
    }
  }

  void _deleteNotification(BuildContext context, AppNotification notification, NotificationsNotifier notifier) async {
    await notifier.deleteNotification(notification.id);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Notification deleted'),
        ),
      );
    }
  }

  Widget _buildNotificationCard(BuildContext context, AppNotification notification, bool isDark, NotificationsNotifier notifier) {
    final typeColor = _getColorForType(notification.type);
    final iconData = _getIconForType(notification.displayIcon);

    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.red.shade400,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(
          Icons.delete_outline,
          color: Colors.white,
          size: 28,
        ),
      ),
      onDismissed: (_) => _deleteNotification(context, notification, notifier),
      child: GestureDetector(
        onTap: () => _markAsRead(notification, notifier),
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: notification.isRead
                ? (isDark ? AppTheme.darkCard : Colors.white)
                : (isDark ? AppTheme.darkCard.withOpacity(0.9) : Colors.white),
            borderRadius: BorderRadius.circular(16),
            border: notification.isRead
                ? null
                : Border.all(
                    color: typeColor.withOpacity(0.3),
                    width: 1.5,
                  ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(isDark ? 0.2 : 0.06),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon container
              Container(
                width: 56,
                padding: const EdgeInsets.all(16),
                child: Stack(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: typeColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        iconData,
                        color: typeColor,
                        size: 22,
                      ),
                    ),
                    if (!notification.isRead)
                      Positioned(
                        right: 0,
                        top: 0,
                        child: Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: typeColor,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isDark ? AppTheme.darkCard : Colors.white,
                              width: 2,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              // Content
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              notification.title,
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: notification.isRead
                                    ? FontWeight.w500
                                    : FontWeight.w600,
                                color: AppTheme.getTextColor(context),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            notification.timeAgo,
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.white54 : Colors.grey.shade500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        notification.body,
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? Colors.white70 : Colors.grey.shade700,
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
              // Delete button
              Padding(
                padding: const EdgeInsets.only(top: 8, right: 8),
                child: IconButton(
                  icon: Icon(
                    Icons.close,
                    size: 18,
                    color: isDark ? Colors.white38 : Colors.grey.shade400,
                  ),
                  onPressed: () => _deleteNotification(context, notification, notifier),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(
                    minWidth: 32,
                    minHeight: 32,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
