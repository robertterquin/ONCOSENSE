import 'package:flutter/material.dart';
import 'package:cancerapp/models/resource.dart';
import 'package:cancerapp/services/bookmark_service.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:url_launcher/url_launcher.dart';

class SavedResourcesScreen extends StatefulWidget {
  const SavedResourcesScreen({super.key});

  @override
  State<SavedResourcesScreen> createState() => _SavedResourcesScreenState();
}

class _SavedResourcesScreenState extends State<SavedResourcesScreen> {
  final BookmarkService _bookmarkService = BookmarkService();
  List<Resource> _savedResources = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSavedResources();
  }

  Future<void> _loadSavedResources() async {
    setState(() => _isLoading = true);
    
    try {
      final resources = await _bookmarkService.getBookmarkedResources();
      setState(() {
        _savedResources = resources;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading saved resources: $e')),
        );
      }
    }
  }

  Future<void> _removeBookmark(Resource resource) async {
    final removed = await _bookmarkService.removeResourceBookmark(resource.id);
    
    if (removed) {
      setState(() {
        _savedResources.removeWhere((r) => r.id == resource.id);
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Resource removed from bookmarks'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final uri = Uri.parse('tel:$phoneNumber');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not make phone call')),
        );
      }
    }
  }

  Future<void> _openWebsite(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open website')),
        );
      }
    }
  }

  Future<void> _sendEmail(String email) async {
    final uri = Uri.parse('mailto:$email');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open email app')),
        );
      }
    }
  }

  IconData _getResourceIcon(String type) {
    switch (type) {
      case 'hotline':
        return Icons.phone_in_talk_rounded;
      case 'screening_center':
        return Icons.local_hospital_rounded;
      case 'financial_support':
        return Icons.account_balance_rounded;
      case 'support_group':
        return Icons.people_rounded;
      default:
        return Icons.help_outline_rounded;
    }
  }

  Color _getResourceColor(String type) {
    switch (type) {
      case 'hotline':
        return const Color(0xFFD81B60);
      case 'screening_center':
        return const Color(0xFF2196F3);
      case 'financial_support':
        return const Color(0xFF4CAF50);
      case 'support_group':
        return const Color(0xFF9C27B0);
      default:
        return const Color(0xFF757575);
    }
  }

  String _getResourceTypeLabel(String type) {
    switch (type) {
      case 'hotline':
        return 'Hotline';
      case 'screening_center':
        return 'Screening Center';
      case 'financial_support':
        return 'Financial Support';
      case 'support_group':
        return 'Support Group';
      default:
        return 'Resource';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.getSurfaceColor(context),
      body: CustomScrollView(
        slivers: [
          // Custom App Header matching main pages
          CustomAppHeader(
            title: 'Saved Resources',
            subtitle: 'Your bookmarked support resources',
            showBackButton: true,
          ),

          // Content
          _isLoading
              ? const SliverFillRemaining(
                  child: Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFFD81B60),
                    ),
                  ),
                )
              : _savedResources.isEmpty
                  ? SliverFillRemaining(
                      child: _buildEmptyState(),
                    )
                  : SliverPadding(
                      padding: const EdgeInsets.all(16),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final resource = _savedResources[index];
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: _buildResourceCard(resource),
                            );
                          },
                          childCount: _savedResources.length,
                        ),
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
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              decoration: const BoxDecoration(
                color: Color(0xFFFCE4EC),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.favorite_border_rounded,
                size: 80,
                color: Color(0xFFD81B60),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'No Saved Resources',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppTheme.getTextColor(context),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Resources you bookmark will appear here for easy access later.',
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
              label: const Text('Explore Resources'),
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

  Widget _buildResourceCard(Resource resource) {
    final color = _getResourceColor(resource.type);
    final icon = _getResourceIcon(resource.type);
    final typeLabel = _getResourceTypeLabel(resource.type);
    final isDark = AppTheme.isDarkMode(context);

    return Container(
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
          // Header with Icon and Type
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
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
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          typeLabel,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: color,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        resource.name,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.getTextColor(context),
                        ),
                      ),
                    ],
                  ),
                ),
                // Bookmark remove button
                IconButton(
                  onPressed: () => _removeBookmark(resource),
                  icon: const Icon(
                    Icons.bookmark,
                    color: Color(0xFFD81B60),
                  ),
                  tooltip: 'Remove bookmark',
                ),
              ],
            ),
          ),

          // Content Section
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Description
                Text(
                  resource.description,
                  style: TextStyle(
                    fontSize: 14,
                    color: AppTheme.getSecondaryTextColor(context),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16),

                // Contact Information
                if (resource.phone != null) ...[
                  _buildContactRow(
                    icon: Icons.phone_rounded,
                    label: resource.phone!,
                    color: const Color(0xFFD81B60),
                    onTap: () => _makePhoneCall(resource.phone!),
                  ),
                  const SizedBox(height: 8),
                ],
                if (resource.location != null || resource.address != null) ...[
                  _buildContactRow(
                    icon: Icons.location_on_rounded,
                    label: resource.address ?? resource.location!,
                    color: const Color(0xFF2196F3),
                    onTap: null,
                  ),
                  const SizedBox(height: 8),
                ],
                if (resource.email != null) ...[
                  _buildContactRow(
                    icon: Icons.email_rounded,
                    label: resource.email!,
                    color: const Color(0xFF4CAF50),
                    onTap: () => _sendEmail(resource.email!),
                  ),
                  const SizedBox(height: 8),
                ],
                if (resource.website != null) ...[
                  _buildContactRow(
                    icon: Icons.language_rounded,
                    label: resource.website!,
                    color: const Color(0xFF9C27B0),
                    onTap: () => _openWebsite(resource.website!),
                  ),
                ],

                // Verified Badge
                if (resource.isVerified) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF4CAF50).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified, size: 16, color: Color(0xFF4CAF50)),
                        SizedBox(width: 6),
                        Text(
                          'Verified Resource',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF4CAF50),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 16),

                // Action Buttons
                Row(
                  children: [
                    if (resource.phone != null)
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _makePhoneCall(resource.phone!),
                          icon: const Icon(Icons.call, size: 18),
                          label: const Text('Call'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFD81B60),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                    if (resource.phone != null && resource.website != null)
                      const SizedBox(width: 12),
                    if (resource.website != null)
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _openWebsite(resource.website!),
                          icon: const Icon(Icons.open_in_new, size: 18),
                          label: const Text('Website'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFFD81B60),
                            side: const BorderSide(color: Color(0xFFD81B60)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
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
    );
  }

  Widget _buildContactRow({
    required IconData icon,
    required String label,
    required Color color,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  color: onTap != null ? color : Colors.grey[700],
                  decoration: onTap != null ? TextDecoration.underline : null,
                ),
              ),
            ),
            if (onTap != null)
              Icon(
                Icons.chevron_right,
                size: 18,
                color: Colors.grey[400],
              ),
          ],
        ),
      ),
    );
  }
}
