import 'package:cancerapp/models/health_tip.dart';

class HealthTipsService {
  // Reliable cancer-related health tips from reputable sources (WHO, CDC, Mayo Clinic, NCI)
  static final List<HealthTip> _healthTips = [
    HealthTip(
      tip: 'Regular exercise reduces cancer risk by up to 30%',
      category: 'Exercise',
    ),
    HealthTip(
      tip: 'Eat at least 5 servings of fruits and vegetables daily to reduce cancer risk',
      category: 'Nutrition',
    ),
    HealthTip(
      tip: 'Avoid tobacco in all forms - it\'s linked to at least 15 types of cancer',
      category: 'Prevention',
    ),
    HealthTip(
      tip: 'Limit alcohol consumption to reduce risk of several cancers',
      category: 'Prevention',
    ),
    HealthTip(
      tip: 'Maintain a healthy weight - obesity is linked to 13 types of cancer',
      category: 'Weight',
    ),
    HealthTip(
      tip: 'Protect your skin from UV rays - use sunscreen SPF 30+ daily',
      category: 'Prevention',
    ),
    HealthTip(
      tip: 'Get vaccinated against HPV and Hepatitis B to prevent cancer',
      category: 'Prevention',
    ),
    HealthTip(
      tip: 'Screen regularly: Mammograms, colonoscopies, and Pap tests save lives',
      category: 'Screening',
    ),
    HealthTip(
      tip: 'Limit processed and red meat consumption to reduce colorectal cancer risk',
      category: 'Nutrition',
    ),
    HealthTip(
      tip: 'Stay hydrated - drink 8 glasses of water daily for optimal health',
      category: 'Hydration',
    ),
    HealthTip(
      tip: 'Get 7-9 hours of quality sleep each night to support immune function',
      category: 'Lifestyle',
    ),
    HealthTip(
      tip: 'Breastfeeding reduces breast cancer risk for both mother and child',
      category: 'Prevention',
    ),
    HealthTip(
      tip: 'Avoid exposure to environmental toxins and carcinogens at work and home',
      category: 'Prevention',
    ),
    HealthTip(
      tip: 'Include fiber-rich whole grains in your diet to reduce cancer risk',
      category: 'Nutrition',
    ),
    HealthTip(
      tip: 'Women: Perform monthly breast self-exams to detect changes early',
      category: 'Screening',
    ),
    HealthTip(
      tip: 'Limit exposure to radiation from medical imaging when possible',
      category: 'Prevention',
    ),
    HealthTip(
      tip: 'Cook meat at lower temperatures to avoid carcinogenic compounds',
      category: 'Nutrition',
    ),
    HealthTip(
      tip: 'Stay physically active - even 30 minutes of moderate activity helps',
      category: 'Exercise',
    ),
    HealthTip(
      tip: 'Know your family history and discuss cancer risks with your doctor',
      category: 'Awareness',
    ),
    HealthTip(
      tip: 'Reduce sugar intake - high sugar diets are linked to increased cancer risk',
      category: 'Nutrition',
    ),
    HealthTip(
      tip: 'Practice safe sun habits: Seek shade between 10 AM - 4 PM',
      category: 'Prevention',
    ),
    HealthTip(
      tip: 'Men over 50: Discuss prostate cancer screening with your doctor',
      category: 'Screening',
    ),
    HealthTip(
      tip: 'Avoid indoor tanning beds - they increase melanoma risk by 75%',
      category: 'Prevention',
    ),
    HealthTip(
      tip: 'Eat foods rich in antioxidants like berries, nuts, and leafy greens',
      category: 'Nutrition',
    ),
    HealthTip(
      tip: 'Manage stress through meditation, yoga, or other relaxation techniques',
      category: 'Mental Health',
    ),
    HealthTip(
      tip: 'Adults 45+: Get a colonoscopy every 10 years or as recommended',
      category: 'Screening',
    ),
    HealthTip(
      tip: 'Limit use of hormone replacement therapy - discuss risks with your doctor',
      category: 'Prevention',
    ),
    HealthTip(
      tip: 'Consume omega-3 fatty acids from fish, flaxseeds, and walnuts',
      category: 'Nutrition',
    ),
    HealthTip(
      tip: 'Quit smoking - cancer risk drops significantly within years of quitting',
      category: 'Prevention',
    ),
    HealthTip(
      tip: 'Watch for warning signs: unexplained weight loss, lumps, or persistent pain',
      category: 'Awareness',
    ),
    HealthTip(
      tip: 'Use protective equipment when handling chemicals or carcinogens',
      category: 'Safety',
    ),
  ];

  /// Gets a health tip for today based on the day of the year
  /// This ensures the same tip is shown throughout the entire day
  static HealthTip getTipOfTheDay() {
    final now = DateTime.now();
    final dayOfYear = now.difference(DateTime(now.year, 1, 1)).inDays;
    final tipIndex = dayOfYear % _healthTips.length;
    return _healthTips[tipIndex];
  }

  /// Gets all health tips (for future use)
  static List<HealthTip> getAllTips() {
    return List.unmodifiable(_healthTips);
  }

  /// Gets tips by category (for future use)
  static List<HealthTip> getTipsByCategory(String category) {
    return _healthTips.where((tip) => tip.category == category).toList();
  }
}
