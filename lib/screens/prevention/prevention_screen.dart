import 'package:flutter/material.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:cancerapp/services/prevention_service.dart';
import 'package:cancerapp/models/prevention_tip.dart';
import 'package:cancerapp/models/self_check_guide.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:url_launcher/url_launcher.dart';

class PreventionScreen extends StatefulWidget {
  const PreventionScreen({super.key});

  @override
  State<PreventionScreen> createState() => _PreventionScreenState();
}

class _PreventionScreenState extends State<PreventionScreen> {
  final _preventionService = PreventionService();
  List<PreventionTip> _preventionTips = [];
  List<SelfCheckGuide> _selfCheckGuides = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPreventionData();
  }

  Future<void> _loadPreventionData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final tips = await _preventionService.getPreventionTips();
      final guides = await _preventionService.getSelfCheckGuides();

      setState(() {
        _preventionTips = tips;
        _selfCheckGuides = guides;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load prevention data. Please try again.';
        _isLoading = false;
      });
      print('Error loading prevention data: $e');
    }
  }

  /// Launch URL in browser
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

  /// Get IconData from icon name string
  IconData _getIconFromName(String iconName) {
    switch (iconName) {
      case 'restaurant_outlined':
        return Icons.restaurant_outlined;
      case 'apple':
        return Icons.apple;
      case 'directions_run_outlined':
        return Icons.directions_run_outlined;
      case 'fitness_center':
        return Icons.fitness_center;
      case 'smoke_free_outlined':
        return Icons.smoke_free_outlined;
      case 'local_drink_outlined':
        return Icons.local_drink_outlined;
      case 'wb_sunny_outlined':
        return Icons.wb_sunny_outlined;
      case 'bedtime':
        return Icons.bedtime;
      case 'monitor_weight_outlined':
        return Icons.monitor_weight_outlined;
      case 'medical_services_outlined':
        return Icons.medical_services_outlined;
      case 'vaccines_outlined':
        return Icons.vaccines_outlined;
      case 'water_drop_outlined':
        return Icons.water_drop_outlined;
      default:
        return Icons.info_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.getSurfaceColor(context),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildErrorState()
              : RefreshIndicator(
                  onRefresh: _loadPreventionData,
                  child: CustomScrollView(
                    clipBehavior: Clip.antiAlias,
                    slivers: [
                      const CustomAppHeader(
                        title: 'Prevention & Lifestyle',
                        subtitle: 'Healthy tips for a cancer-free life',
                      ),
                        SliverToBoxAdapter(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 24),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 16),
                                child: Text(
                                  'Prevention Tips',
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 16),
                                child: Text(
                                  'Evidence-based tips from trusted medical sources',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ),
                              const SizedBox(height: 16),
                              _preventionTips.isEmpty
                                  ? _buildEmptyTips()
                                  : Padding(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 16),
                                      child: Column(
                                        children: _preventionTips
                                            .map((tip) => Padding(
                                                  padding:
                                                      const EdgeInsets.only(
                                                          bottom: 12),
                                                  child: _buildTipCard(tip),
                                                ))
                                            .toList(),
                                      ),
                                    ),
                              const SizedBox(height: 24),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 16),
                                child: Text(
                                  'Self-Check Guides',
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 16),
                                child: Text(
                                  'Learn how to perform self-examinations',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ),
                              const SizedBox(height: 16),
                              _selfCheckGuides.isEmpty
                                  ? _buildEmptyGuides()
                                  : Padding(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 16),
                                      child: Column(
                                        children: _selfCheckGuides
                                            .map((guide) => Padding(
                                                  padding:
                                                      const EdgeInsets.only(
                                                          bottom: 12),
                                                  child: _buildGuideCard(guide),
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
                  ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text(
              _error ?? 'An error occurred',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadPreventionData,
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyTips() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Center(
        child: Text(
          'No prevention tips available at this time.',
          style: TextStyle(color: AppTheme.getSecondaryTextColor(context)),
        ),
      ),
    );
  }

  Widget _buildEmptyGuides() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Center(
        child: Text(
          'No self-check guides available at this time.',
          style: TextStyle(color: AppTheme.getSecondaryTextColor(context)),
        ),
      ),
    );
  }

  Widget _buildTipCard(PreventionTip tip) {
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
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFD81B60).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  _getIconFromName(tip.iconName),
                  color: const Color(0xFFD81B60),
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tip.title,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.getTextColor(context),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tip.description,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppTheme.getSecondaryTextColor(context),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (tip.detailedInfo != null) ...[
            const SizedBox(height: 12),
            Text(
              tip.detailedInfo!,
              style: TextStyle(
                fontSize: 12,
                color: AppTheme.getTextColor(context).withOpacity(0.8),
                height: 1.4,
              ),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.verified, size: 14, color: Color(0xFF4CAF50)),
              const SizedBox(width: 4),
              Expanded(
                child: GestureDetector(
                  onTap: () => _launchUrl(tip.sourceUrl),
                  child: Text(
                    'Source: ${tip.sourceName}',
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF1976D2),
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGuideCard(SelfCheckGuide guide) {
    return GestureDetector(
      onTap: () => _showGuideDetails(guide),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.isDarkMode(context) 
              ? const Color(0xFFD81B60).withOpacity(0.15)
              : const Color(0xFFFCE4EC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFD81B60).withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD81B60),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.school_outlined,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        guide.title,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.isDarkMode(context) ? Colors.white : const Color(0xFF212121),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        guide.description,
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.isDarkMode(context) ? Colors.white70 : const Color(0xFF757575),
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios, size: 16),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    guide.cancerType,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFFD81B60),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    guide.frequency,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF757575),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.verified, size: 12, color: Color(0xFF4CAF50)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    'Source: ${guide.sourceName}',
                    style: const TextStyle(
                      fontSize: 10,
                      color: Color(0xFF616161),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showGuideDetails(SelfCheckGuide guide) {
    final isDark = AppTheme.isDarkMode(context);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
          decoration: BoxDecoration(
            color: AppTheme.getSurfaceColor(context),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 8),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[700] : Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(24),
                  children: [
                    Text(
                      guide.title,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFD81B60),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      guide.description,
                      style: TextStyle(
                        fontSize: 16,
                        color: AppTheme.getSecondaryTextColor(context),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _buildInfoChip('Type: ${guide.cancerType}'),
                        const SizedBox(width: 8),
                        _buildInfoChip('Frequency: ${guide.frequency}'),
                      ],
                    ),
                    if (guide.ageRecommendation != null) ...[
                      const SizedBox(height: 8),
                      _buildInfoChip(
                          'Recommended for: ${guide.ageRecommendation}'),
                    ],
                    const SizedBox(height: 24),
                    const Text(
                      'Steps to Follow',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ...guide.steps.map((step) => _buildStepCard(step)),
                    if (guide.warningSigns != null &&
                        guide.warningSigns!.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      const Text(
                        '⚠️ Warning Signs',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFF57C00),
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...guide.warningSigns!
                          .map((sign) => _buildWarningSign(sign)),
                    ],
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFEBEE),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFD81B60)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.medical_services,
                                  color: Color(0xFFD81B60)),
                              SizedBox(width: 8),
                              Text(
                                'When to See a Doctor',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFD81B60),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            guide.whenToSeeDoctor,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Color(0xFF424242),
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Icon(Icons.verified,
                            size: 16, color: Color(0xFF4CAF50)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => _launchUrl(guide.sourceUrl),
                            child: Text(
                              'Source: ${guide.sourceName}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF1976D2),
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFD81B60),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Close'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFE1BEE7),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: Color(0xFF6A1B9A),
        ),
      ),
    );
  }

  Widget _buildStepCard(step) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFF3E5F5),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFCE93D8)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: const BoxDecoration(
                    color: Color(0xFF9C27B0),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      '${step.step}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    step.instruction,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF424242),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              step.detail,
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xFF616161),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWarningSign(String sign) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.warning_amber_rounded,
              size: 20, color: Color(0xFFF57C00)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              sign,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF424242),
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
