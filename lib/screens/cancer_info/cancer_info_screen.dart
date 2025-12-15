import 'package:flutter/material.dart';
import 'package:cancerapp/services/cancer_info_service.dart';
import 'package:cancerapp/models/cancer_type.dart';
import 'package:cancerapp/screens/cancer_info/cancer_detail_screen.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';

class CancerInfoScreen extends StatefulWidget {
  const CancerInfoScreen({super.key});

  @override
  State<CancerInfoScreen> createState() => _CancerInfoScreenState();
}

class _CancerInfoScreenState extends State<CancerInfoScreen> {
  final CancerInfoService _cancerInfoService = CancerInfoService();
  List<CancerType> _cancerTypes = [];
  List<CancerType> _filteredCancerTypes = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadCancerTypes();
  }

  Future<void> _loadCancerTypes() async {
    try {
      final types = await _cancerInfoService.fetchAllCancerTypes();
      setState(() {
        _cancerTypes = types;
        _filteredCancerTypes = types;
        _isLoading = false;
        _errorMessage = null;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        // Check if it's a database setup error
        if (e.toString().contains('PGRST205') || 
            e.toString().contains('cancer_types') ||
            e.toString().contains('schema cache')) {
          _errorMessage = 'database_not_setup';
        } else {
          _errorMessage = e.toString();
        }
      });
    }
  }

  void _filterCancerTypes(String query) {
    setState(() {
      _searchQuery = query;
      if (query.isEmpty) {
        _filteredCancerTypes = _cancerTypes;
      } else {
        _filteredCancerTypes = _cancerTypes
            .where((cancer) =>
                cancer.name.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: CustomScrollView(
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
                      onChanged: _filterCancerTypes,
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
                  _isLoading
                      ? const Padding(
                          padding: EdgeInsets.all(40.0),
                          child: Center(
                            child: CircularProgressIndicator(
                              color: Color(0xFFD81B60),
                            ),
                          ),
                        )
                      : _errorMessage != null
                          ? _buildErrorView()
                          : _filteredCancerTypes.isEmpty
                          ? Padding(
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
                                      _searchQuery.isEmpty
                                          ? 'No cancer types available'
                                          : 'No results found for "$_searchQuery"',
                                      style: TextStyle(
                                        color: Colors.grey[600],
                                        fontSize: 16,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : Padding(
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
                                itemCount: _filteredCancerTypes.length,
                                itemBuilder: (context, index) {
                                  final cancer = _filteredCancerTypes[index];
                                  return InkWell(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              CancerDetailScreen(cancer: cancer),
                                        ),
                                      );
                                    },
                                    borderRadius: BorderRadius.circular(12),
                                    splashColor: const Color(0xFFD81B60).withOpacity(0.2),
                                    highlightColor: const Color(0xFFD81B60).withOpacity(0.1),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: const Color(0xFFE0E0E0),
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
                                              color: const Color(0xFFD81B60)
                                                  .withOpacity(0.1),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: const Icon(
                                              Icons.medical_information_outlined,
                                              color: Color(0xFFD81B60),
                                              size: 28,
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: 8),
                                            child: Text(
                                              cancer.name,
                                              textAlign: TextAlign.center,
                                              style: const TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w600,
                                              ),
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorView() {
    if (_errorMessage == 'database_not_setup') {
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
                onPressed: _loadCancerTypes,
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
              _errorMessage ?? 'Unknown error',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _loadCancerTypes,
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
