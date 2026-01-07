import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/providers/cancer_info_provider.dart';
import 'package:cancerapp/models/cancer_type.dart';
import 'package:cancerapp/screens/cancer_info/cancer_detail_screen.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:cancerapp/utils/theme.dart';

class CancerInfoScreen extends ConsumerStatefulWidget {
  const CancerInfoScreen({super.key});

  @override
  ConsumerState<CancerInfoScreen> createState() => _CancerInfoScreenState();
}

class _CancerInfoScreenState extends ConsumerState<CancerInfoScreen> with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    // Use the StateNotifier to handle search
    ref.read(filteredCancerTypesProvider.notifier).search(query);
  }

  /// Get icon for each cancer type
  IconData _getIconForCancerType(String cancerName) {
    final name = cancerName.toLowerCase();
    
    if (name.contains('breast')) {
      return Icons.favorite; // Heart/ribbon for breast cancer awareness
    } else if (name.contains('lung')) {
      return Icons.air; // Air/breathing for lungs
    } else if (name.contains('prostate')) {
      return Icons.man; // Male symbol
    } else if (name.contains('cervical') || name.contains('ovarian') || name.contains('uterine')) {
      return Icons.woman; // Female symbol
    } else if (name.contains('colorectal') || name.contains('colon') || name.contains('rectal')) {
      return Icons.restaurant; // Digestive system
    } else if (name.contains('skin') || name.contains('melanoma')) {
      return Icons.wb_sunny; // Sun for skin
    } else if (name.contains('liver')) {
      return Icons.water_drop; // Liver filtration
    } else if (name.contains('pancre')) {
      return Icons.biotech; // Pancreas/organs
    } else if (name.contains('kidney') || name.contains('renal')) {
      return Icons.healing; // Kidneys
    } else if (name.contains('bladder')) {
      return Icons.bubble_chart; // Bladder
    } else if (name.contains('brain') || name.contains('glioma')) {
      return Icons.psychology; // Brain
    } else if (name.contains('thyroid')) {
      return Icons.accessible; // Throat/neck area
    } else if (name.contains('leukemia') || name.contains('lymphoma') || name.contains('blood')) {
      return Icons.bloodtype; // Blood
    } else if (name.contains('stomach') || name.contains('gastric')) {
      return Icons.set_meal; // Stomach
    } else if (name.contains('esophag')) {
      return Icons.local_dining; // Esophagus/throat
    } else if (name.contains('bone') || name.contains('sarcoma')) {
      return Icons.accessibility_new; // Bones/skeleton
    } else if (name.contains('oral') || name.contains('mouth') || name.contains('tongue')) {
      return Icons.record_voice_over; // Mouth/oral
    } else {
      return Icons.medical_information_outlined; // Default
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    
    // Watch the filtered cancer types provider
    final cancerTypesAsync = ref.watch(filteredCancerTypesProvider);
    final searchQuery = ref.watch(filteredCancerTypesProvider.notifier).searchQuery;
    
    return Scaffold(
      backgroundColor: AppTheme.getSurfaceColor(context),
      body: CustomScrollView(
        clipBehavior: Clip.antiAlias,
        slivers: [
            const CustomAppHeader(
              title: 'Cancer Information',
              subtitle: 'Learn about types, symptoms, and prevention',
            ),
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: TextField(
                      controller: _searchController,
                      onChanged: _onSearchChanged,
                      decoration: InputDecoration(
                        hintText: 'Search cancer types...',
                        prefixIcon: const Icon(Icons.search, color: Color(0xFFD81B60)),
                        filled: true,
                        fillColor: Colors.grey[50],
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.grey[300]!),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.grey[300]!),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFD81B60)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Cancer Types',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Use .when() to handle loading/error/data states
                  cancerTypesAsync.when(
                    loading: () => const Padding(
                      padding: EdgeInsets.all(40.0),
                      child: Center(
                        child: CircularProgressIndicator(
                          color: Color(0xFFD81B60),
                        ),
                      ),
                    ),
                    error: (error, stack) => _buildErrorView(error),
                    data: (cancerTypes) {
                      if (cancerTypes.isEmpty) {
                        return Padding(
                          padding: const EdgeInsets.all(40.0),
                          child: Center(
                            child: Column(
                              children: [
                                Icon(
                                  Icons.search_off,
                                  size: 64,
                                  color: Colors.grey[400],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  searchQuery.isEmpty
                                      ? 'No cancer types available'
                                      : 'No results found for "$searchQuery"',
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                    fontSize: 16,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        );
                      }
                      
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            childAspectRatio: 1.2,
                          ),
                          itemCount: cancerTypes.length,
                          itemBuilder: (context, index) {
                            final cancer = cancerTypes[index];
                            return _buildCancerTypeCard(cancer);
                          },
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ],
        ),
    );
  }
  
  Widget _buildCancerTypeCard(CancerType cancer) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => CancerDetailScreen(cancer: cancer),
          ),
        );
      },
      borderRadius: BorderRadius.circular(12),
      splashColor: const Color(0xFFD81B60).withOpacity(0.2),
      highlightColor: const Color(0xFFD81B60).withOpacity(0.1),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.getCardColor(context),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppTheme.getDividerColor(context),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFD81B60).withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                _getIconForCancerType(cancer.name),
                color: const Color(0xFFD81B60),
                size: 28,
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Text(
                cancer.name,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.getTextColor(context),
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorView(Object error) {
    final errorMessage = error.toString();
    final isDatabaseSetupError = errorMessage.contains('PGRST205') || 
        errorMessage.contains('cancer_types') ||
        errorMessage.contains('schema cache');
    
    if (isDatabaseSetupError) {
      return Padding(
        padding: const EdgeInsets.all(24.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.orange[50],
                  borderRadius: BorderRadius.circular(60),
                ),
                child: Icon(
                  Icons.info_outline,
                  size: 60,
                  color: Colors.orange[700],
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Database Setup Required',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'The cancer information database needs to be set up in Supabase.',
                style: TextStyle(
                  fontSize: 15,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Setup Instructions:',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[800],
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildInstructionStep('1', 'Open CANCER_DATA_SETUP.md file'),
                    _buildInstructionStep('2', 'Go to Supabase Dashboard → SQL Editor'),
                    _buildInstructionStep('3', 'Run Step 1: CREATE TABLE'),
                    _buildInstructionStep('4', 'Run Step 2: INSERT data'),
                    _buildInstructionStep('5', 'Restart the app'),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () => ref.invalidate(filteredCancerTypesProvider),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD81B60),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Generic error
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red[300],
            ),
            const SizedBox(height: 16),
            Text(
              'Error Loading Data',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              errorMessage,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => ref.invalidate(filteredCancerTypesProvider),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD81B60),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstructionStep(String number, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: const Color(0xFFD81B60),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                number,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey[700],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
