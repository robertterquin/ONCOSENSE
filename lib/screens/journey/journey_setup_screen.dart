import 'package:flutter/material.dart';
import 'package:cancerapp/services/journey_service.dart';
import 'package:cancerapp/utils/theme.dart';

class JourneySetupScreen extends StatefulWidget {
  const JourneySetupScreen({super.key});

  @override
  State<JourneySetupScreen> createState() => _JourneySetupScreenState();
}

class _JourneySetupScreenState extends State<JourneySetupScreen> {
  final JourneyService _journeyService = JourneyService();
  final PageController _pageController = PageController();
  int _currentPage = 0;
  
  // Setup data
  DateTime _journeyStartDate = DateTime.now();
  bool _isCancerFree = false;
  DateTime? _cancerFreeDate;
  String _selectedJourneyType = 'patient'; // patient, survivor, supporter

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _startJourney();
    }
  }

  Future<void> _startJourney() async {
    await _journeyService.startJourney(
      diagnosisDate: _journeyStartDate,
      cancerFreeDate: _isCancerFree ? _cancerFreeDate : null,
    );
    
    if (mounted) {
      // No need to navigate, the parent widget will rebuild
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppTheme.isDarkMode(context);
    final topPadding = MediaQuery.of(context).padding.top;
    
    return Scaffold(
      backgroundColor: AppTheme.getBackgroundColor(context),
      body: Column(
        children: [
          // Header
          Container(
            padding: EdgeInsets.only(
              top: topPadding + 20,
              left: 20,
              right: 20,
              bottom: 20,
            ),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFFD81B60),
                  Color(0xFFE91E63),
                ],
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.auto_graph, color: Colors.white, size: 28),
                    SizedBox(width: 12),
                    Text(
                      'Start Your Journey',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Let\'s set up your personal health tracker',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.9),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 20),
                // Progress indicator
                Row(
                  children: List.generate(3, (index) {
                    return Expanded(
                      child: Container(
                        margin: EdgeInsets.only(right: index < 2 ? 8 : 0),
                        height: 4,
                        decoration: BoxDecoration(
                          color: index <= _currentPage 
                              ? Colors.white 
                              : Colors.white.withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
          
          // Page View
          Expanded(
            child: PageView(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _currentPage = index;
                });
              },
              children: [
                _buildJourneyTypePage(isDark),
                _buildStartDatePage(isDark),
                _buildCancerFreePage(isDark),
              ],
            ),
          ),
          
          // Bottom Buttons
          Container(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                if (_currentPage > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        _pageController.previousPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFD81B60),
                        side: const BorderSide(color: Color(0xFFD81B60)),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Back'),
                    ),
                  ),
                if (_currentPage > 0) const SizedBox(width: 12),
                Expanded(
                  flex: _currentPage > 0 ? 1 : 2,
                  child: ElevatedButton(
                    onPressed: _nextPage,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD81B60),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      _currentPage == 2 ? 'Start Journey' : 'Continue',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildJourneyTypePage(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 20),
          Text(
            'Who is this journey for?',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.getTextColor(context),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'This helps us personalize your experience',
            style: TextStyle(
              fontSize: 14,
              color: isDark ? Colors.white60 : Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 32),
          _buildJourneyTypeOption(
            isDark,
            icon: Icons.person,
            title: 'I\'m a Patient',
            subtitle: 'Currently undergoing treatment or monitoring',
            value: 'patient',
          ),
          const SizedBox(height: 16),
          _buildJourneyTypeOption(
            isDark,
            icon: Icons.favorite,
            title: 'I\'m a Survivor',
            subtitle: 'Completed treatment, in remission or cancer-free',
            value: 'survivor',
          ),
        ],
      ),
    );
  }

  Widget _buildJourneyTypeOption(
    bool isDark, {
    required IconData icon,
    required String title,
    required String subtitle,
    required String value,
  }) {
    final isSelected = _selectedJourneyType == value;
    
    return InkWell(
      onTap: () {
        setState(() {
          _selectedJourneyType = value;
        });
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected 
              ? const Color(0xFFD81B60).withValues(alpha: 0.1) 
              : (isDark ? AppTheme.darkCard : Colors.white),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected 
                ? const Color(0xFFD81B60) 
                : (isDark ? Colors.white12 : Colors.grey.shade200),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected 
                    ? const Color(0xFFD81B60).withValues(alpha: 0.2) 
                    : (isDark ? Colors.white10 : Colors.grey.shade100),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: isSelected 
                    ? const Color(0xFFD81B60) 
                    : (isDark ? Colors.white60 : Colors.grey),
                size: 28,
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
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isSelected 
                          ? const Color(0xFFD81B60) 
                          : AppTheme.getTextColor(context),
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white60 : Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: Color(0xFFD81B60),
                size: 24,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStartDatePage(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 20),
          Text(
            'When did your journey begin?',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.getTextColor(context),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'This could be your diagnosis date or when you started treatment',
            style: TextStyle(
              fontSize: 14,
              color: isDark ? Colors.white60 : Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 32),
          
          // Date Display Card
          InkWell(
            onTap: () => _selectDate(context, isStartDate: true),
            borderRadius: BorderRadius.circular(16),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkCard : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: const Color(0xFFD81B60).withValues(alpha: 0.3),
                ),
              ),
              child: Column(
                children: [
                  const Icon(
                    Icons.calendar_today,
                    color: Color(0xFFD81B60),
                    size: 48,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _formatDate(_journeyStartDate),
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.getTextColor(context),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Tap to change',
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? Colors.white60 : Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Quick date options
          Text(
            'Quick options',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white70 : Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildQuickDateChip('Today', DateTime.now()),
              _buildQuickDateChip(
                '1 week ago',
                DateTime.now().subtract(const Duration(days: 7)),
              ),
              _buildQuickDateChip(
                '1 month ago',
                DateTime.now().subtract(const Duration(days: 30)),
              ),
              _buildQuickDateChip(
                '3 months ago',
                DateTime.now().subtract(const Duration(days: 90)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickDateChip(String label, DateTime date) {
    return ActionChip(
      label: Text(label),
      onPressed: () {
        setState(() {
          _journeyStartDate = date;
        });
      },
      backgroundColor: const Color(0xFFD81B60).withValues(alpha: 0.1),
      side: BorderSide.none,
      labelStyle: const TextStyle(
        color: Color(0xFFD81B60),
        fontWeight: FontWeight.w500,
      ),
    );
  }

  Widget _buildCancerFreePage(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 20),
          Text(
            'Are you cancer-free?',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.getTextColor(context),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'If so, we\'ll help you track your cancer-free days!',
            style: TextStyle(
              fontSize: 14,
              color: isDark ? Colors.white60 : Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 32),
          
          // Cancer-free toggle
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkCard : Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _isCancerFree 
                        ? Colors.green.withValues(alpha: 0.2) 
                        : (isDark ? Colors.white10 : Colors.grey.shade100),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _isCancerFree ? Icons.celebration : Icons.help_outline,
                    color: _isCancerFree ? Colors.green : Colors.grey,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'I am cancer-free',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.getTextColor(context),
                        ),
                      ),
                      Text(
                        'Track days since remission',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.white60 : Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: _isCancerFree,
                  onChanged: (value) {
                    setState(() {
                      _isCancerFree = value;
                      if (value && _cancerFreeDate == null) {
                        _cancerFreeDate = DateTime.now();
                      }
                    });
                  },
                  activeColor: const Color(0xFFD81B60),
                ),
              ],
            ),
          ),
          
          // Cancer-free date picker (shown when toggle is on)
          if (_isCancerFree) ...[
            const SizedBox(height: 24),
            Text(
              'When were you declared cancer-free?',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppTheme.getTextColor(context),
              ),
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: () => _selectDate(context, isStartDate: false),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: Colors.green.withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.event_available, color: Colors.green, size: 32),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _formatDate(_cancerFreeDate ?? DateTime.now()),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.green,
                            ),
                          ),
                          Text(
                            'Tap to change date',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.white60 : Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.edit_calendar, color: Colors.green),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.celebration, color: Colors.green),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'You\'ll be able to track your cancer-free milestone days: 7, 30, 90, 180, 365 days and more!',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? Colors.white70 : Colors.grey.shade700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          
          // Encouragement for those still in treatment
          if (!_isCancerFree) ...[
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFD81B60).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.favorite, color: Color(0xFFD81B60)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'You can update this later when you reach that milestone. We\'re cheering for you! 💪',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? Colors.white70 : Colors.grey.shade700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _selectDate(BuildContext context, {required bool isStartDate}) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isStartDate ? _journeyStartDate : (_cancerFreeDate ?? DateTime.now()),
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFFD81B60),
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: Colors.black87,
            ),
          ),
          child: child!,
        );
      },
    );
    
    if (picked != null) {
      setState(() {
        if (isStartDate) {
          _journeyStartDate = picked;
        } else {
          _cancerFreeDate = picked;
        }
      });
    }
  }

  String _formatDate(DateTime date) {
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}
