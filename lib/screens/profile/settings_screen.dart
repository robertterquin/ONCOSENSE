import 'package:flutter/material.dart';
import 'package:cancerapp/widgets/modern_back_button.dart';
import 'package:cancerapp/main.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _darkModeEnabled = false;
  bool _dailyTipsEnabled = true;
  bool _healthRemindersEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final themeProvider = CancerApp.of(context);
    setState(() {
      _notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
      _darkModeEnabled = themeProvider?.isDarkMode ?? false;
      _dailyTipsEnabled = prefs.getBool('daily_tips_enabled') ?? true;
      _healthRemindersEnabled = prefs.getBool('health_reminders_enabled') ?? true;
    });
  }

  Future<void> _saveSettings(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open link')),
        );
      }
    }
  }

  void _showAboutDialog() {
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

  void _showTermsAndPrivacy(String title, String content) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.75,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Text(
                  content,
                  style: TextStyle(
                    color: Colors.grey[700],
                    height: 1.6,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.getBackgroundColor(context),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // App Bar
            SliverAppBar(
              floating: true,
              expandedHeight: 85,
              backgroundColor: const Color(0xFFD81B60),
              elevation: 0,
              leading: const ModernBackButton(),
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
                    // Settings icon decoration
                    Positioned(
                      right: 20,
                      top: 20,
                      child: Icon(
                        Icons.settings,
                        color: Colors.white.withOpacity(0.15),
                        size: 40,
                      ),
                    ),
                    // Content
                    SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.only(left: 56, right: 16, top: 12, bottom: 12),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Settings',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              width: 50,
                              height: 3,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.8),
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Content
            SliverToBoxAdapter(
              child: Column(
                children: [
                  const SizedBox(height: 20),

                  // Notifications Section
                  _buildSectionTitle('Notifications'),
                  const SizedBox(height: 12),
                  _buildSettingsCard([
                    _buildSwitchTile(
                      icon: Icons.notifications_rounded,
                      title: 'Push Notifications',
                      subtitle: 'Receive important updates and alerts',
                      iconColor: const Color(0xFF2196F3),
                      iconBg: const Color(0xFFE3F2FD),
                      value: _notificationsEnabled,
                      onChanged: (value) {
                        setState(() => _notificationsEnabled = value);
                        _saveSettings('notifications_enabled', value);
                      },
                    ),
                    _buildDivider(),
                    _buildSwitchTile(
                      icon: Icons.lightbulb_rounded,
                      title: 'Daily Health Tips',
                      subtitle: 'Get daily cancer prevention tips',
                      iconColor: const Color(0xFFFF9800),
                      iconBg: const Color(0xFFFFF3E0),
                      value: _dailyTipsEnabled,
                      onChanged: (value) {
                        setState(() => _dailyTipsEnabled = value);
                        _saveSettings('daily_tips_enabled', value);
                      },
                    ),
                    _buildDivider(),
                    _buildSwitchTile(
                      icon: Icons.alarm_rounded,
                      title: 'Health Reminders',
                      subtitle: 'Reminders for self-checks and screenings',
                      iconColor: const Color(0xFF4CAF50),
                      iconBg: const Color(0xFFE8F5E9),
                      value: _healthRemindersEnabled,
                      onChanged: (value) {
                        setState(() => _healthRemindersEnabled = value);
                        _saveSettings('health_reminders_enabled', value);
                      },
                      isLast: true,
                    ),
                  ]),

                  const SizedBox(height: 24),

                  // Appearance Section
                  _buildSectionTitle('Appearance'),
                  const SizedBox(height: 12),
                  _buildSettingsCard([
                    _buildSwitchTile(
                      icon: Icons.dark_mode_rounded,
                      title: 'Dark Mode',
                      subtitle: 'Switch to dark theme',
                      iconColor: const Color(0xFF5C6BC0),
                      iconBg: const Color(0xFFE8EAF6),
                      value: _darkModeEnabled,
                      onChanged: (value) {
                        final themeProvider = CancerApp.of(context);
                        themeProvider?.setDarkMode(value);
                        setState(() => _darkModeEnabled = value);
                      },
                      isLast: true,
                    ),
                  ]),

                  const SizedBox(height: 24),

                  // Legal Section
                  _buildSectionTitle('Legal'),
                  const SizedBox(height: 12),
                  _buildSettingsCard([
                    _buildMenuTile(
                      icon: Icons.description_rounded,
                      title: 'Terms of Service',
                      subtitle: 'Read our terms and conditions',
                      iconColor: const Color(0xFF607D8B),
                      iconBg: const Color(0xFFECEFF1),
                      onTap: () => _showTermsAndPrivacy(
                        'Terms of Service',
                        _termsOfServiceContent,
                      ),
                    ),
                    _buildDivider(),
                    _buildMenuTile(
                      icon: Icons.privacy_tip_rounded,
                      title: 'Privacy Policy',
                      subtitle: 'How we handle your data',
                      iconColor: const Color(0xFF9C27B0),
                      iconBg: const Color(0xFFF3E5F5),
                      onTap: () => _showTermsAndPrivacy(
                        'Privacy Policy',
                        _privacyPolicyContent,
                      ),
                      isLast: true,
                    ),
                  ]),

                  const SizedBox(height: 24),

                  // About Section
                  _buildSectionTitle('About'),
                  const SizedBox(height: 12),
                  _buildSettingsCard([
                    _buildMenuTile(
                      icon: Icons.info_rounded,
                      title: 'About OncoSense',
                      subtitle: 'Version 1.0.0',
                      iconColor: const Color(0xFFD81B60),
                      iconBg: const Color(0xFFFCE4EC),
                      onTap: _showAboutDialog,
                    ),
                    _buildDivider(),
                    _buildMenuTile(
                      icon: Icons.star_rounded,
                      title: 'Rate the App',
                      subtitle: 'Share your feedback',
                      iconColor: const Color(0xFFFFC107),
                      iconBg: const Color(0xFFFFF8E1),
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('App store rating will be available soon'),
                          ),
                        );
                      },
                    ),
                    _buildDivider(),
                    _buildMenuTile(
                      icon: Icons.share_rounded,
                      title: 'Share App',
                      subtitle: 'Spread cancer awareness',
                      iconColor: const Color(0xFF00BCD4),
                      iconBg: const Color(0xFFE0F7FA),
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Sharing will be available soon'),
                          ),
                        );
                      },
                      isLast: true,
                    ),
                  ]),

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

  Widget _buildMenuTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color iconColor,
    required Color iconBg,
    required VoidCallback onTap,
    bool isLast = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: isLast
          ? const BorderRadius.only(
              bottomLeft: Radius.circular(16),
              bottomRight: Radius.circular(16),
            )
          : null,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: iconColor, size: 22),
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
                      color: AppTheme.getTextColor(context),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.getSecondaryTextColor(context),
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: AppTheme.getSecondaryTextColor(context),
              size: 24,
            ),
          ],
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

  // Content strings
  static const String _termsOfServiceContent = '''
Terms of Service for OncoSense

Last Updated: December 2024

1. Acceptance of Terms
By accessing and using OncoSense, you accept and agree to be bound by these Terms of Service.

2. Description of Service
OncoSense is a cancer awareness and education mobile application that provides:
• Information about various types of cancer
• Prevention guidelines and tips
• Community forum for discussions
• Resource directories for support services

3. Medical Disclaimer
The information provided in OncoSense is for educational purposes only and is NOT intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

4. User Responsibilities
• You agree to provide accurate information when creating an account
• You will not use the app to spread misinformation
• You will treat other community members with respect
• You will not share personal medical information of others

5. Privacy
Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.

6. Intellectual Property
All content, features, and functionality of OncoSense are owned by us and are protected by copyright, trademark, and other intellectual property laws.

7. Limitation of Liability
OncoSense and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the app.

8. Changes to Terms
We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the modified terms.

9. Contact Us
If you have questions about these Terms of Service, please contact us through the app's support feature.
''';

  static const String _privacyPolicyContent = '''
Privacy Policy for OncoSense

Last Updated: December 2024

1. Introduction
OncoSense ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.

2. Information We Collect

Personal Information:
• Name and email address (for account creation)
• Age and gender (optional, for personalized content)
• Profile picture (optional)

Usage Data:
• App usage patterns
• Bookmarked content
• Forum interactions

3. How We Use Your Information
• To provide and maintain the app
• To personalize your experience
• To send health reminders (with your consent)
• To improve our services
• To respond to your inquiries

4. Data Security
We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.

5. Data Sharing
We do NOT sell your personal information. We may share data with:
• Service providers who assist in app operations
• Legal authorities when required by law

6. Your Rights
You have the right to:
• Access your personal data
• Correct inaccurate data
• Delete your account and associated data
• Opt-out of marketing communications

7. Children's Privacy
OncoSense is not intended for children under 13. We do not knowingly collect information from children under 13.

8. Third-Party Links
Our app may contain links to third-party websites. We are not responsible for their privacy practices.

9. Changes to This Policy
We may update this Privacy Policy periodically. We will notify you of significant changes through the app.

10. Contact Us
For questions about this Privacy Policy, please contact us through the app's support feature.

By using OncoSense, you agree to the collection and use of information in accordance with this Privacy Policy.
''';
}
