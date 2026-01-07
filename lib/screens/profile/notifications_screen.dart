import 'package:flutter/material.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cancerapp/services/notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final NotificationService _notificationService = NotificationService();
  
  bool _notificationsEnabled = true;
  bool _dailyTipsEnabled = true;
  bool _hydrationRemindersEnabled = true;
  bool _movementRemindersEnabled = true;
  bool _sunProtectionEnabled = true;
  bool _selfCheckRemindersEnabled = true;
  bool _weeklyCheckInEnabled = true;
  bool _forumNotificationsEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final notificationSettings = await _notificationService.getNotificationSettings();
    
    setState(() {
      _notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
      _dailyTipsEnabled = notificationSettings['health_tips'] ?? true;
      _hydrationRemindersEnabled = notificationSettings['hydration'] ?? true;
      _movementRemindersEnabled = notificationSettings['movement'] ?? true;
      _sunProtectionEnabled = notificationSettings['sun_protection'] ?? true;
      _selfCheckRemindersEnabled = notificationSettings['self_check'] ?? true;
      _weeklyCheckInEnabled = notificationSettings['weekly_checkin'] ?? true;
      _forumNotificationsEnabled = notificationSettings['forum'] ?? true;
    });
  }

  Future<void> _saveSettings(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
  }
  
  Future<void> _toggleNotificationType(String type, bool value) async {
    await _notificationService.toggleNotificationType(type, value);
  }

  Future<void> _requestNotificationPermission() async {
    final granted = await _notificationService.requestPermissions();
    if (granted) {
      await _notificationService.enableAllNotifications();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Notifications enabled successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please enable notifications in your device settings'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }
  
  Future<void> _testNotification() async {
    await _notificationService.showTestNotification();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🧪 Test notification sent!'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.getBackgroundColor(context),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // App Bar
            const CustomAppHeader(
              title: 'Notifications',
              subtitle: 'Manage your app notifications',
              showBackButton: true,
            ),

            // Content
            SliverToBoxAdapter(
              child: Column(
                children: [
                  const SizedBox(height: 20),

                  // Info Banner
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            const Color(0xFF2196F3).withOpacity(0.1),
                            const Color(0xFF64B5F6).withOpacity(0.05),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: const Color(0xFF2196F3).withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.info_outline_rounded,
                            color: const Color(0xFF2196F3),
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Notifications work even when the app is closed. Manage your preferences below.',
                              style: TextStyle(
                                fontSize: 13,
                                color: AppTheme.getTextColor(context),
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Master Switch
                  _buildSectionTitle('General'),
                  const SizedBox(height: 12),
                  _buildSettingsCard([
                    _buildSwitchTile(
                      icon: Icons.notifications_rounded,
                      title: 'Push Notifications',
                      subtitle: 'Master switch for all notifications',
                      iconColor: const Color(0xFF2196F3),
                      iconBg: const Color(0xFFE3F2FD),
                      value: _notificationsEnabled,
                      onChanged: (value) async {
                        setState(() => _notificationsEnabled = value);
                        _saveSettings('notifications_enabled', value);
                        if (value) {
                          await _requestNotificationPermission();
                        } else {
                          await _notificationService.disableAllNotifications();
                        }
                      },
                      isLast: true,
                    ),
                  ]),

                  const SizedBox(height: 24),

                  // Health & Prevention
                  _buildSectionTitle('Health & Prevention'),
                  const SizedBox(height: 12),
                  _buildSettingsCard([
                    _buildSwitchTile(
                      icon: Icons.lightbulb_rounded,
                      title: 'Daily Health Tips',
                      subtitle: 'Get daily cancer prevention tips at 9 AM',
                      iconColor: const Color(0xFFFF9800),
                      iconBg: const Color(0xFFFFF3E0),
                      value: _dailyTipsEnabled,
                      onChanged: (value) {
                        setState(() => _dailyTipsEnabled = value);
                        _toggleNotificationType('health_tips', value);
                      },
                    ),
                    _buildDivider(),
                    _buildSwitchTile(
                      icon: Icons.water_drop_rounded,
                      title: 'Hydration Reminders',
                      subtitle: 'Stay hydrated throughout the day',
                      iconColor: const Color(0xFF2196F3),
                      iconBg: const Color(0xFFE3F2FD),
                      value: _hydrationRemindersEnabled,
                      onChanged: (value) {
                        setState(() => _hydrationRemindersEnabled = value);
                        _toggleNotificationType('hydration', value);
                      },
                    ),
                    _buildDivider(),
                    _buildSwitchTile(
                      icon: Icons.directions_walk_rounded,
                      title: 'Movement Reminders',
                      subtitle: 'Get reminders to stay active',
                      iconColor: const Color(0xFF4CAF50),
                      iconBg: const Color(0xFFE8F5E9),
                      value: _movementRemindersEnabled,
                      onChanged: (value) {
                        setState(() => _movementRemindersEnabled = value);
                        _toggleNotificationType('movement', value);
                      },
                    ),
                    _buildDivider(),
                    _buildSwitchTile(
                      icon: Icons.wb_sunny_rounded,
                      title: 'Sun Protection',
                      subtitle: 'Daily reminder at 10 AM',
                      iconColor: const Color(0xFFFFC107),
                      iconBg: const Color(0xFFFFF8E1),
                      value: _sunProtectionEnabled,
                      onChanged: (value) {
                        setState(() => _sunProtectionEnabled = value);
                        _toggleNotificationType('sun_protection', value);
                      },
                      isLast: true,
                    ),
                  ]),

                  const SizedBox(height: 24),

                  // Self-Check & Screening
                  _buildSectionTitle('Self-Check & Screening'),
                  const SizedBox(height: 12),
                  _buildSettingsCard([
                    _buildSwitchTile(
                      icon: Icons.favorite_rounded,
                      title: 'Self-Check Reminders',
                      subtitle: 'Monthly breast self-exam reminder',
                      iconColor: const Color(0xFFE91E63),
                      iconBg: const Color(0xFFFCE4EC),
                      value: _selfCheckRemindersEnabled,
                      onChanged: (value) {
                        setState(() => _selfCheckRemindersEnabled = value);
                        _toggleNotificationType('self_check', value);
                      },
                      isLast: true,
                    ),
                  ]),

                  const SizedBox(height: 24),

                  // Community & Wellness
                  _buildSectionTitle('Community & Wellness'),
                  const SizedBox(height: 12),
                  _buildSettingsCard([
                    _buildSwitchTile(
                      icon: Icons.spa_rounded,
                      title: 'Weekly Wellness Check',
                      subtitle: 'Sunday morning wellness reminder',
                      iconColor: const Color(0xFF9C27B0),
                      iconBg: const Color(0xFFF3E5F5),
                      value: _weeklyCheckInEnabled,
                      onChanged: (value) {
                        setState(() => _weeklyCheckInEnabled = value);
                        _toggleNotificationType('weekly_checkin', value);
                      },
                    ),
                    _buildDivider(),
                    _buildSwitchTile(
                      icon: Icons.forum_rounded,
                      title: 'Forum Notifications',
                      subtitle: 'Replies and upvotes on your posts',
                      iconColor: const Color(0xFFD81B60),
                      iconBg: const Color(0xFFFCE4EC),
                      value: _forumNotificationsEnabled,
                      onChanged: (value) {
                        setState(() => _forumNotificationsEnabled = value);
                        _toggleNotificationType('forum', value);
                      },
                      isLast: true,
                    ),
                  ]),

                  const SizedBox(height: 24),

                  // Test Notification Button
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _testNotification,
                        icon: const Icon(Icons.science_rounded),
                        label: const Text('Send Test Notification'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2196F3),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                        ),
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

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppTheme.getSecondaryTextColor(context),
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Padding(
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
        child: Column(children: children),
      ),
    );
  }

  Widget _buildSwitchTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color iconColor,
    required Color iconBg,
    required bool value,
    required ValueChanged<bool> onChanged,
    bool isLast = false,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 0),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: iconBg,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: iconColor, size: 22),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppTheme.getTextColor(context),
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            fontSize: 12,
            color: AppTheme.getSecondaryTextColor(context),
          ),
        ),
        trailing: Switch(
          value: value,
          onChanged: onChanged,
          activeColor: const Color(0xFFD81B60),
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Padding(
      padding: const EdgeInsets.only(left: 76),
      child: Divider(
        height: 1,
        thickness: 1,
        color: AppTheme.getDividerColor(context),
      ),
    );
  }
}
