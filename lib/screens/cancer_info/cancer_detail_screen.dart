import 'package:flutter/material.dart';
import 'package:cancerapp/models/cancer_type.dart';
import 'package:cancerapp/widgets/modern_back_button.dart';

class CancerDetailScreen extends StatelessWidget {
  final CancerType cancer;

  const CancerDetailScreen({
    super.key,
    required this.cancer,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // Original App Bar with rounded corners
          SliverAppBar(
            floating: true,
            expandedHeight: 80,
            backgroundColor: const Color(0xFFD81B60),
            elevation: 0,
            leading: const ModernBackButton(),
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: SafeArea(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 64),
                    child: Text(
                      cancer.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Column(
              children: [
                const SizedBox(height: 16),

                // About Section - Modern Card
                _buildModernCard(
                  icon: Icons.info_outline,
                  title: 'About',
                  iconColor: const Color(0xFF2196F3),
                  child: Text(
                    cancer.description,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF424242),
                      height: 1.6,
                      letterSpacing: 0.1,
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Statistics Section
                if (cancer.statistics != null)
                  _buildModernCard(
                    icon: Icons.bar_chart,
                    title: 'Statistics',
                    iconColor: const Color(0xFF4CAF50),
                    child: Text(
                      cancer.statistics!,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF424242),
                        height: 1.6,
                        letterSpacing: 0.1,
                      ),
                    ),
                  ),

                if (cancer.statistics != null) const SizedBox(height: 16),

                // Symptoms & Warning Signs Section
                _buildModernCard(
                  icon: Icons.warning_amber_rounded,
                  title: 'Symptoms & Warning Signs',
                  iconColor: const Color(0xFFFF9800),
                  child: _buildModernList(cancer.symptoms),
                ),

                const SizedBox(height: 16),

                // Risk Factors Section
                _buildModernCard(
                  icon: Icons.shield_outlined,
                  title: 'Risk Factors',
                  iconColor: const Color(0xFFF44336),
                  child: _buildModernList(cancer.riskFactors),
                ),

                const SizedBox(height: 16),

                // Prevention Tips Section
                _buildModernCard(
                  icon: Icons.verified_user,
                  title: 'Prevention Tips',
                  iconColor: const Color(0xFF9C27B0),
                  child: _buildModernList(cancer.preventionTips),
                ),

                const SizedBox(height: 16),

                // Screening Methods Section
                _buildModernCard(
                  icon: Icons.medical_services_rounded,
                  title: 'Screening Methods',
                  iconColor: const Color(0xFF00BCD4),
                  child: _buildModernList(cancer.screeningMethods),
                ),

                const SizedBox(height: 16),

                // Early Detection Section
                _buildModernCard(
                  icon: Icons.tips_and_updates,
                  title: 'Early Detection',
                  iconColor: const Color(0xFFFFB300),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF8E1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFFFFE082),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.lightbulb,
                          color: Color(0xFFFFB300),
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            cancer.earlyDetectionInfo,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Color(0xFF424242),
                              height: 1.6,
                              letterSpacing: 0.1,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Disclaimer Section
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F5F5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFE0E0E0),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.info_outline_rounded,
                        color: Colors.grey[700],
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Medical Disclaimer',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Colors.grey[800],
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'This information is for educational purposes only. Always consult with healthcare professionals for medical advice, diagnosis, or treatment.',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600],
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModernCard({
    required IconData icon,
    required String title,
    required Color iconColor,
    required Widget child,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(
          color: const Color(0xFFF0F0F0),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: iconColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF212121),
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildModernList(List<String> items) {
    return Column(
      children: items.asMap().entries.map((entry) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 6),
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: const Color(0xFFD81B60).withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: Color(0xFFD81B60),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  entry.value,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF424242),
                    height: 1.6,
                    letterSpacing: 0.1,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
