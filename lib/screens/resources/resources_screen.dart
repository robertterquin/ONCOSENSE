import 'package:flutter/material.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:cancerapp/services/resources_service.dart';
import 'package:cancerapp/services/bookmark_service.dart';
import 'package:cancerapp/models/resource.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:url_launcher/url_launcher.dart';

class ResourcesScreen extends StatefulWidget {
  const ResourcesScreen({super.key});

  @override
  State<ResourcesScreen> createState() => _ResourcesScreenState();
}

class _ResourcesScreenState extends State<ResourcesScreen> {
  final resourcesService = ResourcesService();
  final _bookmarkService = BookmarkService();
  List<Resource> hotlines = [];
  List<Resource> screeningCenters = [];
  List<Resource> financialSupport = [];
  List<Resource> supportGroups = [];
  bool isLoading = true;
  Set<String> _bookmarkedResourceIds = {};

  @override
  void initState() {
    super.initState();
    _loadResources();
    _loadBookmarkedResources();
  }

  Future<void> _loadBookmarkedResources() async {
    final bookmarked = await _bookmarkService.getBookmarkedResources();
    setState(() {
      _bookmarkedResourceIds = bookmarked.map((r) => r.id).toSet();
    });
  }

  Future<void> _toggleBookmark(Resource resource) async {
    final wasBookmarked = _bookmarkedResourceIds.contains(resource.id);
    
    // Optimistic update
    setState(() {
      if (wasBookmarked) {
        _bookmarkedResourceIds.remove(resource.id);
      } else {
        _bookmarkedResourceIds.add(resource.id);
      }
    });

    final isNowBookmarked = await _bookmarkService.toggleResourceBookmark(resource);
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isNowBookmarked 
                ? '✅ Resource saved!' 
                : 'Resource removed from saved',
          ),
          duration: const Duration(seconds: 2),
          backgroundColor: isNowBookmarked ? Colors.green : Colors.grey[700],
        ),
      );
    }
  }

  Future<void> _loadResources() async {
    try {
      final results = await Future.wait([
        resourcesService.fetchHotlines(),
        resourcesService.fetchScreeningCenters(),
        resourcesService.fetchFinancialSupport(),
        resourcesService.fetchSupportGroups(),
      ]);

      setState(() {
        hotlines = results[0];
        screeningCenters = results[1];
        financialSupport = results[2];
        supportGroups = results[3];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load resources: $e')),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.getSurfaceColor(context),
      body: CustomScrollView(
        clipBehavior: Clip.antiAlias,
        slivers: [
            const CustomAppHeader(
              title: 'Resources',
              subtitle: 'Find support, hotlines, and centers',
            ),
            SliverToBoxAdapter(
              child: isLoading
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: CircularProgressIndicator(
                          color: Color(0xFFD81B60),
                        ),
                      ),
                    )
                  : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Hotlines',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: hotlines.isEmpty
                        ? Text(
                            'No hotlines available',
                            style: TextStyle(color: AppTheme.getSecondaryTextColor(context)),
                          )
                        : Column(
                            children: hotlines
                                .map((resource) => Padding(
                                      padding: const EdgeInsets.only(bottom: 12),
                                      child: _buildHotlineCard(resource),
                                    ))
                                .toList(),
                          ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Screening Centers',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: screeningCenters.isEmpty
                        ? Text(
                            'No screening centers available',
                            style: TextStyle(color: AppTheme.getSecondaryTextColor(context)),
                          )
                        : Column(
                            children: screeningCenters
                                .map((resource) => Padding(
                                      padding: const EdgeInsets.only(bottom: 12),
                                      child: _buildCenterCard(resource),
                                    ))
                                .toList(),
                          ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Financial Support',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: financialSupport.isEmpty
                        ? Text(
                            'No financial support resources available',
                            style: TextStyle(color: AppTheme.getSecondaryTextColor(context)),
                          )
                        : Column(
                            children: financialSupport
                                .map((resource) => Padding(
                                      padding: const EdgeInsets.only(bottom: 12),
                                      child: _buildSupportCard(resource),
                                    ))
                                .toList(),
                          ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Support Groups',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: supportGroups.isEmpty
                        ? Text(
                            'No support groups available',
                            style: TextStyle(color: AppTheme.getSecondaryTextColor(context)),
                          )
                        : Column(
                            children: supportGroups
                                .map((resource) => Padding(
                                      padding: const EdgeInsets.only(bottom: 12),
                                      child: _buildGroupCard(resource),
                                    ))
                                .toList(),
                          ),
                  ),
                  const SizedBox(height: 100), // Extra padding for floating bottom nav
                ],
              ),
            ),
          ],
        ),
    );
  }

  Widget _buildHotlineCard(Resource resource) {
    final isBookmarked = _bookmarkedResourceIds.contains(resource.id);
    final isDark = AppTheme.isDarkMode(context);
    
    return InkWell(
      onTap: resource.phone != null ? () => _makePhoneCall(resource.phone!) : null,
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
            Row(
              children: [
                Expanded(
                  child: Text(
                    resource.name,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.getTextColor(context),
                    ),
                  ),
                ),
                if (resource.isVerified)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF4CAF50).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.verified, size: 12, color: Color(0xFF4CAF50)),
                        SizedBox(width: 4),
                        Text(
                          'Verified',
                          style: TextStyle(
                            fontSize: 10,
                            color: Color(0xFF4CAF50),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(width: 8),
                InkWell(
                  onTap: () => _toggleBookmark(resource),
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: Icon(
                      isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                      size: 22,
                      color: isBookmarked ? const Color(0xFFD81B60) : AppTheme.getSecondaryTextColor(context),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              resource.description,
              style: TextStyle(
                fontSize: 12,
                color: AppTheme.getSecondaryTextColor(context),
              ),
            ),
            if (resource.phone != null) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.phone, size: 16, color: Color(0xFFD81B60)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      resource.phone!,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFFD81B60),
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFCE4EC),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.call,
                      size: 14,
                      color: Color(0xFFD81B60),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCenterCard(Resource resource) {
    final isBookmarked = _bookmarkedResourceIds.contains(resource.id);
    final isDark = AppTheme.isDarkMode(context);
    
    return Container(
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
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      resource.name,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.getTextColor(context),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      resource.description,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppTheme.getSecondaryTextColor(context),
                      ),
                    ),
                  ],
                ),
              ),
              if (resource.isVerified)
                const Icon(Icons.verified, size: 20, color: Color(0xFF4CAF50)),
              const SizedBox(width: 8),
              InkWell(
                onTap: () => _toggleBookmark(resource),
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.all(4),
                  child: Icon(
                    isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                    size: 22,
                    color: isBookmarked ? const Color(0xFFD81B60) : AppTheme.getSecondaryTextColor(context),
                  ),
                ),
              ),
            ],
          ),
          if (resource.location != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.location_on, size: 16, color: Color(0xFF2196F3)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    resource.location!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF2196F3),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ],
          if (resource.phone != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.phone, size: 16, color: AppTheme.getSecondaryTextColor(context)),
                const SizedBox(width: 8),
                Text(
                  resource.phone!,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.getSecondaryTextColor(context),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSupportCard(Resource resource) {
    final isBookmarked = _bookmarkedResourceIds.contains(resource.id);
    final isDark = AppTheme.isDarkMode(context);
    
    return Container(
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
          Row(
            children: [
              Expanded(
                child: Text(
                  resource.name,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.getTextColor(context),
                  ),
                ),
              ),
              if (resource.isVerified)
                const Icon(Icons.verified, size: 20, color: Color(0xFF4CAF50)),
              const SizedBox(width: 8),
              InkWell(
                onTap: () => _toggleBookmark(resource),
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.all(4),
                  child: Icon(
                    isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                    size: 22,
                    color: isBookmarked ? const Color(0xFFD81B60) : AppTheme.getSecondaryTextColor(context),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            resource.description,
            style: TextStyle(
              fontSize: 12,
              color: AppTheme.getSecondaryTextColor(context),
            ),
          ),
          if (resource.phone != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.phone, size: 14, color: Color(0xFFD81B60)),
                const SizedBox(width: 6),
                Text(
                  resource.phone!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFFD81B60),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildGroupCard(Resource resource) {
    final isBookmarked = _bookmarkedResourceIds.contains(resource.id);
    final isDark = AppTheme.isDarkMode(context);
    
    return Container(
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
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF4CAF50).withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.group_outlined,
              color: Color(0xFF4CAF50),
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  resource.name,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.getTextColor(context),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  resource.location ?? resource.description,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.getSecondaryTextColor(context),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (resource.isVerified)
            const Icon(Icons.verified, size: 18, color: Color(0xFF4CAF50)),
          const SizedBox(width: 8),
          InkWell(
            onTap: () => _toggleBookmark(resource),
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.all(4),
              child: Icon(
                isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                size: 22,
                color: isBookmarked ? const Color(0xFFD81B60) : AppTheme.getSecondaryTextColor(context),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
