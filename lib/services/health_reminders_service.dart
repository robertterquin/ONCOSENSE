import 'package:cancerapp/models/health_reminder.dart';
import 'package:cancerapp/services/supabase_service.dart';

/// Service for managing health reminders with reliable health information
class HealthRemindersService {
  final SupabaseService _supabase = SupabaseService();

  /// Get active health reminders
  Future<List<HealthReminder>> getActiveReminders({
    String? category,
    int limit = 10,
  }) async {
    try {
      dynamic query = _supabase.client
          .from('health_reminders')
          .select('*')
          .eq('is_active', true)
          .order('priority', ascending: false);

      if (category != null) {
        query = query.eq('category', category);
      }

      query = query.limit(limit);

      final response = await query;
      return (response as List)
          .map((json) => HealthReminder.fromJson(json))
          .toList();
    } catch (e) {
      print('❌ Error fetching health reminders: $e');
      return _getDefaultReminders();
    }
  }

  /// Get reminders that should be shown now based on frequency
  Future<List<HealthReminder>> getRemindersToShow({int count = 2, bool forceRefresh = false}) async {
    try {
      final allReminders = await getActiveReminders();
      
      if (allReminders.isEmpty) {
        return _getDefaultReminders().take(count).toList();
      }
      
      // If forceRefresh is true (manual refresh or app restart), show random reminders
      if (forceRefresh) {
        allReminders.shuffle();
        return allReminders.take(count).toList();
      }
      
      // Filter reminders that should show based on frequency
      final remindersToShow = allReminders.where((r) => r.shouldShow()).toList();
      
      // If we have enough reminders that should show, use them
      if (remindersToShow.length >= count) {
        // Shuffle and return random selection
        remindersToShow.shuffle();
        return remindersToShow.take(count).toList();
      }
      
      // If not enough reminders to show, randomly pick from all active reminders
      allReminders.shuffle();
      return allReminders.take(count).toList();
    } catch (e) {
      print('❌ Error getting reminders to show: $e');
      return _getDefaultReminders().take(count).toList();
    }
  }

  /// Update last shown timestamp for a reminder
  Future<void> markReminderAsShown(String reminderId) async {
    try {
      await _supabase.client
          .from('health_reminders')
          .update({
            'last_shown_at': DateTime.now().toIso8601String(),
          })
          .eq('id', reminderId);
    } catch (e) {
      print('❌ Error marking reminder as shown: $e');
    }
  }

  /// Get reminders by category
  Future<List<HealthReminder>> getRemindersByCategory(String category) async {
    return await getActiveReminders(category: category);
  }

  /// Seed database with reliable health information
  /// Sources: WHO, CDC, American Cancer Society, National Cancer Institute
  Future<void> seedHealthReminders() async {
    final defaultReminders = _getReliableHealthReminders();
    
    try {
      for (final reminder in defaultReminders) {
        // Check if reminder already exists
        final existing = await _supabase.client
            .from('health_reminders')
            .select('id')
            .eq('id', reminder.id)
            .maybeSingle();

        if (existing == null) {
          await _supabase.client
              .from('health_reminders')
              .insert(reminder.toJson());
        }
      }
      print('✅ Health reminders seeded successfully');
    } catch (e) {
      print('❌ Error seeding health reminders: $e');
    }
  }

  /// Get reliable health reminders from trusted sources
  List<HealthReminder> _getReliableHealthReminders() {
    return [
      // Hydration Reminders
      HealthReminder(
        id: 'hydration_1',
        title: 'Stay Hydrated',
        message: 'Drink 8 glasses of water daily',
        icon: 'water_drop',
        color: '2196F3',
        category: ReminderCategory.hydration,
        frequencyHours: 3,
        priority: 5,
        source: 'WHO - World Health Organization',
      ),
      HealthReminder(
        id: 'hydration_2',
        title: 'Water Break',
        message: 'Take a moment to hydrate',
        icon: 'local_drink',
        color: '03A9F4',
        category: ReminderCategory.hydration,
        frequencyHours: 4,
        priority: 4,
        source: 'CDC - Centers for Disease Control',
      ),

      // Exercise Reminders
      HealthReminder(
        id: 'exercise_1',
        title: 'Move Your Body',
        message: 'Take a 3-minute walk break',
        icon: 'directions_walk',
        color: '4CAF50',
        category: ReminderCategory.exercise,
        frequencyHours: 2,
        priority: 5,
        source: 'American Cancer Society',
      ),
      HealthReminder(
        id: 'exercise_2',
        title: 'Stay Active',
        message: 'Aim for 150 minutes of moderate exercise weekly',
        icon: 'fitness_center',
        color: '66BB6A',
        category: ReminderCategory.exercise,
        frequencyHours: 24,
        priority: 4,
        source: 'WHO Physical Activity Guidelines',
      ),
      HealthReminder(
        id: 'exercise_3',
        title: 'Stretch Time',
        message: 'Simple stretches reduce tension',
        icon: 'self_improvement',
        color: '81C784',
        category: ReminderCategory.exercise,
        frequencyHours: 4,
        priority: 3,
        source: 'National Cancer Institute',
      ),

      // Nutrition Reminders
      HealthReminder(
        id: 'nutrition_1',
        title: 'Healthy Eating',
        message: 'Include fruits & vegetables in every meal',
        icon: 'restaurant',
        color: 'FF9800',
        category: ReminderCategory.nutrition,
        frequencyHours: 24,
        priority: 4,
        source: 'WHO Healthy Diet Factsheet',
      ),
      HealthReminder(
        id: 'nutrition_2',
        title: 'Colorful Plate',
        message: 'Eat a rainbow of fruits and vegetables',
        icon: 'eco',
        color: 'FFA726',
        category: ReminderCategory.nutrition,
        frequencyHours: 24,
        priority: 3,
        source: 'American Cancer Society Nutrition Guidelines',
      ),

      // Screening Reminders
      HealthReminder(
        id: 'screening_1',
        title: 'Schedule Screening',
        message: 'Regular check-ups save lives',
        icon: 'local_hospital',
        color: 'E91E63',
        category: ReminderCategory.screening,
        frequencyHours: 168, // Weekly
        priority: 5,
        source: 'National Cancer Institute Screening Guidelines',
      ),
      HealthReminder(
        id: 'screening_2',
        title: 'Early Detection',
        message: 'Know your screening schedule',
        icon: 'health_and_safety',
        color: 'EC407A',
        category: ReminderCategory.screening,
        frequencyHours: 168,
        priority: 5,
        source: 'CDC Cancer Screening Recommendations',
      ),

      // Mental Health Reminders
      HealthReminder(
        id: 'mental_1',
        title: 'Mindful Moment',
        message: 'Take 5 minutes to breathe deeply',
        icon: 'spa',
        color: '9C27B0',
        category: ReminderCategory.mentalHealth,
        frequencyHours: 6,
        priority: 4,
        source: 'WHO Mental Health Guidelines',
      ),
      HealthReminder(
        id: 'mental_2',
        title: 'Stress Management',
        message: 'Practice relaxation techniques daily',
        icon: 'self_improvement',
        color: 'AB47BC',
        category: ReminderCategory.mentalHealth,
        frequencyHours: 24,
        priority: 3,
        source: 'National Institute of Mental Health',
      ),

      // Sun Protection Reminders
      HealthReminder(
        id: 'sun_1',
        title: 'Sun Protection',
        message: 'Apply SPF 30+ sunscreen',
        icon: 'wb_sunny',
        color: 'FFC107',
        category: ReminderCategory.sunProtection,
        frequencyHours: 12,
        priority: 4,
        source: 'American Cancer Society Sun Safety',
      ),
      HealthReminder(
        id: 'sun_2',
        title: 'Avoid Peak Sun',
        message: 'Limit sun exposure 10AM-3PM',
        icon: 'wb_twilight',
        color: 'FFB300',
        category: ReminderCategory.sunProtection,
        frequencyHours: 24,
        priority: 3,
        source: 'CDC Skin Cancer Prevention',
      ),

      // Sleep Health Reminders
      HealthReminder(
        id: 'sleep_1',
        title: 'Quality Sleep',
        message: 'Aim for 7-9 hours of sleep',
        icon: 'bedtime',
        color: '5E35B1',
        category: ReminderCategory.sleepHealth,
        frequencyHours: 24,
        priority: 4,
        source: 'National Sleep Foundation',
      ),

      // Self-Examination Reminders
      HealthReminder(
        id: 'self_exam_1',
        title: 'Monthly Self-Check',
        message: 'Perform breast self-examination',
        icon: 'favorite',
        color: 'D81B60',
        category: ReminderCategory.selfExam,
        frequencyHours: 720, // Monthly (30 days)
        priority: 5,
        source: 'American Cancer Society Self-Exam Guidelines',
      ),
      HealthReminder(
        id: 'self_exam_2',
        title: 'Skin Check',
        message: 'Check your skin for changes',
        icon: 'healing',
        color: 'F06292',
        category: ReminderCategory.selfExam,
        frequencyHours: 720, // Monthly
        priority: 4,
        source: 'Skin Cancer Foundation Guidelines',
      ),

      // Additional Varied Reminders
      HealthReminder(
        id: 'exercise_4',
        title: 'Desk Break',
        message: 'Stand up and move every hour',
        icon: 'directions_walk',
        color: '8BC34A',
        category: ReminderCategory.exercise,
        frequencyHours: 1,
        priority: 4,
        source: 'WHO Workplace Health',
      ),
      HealthReminder(
        id: 'hydration_3',
        title: 'Morning Hydration',
        message: 'Start your day with a glass of water',
        icon: 'water_drop',
        color: '00BCD4',
        category: ReminderCategory.hydration,
        frequencyHours: 24,
        priority: 3,
        source: 'National Health Service',
      ),
      HealthReminder(
        id: 'nutrition_3',
        title: 'Limit Processed Foods',
        message: 'Choose whole foods over processed options',
        icon: 'restaurant',
        color: 'FF6F00',
        category: ReminderCategory.nutrition,
        frequencyHours: 48,
        priority: 4,
        source: 'World Cancer Research Fund',
      ),
      HealthReminder(
        id: 'nutrition_4',
        title: 'Protein Intake',
        message: 'Include lean proteins in your meals',
        icon: 'eco',
        color: 'E65100',
        category: ReminderCategory.nutrition,
        frequencyHours: 24,
        priority: 3,
        source: 'American Institute for Cancer Research',
      ),
      HealthReminder(
        id: 'mental_3',
        title: 'Gratitude Practice',
        message: 'List 3 things you\'re grateful for',
        icon: 'spa',
        color: '7B1FA2',
        category: ReminderCategory.mentalHealth,
        frequencyHours: 24,
        priority: 3,
        source: 'Mental Health Foundation',
      ),
      HealthReminder(
        id: 'mental_4',
        title: 'Connect with Others',
        message: 'Reach out to a friend or family member',
        icon: 'favorite',
        color: '8E24AA',
        category: ReminderCategory.mentalHealth,
        frequencyHours: 48,
        priority: 4,
        source: 'National Alliance on Mental Illness',
      ),
      HealthReminder(
        id: 'sleep_2',
        title: 'Bedtime Routine',
        message: 'Avoid screens 1 hour before bed',
        icon: 'bedtime',
        color: '4527A0',
        category: ReminderCategory.sleepHealth,
        frequencyHours: 24,
        priority: 3,
        source: 'American Academy of Sleep Medicine',
      ),
      HealthReminder(
        id: 'exercise_5',
        title: 'Cardio Health',
        message: 'Get your heart rate up for 30 minutes',
        icon: 'favorite',
        color: '43A047',
        category: ReminderCategory.exercise,
        frequencyHours: 48,
        priority: 4,
        source: 'American Heart Association',
      ),
      HealthReminder(
        id: 'screening_3',
        title: 'Track Your Health',
        message: 'Keep a health journal or log',
        icon: 'health_and_safety',
        color: 'C2185B',
        category: ReminderCategory.screening,
        frequencyHours: 168,
        priority: 3,
        source: 'Mayo Clinic Health Guidelines',
      ),
    ];
  }

  /// Get default reminders if database is unavailable
  List<HealthReminder> _getDefaultReminders() {
    return _getReliableHealthReminders().take(5).toList();
  }
}
