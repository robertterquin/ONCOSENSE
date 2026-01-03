import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cancerapp/models/journey_entry.dart';
import 'package:cancerapp/models/treatment.dart';
import 'package:cancerapp/models/milestone.dart';
import 'package:cancerapp/services/supabase_service.dart';

/// Service to manage all cancer journey data
class JourneyService extends ChangeNotifier {
  static final JourneyService _instance = JourneyService._internal();
  factory JourneyService() => _instance;
  JourneyService._internal();

  // Storage keys
  static const String _entriesKey = 'journey_entries';
  static const String _treatmentsKey = 'journey_treatments';
  static const String _milestonesKey = 'journey_milestones';
  static const String _diagnosisDateKey = 'diagnosis_date';
  static const String _cancerFreeStartKey = 'cancer_free_start_date';
  static const String _journeyStartedKey = 'journey_started';

  List<JourneyEntry> _entries = [];
  List<Treatment> _treatments = [];
  List<Milestone> _milestones = [];
  DateTime? _diagnosisDate;
  DateTime? _cancerFreeStartDate;
  bool _journeyStarted = false;
  bool _isLoaded = false;

  // Getters
  List<JourneyEntry> get entries => List.unmodifiable(_entries);
  List<Treatment> get treatments => List.unmodifiable(_treatments);
  List<Milestone> get milestones => List.unmodifiable(_milestones);
  DateTime? get diagnosisDate => _diagnosisDate;
  DateTime? get cancerFreeStartDate => _cancerFreeStartDate;
  bool get journeyStarted => _journeyStarted;
  bool get isLoaded => _isLoaded;

  /// Initialize and load data
  /// Set [forceReload] to true to reload data even if already loaded (e.g., after login)
  Future<void> initialize({bool forceReload = false}) async {
    if (_isLoaded && !forceReload) return;
    await _loadAllData();
    _isLoaded = true;
  }
  
  /// Reset the service state (call on logout)
  /// This clears in-memory data and resets the loaded flag so data will be reloaded on next initialize
  void reset() {
    _entries.clear();
    _treatments.clear();
    _milestones.clear();
    _diagnosisDate = null;
    _cancerFreeStartDate = null;
    _journeyStarted = false;
    _isLoaded = false;
    notifyListeners();
  }

  /// Load all journey data from storage
  Future<void> _loadAllData() async {
    final prefs = await SharedPreferences.getInstance();

    // Load journey started flag
    _journeyStarted = prefs.getBool(_journeyStartedKey) ?? false;

    // Load diagnosis date
    final diagnosisStr = prefs.getString(_diagnosisDateKey);
    if (diagnosisStr != null) {
      _diagnosisDate = DateTime.parse(diagnosisStr);
    }

    // Load cancer-free start date
    final cancerFreeStr = prefs.getString(_cancerFreeStartKey);
    if (cancerFreeStr != null) {
      _cancerFreeStartDate = DateTime.parse(cancerFreeStr);
    }

    // Load entries
    final entriesJson = prefs.getString(_entriesKey);
    if (entriesJson != null) {
      final List<dynamic> entriesList = jsonDecode(entriesJson);
      _entries = entriesList
          .map((e) => JourneyEntry.fromJson(e as Map<String, dynamic>))
          .toList();
      _entries.sort((a, b) => b.date.compareTo(a.date));
    }

    // Load treatments
    final treatmentsJson = prefs.getString(_treatmentsKey);
    if (treatmentsJson != null) {
      final List<dynamic> treatmentsList = jsonDecode(treatmentsJson);
      _treatments = treatmentsList
          .map((t) => Treatment.fromJson(t as Map<String, dynamic>))
          .toList();
    }

    // Load milestones
    final milestonesJson = prefs.getString(_milestonesKey);
    if (milestonesJson != null) {
      final List<dynamic> milestonesList = jsonDecode(milestonesJson);
      _milestones = milestonesList
          .map((m) => Milestone.fromJson(m as Map<String, dynamic>))
          .toList();
      _milestones.sort((a, b) => b.dateAchieved.compareTo(a.dateAchieved));
    }

    notifyListeners();
  }

  /// Save entries to storage
  Future<void> _saveEntries() async {
    final prefs = await SharedPreferences.getInstance();
    final entriesJson = jsonEncode(_entries.map((e) => e.toJson()).toList());
    await prefs.setString(_entriesKey, entriesJson);
  }

  /// Save treatments to storage
  Future<void> _saveTreatments() async {
    final prefs = await SharedPreferences.getInstance();
    final treatmentsJson = jsonEncode(_treatments.map((t) => t.toJson()).toList());
    await prefs.setString(_treatmentsKey, treatmentsJson);
  }

  /// Save milestones to storage
  Future<void> _saveMilestones() async {
    final prefs = await SharedPreferences.getInstance();
    final milestonesJson = jsonEncode(_milestones.map((m) => m.toJson()).toList());
    await prefs.setString(_milestonesKey, milestonesJson);
  }

  // =====================
  // Journey Setup
  // =====================

  /// Start the journey with initial setup
  Future<void> startJourney({
    required DateTime diagnosisDate,
    DateTime? cancerFreeDate,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    
    _diagnosisDate = diagnosisDate;
    _cancerFreeStartDate = cancerFreeDate;
    _journeyStarted = true;

    await prefs.setString(_diagnosisDateKey, diagnosisDate.toIso8601String());
    if (cancerFreeDate != null) {
      await prefs.setString(_cancerFreeStartKey, cancerFreeDate.toIso8601String());
    }
    await prefs.setBool(_journeyStartedKey, true);

    // Sync with Supabase to persist across devices/logins
    try {
      final supabaseService = SupabaseService();
      await supabaseService.saveJourneySetupStatus(
        journeyStarted: true,
        diagnosisDate: diagnosisDate,
        cancerFreeDate: cancerFreeDate,
      );
    } catch (e) {
      print('⚠️ Failed to sync journey setup with Supabase: $e');
    }

    // Add initial milestone
    await addMilestone(Milestone(
      id: '${DateTime.now().millisecondsSinceEpoch}_journey_start',
      title: 'Journey Started 🌟',
      description: 'You started tracking your cancer journey. Stay strong!',
      type: MilestoneType.personal,
      dateAchieved: DateTime.now(),
    ));

    notifyListeners();
  }
  
  /// Sync journey setup status from Supabase (call after login)
  /// This ensures the user's journey status is restored from the server
  Future<void> syncFromSupabase() async {
    try {
      final supabaseService = SupabaseService();
      
      // Check if user has completed journey setup in Supabase
      if (supabaseService.hasCompletedJourneySetup) {
        final prefs = await SharedPreferences.getInstance();
        
        // Always sync from Supabase if server has journey data
        // This ensures data is restored after logout/login or app reinstall
        print('📥 Syncing journey setup from Supabase...');
        
        _journeyStarted = true;
        await prefs.setBool(_journeyStartedKey, true);
        
        // Sync diagnosis date if available
        final diagnosisDate = supabaseService.diagnosisDateFromMetadata;
        if (diagnosisDate != null) {
          _diagnosisDate = diagnosisDate;
          await prefs.setString(_diagnosisDateKey, diagnosisDate.toIso8601String());
        }
        
        // Sync cancer-free date if available
        final cancerFreeDate = supabaseService.cancerFreeDateFromMetadata;
        if (cancerFreeDate != null) {
          _cancerFreeStartDate = cancerFreeDate;
          await prefs.setString(_cancerFreeStartKey, cancerFreeDate.toIso8601String());
        }
        
        print('✅ Journey setup synced from Supabase');
        notifyListeners();
      }
    } catch (e) {
      print('⚠️ Failed to sync journey setup from Supabase: $e');
    }
  }

  /// Update cancer-free start date
  Future<void> setCancerFreeDate(DateTime date) async {
    final prefs = await SharedPreferences.getInstance();
    _cancerFreeStartDate = date;
    await prefs.setString(_cancerFreeStartKey, date.toIso8601String());
    notifyListeners();
  }

  /// Get days cancer-free
  int get daysCancerFree {
    if (_cancerFreeStartDate == null) return 0;
    return DateTime.now().difference(_cancerFreeStartDate!).inDays;
  }

  /// Get days since diagnosis
  int get daysSinceDiagnosis {
    if (_diagnosisDate == null) return 0;
    return DateTime.now().difference(_diagnosisDate!).inDays;
  }

  // =====================
  // Journal Entries
  // =====================

  /// Add a new journal entry
  Future<void> addEntry(JourneyEntry entry) async {
    _entries.insert(0, entry);
    _entries.sort((a, b) => b.date.compareTo(a.date));
    await _saveEntries();
    await _checkForStreakMilestones();
    notifyListeners();
  }

  /// Update an existing entry
  Future<void> updateEntry(JourneyEntry entry) async {
    final index = _entries.indexWhere((e) => e.id == entry.id);
    if (index >= 0) {
      _entries[index] = entry;
      await _saveEntries();
      notifyListeners();
    }
  }

  /// Delete an entry
  Future<void> deleteEntry(String entryId) async {
    _entries.removeWhere((e) => e.id == entryId);
    await _saveEntries();
    notifyListeners();
  }

  /// Get entry for a specific date
  JourneyEntry? getEntryForDate(DateTime date) {
    try {
      return _entries.firstWhere(
        (e) => e.date.year == date.year && 
               e.date.month == date.month && 
               e.date.day == date.day,
      );
    } catch (e) {
      return null;
    }
  }

  /// Get entries for date range
  List<JourneyEntry> getEntriesForRange(DateTime start, DateTime end) {
    return _entries.where((e) => 
      e.date.isAfter(start.subtract(const Duration(days: 1))) && 
      e.date.isBefore(end.add(const Duration(days: 1)))
    ).toList();
  }

  /// Get current streak (consecutive days with entries)
  int get currentStreak {
    if (_entries.isEmpty) return 0;
    
    int streak = 0;
    DateTime checkDate = DateTime.now();
    
    for (int i = 0; i < 365; i++) {
      final entry = getEntryForDate(checkDate);
      if (entry != null) {
        streak++;
        checkDate = checkDate.subtract(const Duration(days: 1));
      } else if (i == 0) {
        // Today doesn't have entry yet, check yesterday
        checkDate = checkDate.subtract(const Duration(days: 1));
      } else {
        break;
      }
    }
    
    return streak;
  }

  /// Get average mood for last N days
  double getAverageMood(int days) {
    final recentEntries = _entries.where((e) => 
      e.date.isAfter(DateTime.now().subtract(Duration(days: days)))
    ).toList();
    
    if (recentEntries.isEmpty) return 0;
    
    final total = recentEntries.fold<int>(0, (sum, e) => sum + e.moodLevel);
    return total / recentEntries.length;
  }

  /// Get average pain for last N days
  double getAveragePain(int days) {
    final recentEntries = _entries.where((e) => 
      e.date.isAfter(DateTime.now().subtract(Duration(days: days)))
    ).toList();
    
    if (recentEntries.isEmpty) return 0;
    
    final total = recentEntries.fold<int>(0, (sum, e) => sum + e.painLevel);
    return total / recentEntries.length;
  }

  // =====================
  // Treatments
  // =====================

  /// Add a new treatment
  Future<void> addTreatment(Treatment treatment) async {
    _treatments.add(treatment);
    await _saveTreatments();
    notifyListeners();
  }

  /// Update a treatment
  Future<void> updateTreatment(Treatment treatment) async {
    final index = _treatments.indexWhere((t) => t.id == treatment.id);
    if (index >= 0) {
      _treatments[index] = treatment;
      await _saveTreatments();
      await _checkForTreatmentMilestones(treatment);
      notifyListeners();
    }
  }

  /// Delete a treatment
  Future<void> deleteTreatment(String treatmentId) async {
    _treatments.removeWhere((t) => t.id == treatmentId);
    await _saveTreatments();
    notifyListeners();
  }

  /// Increment completed sessions for a treatment
  Future<void> incrementSession(String treatmentId) async {
    final index = _treatments.indexWhere((t) => t.id == treatmentId);
    if (index >= 0) {
      final treatment = _treatments[index];
      if (treatment.completedSessions < treatment.totalSessions) {
        _treatments[index] = treatment.copyWith(
          completedSessions: treatment.completedSessions + 1,
        );
        await _saveTreatments();
        await _checkForTreatmentMilestones(_treatments[index]);
        notifyListeners();
      }
    }
  }

  /// Get active treatments
  List<Treatment> get activeTreatments {
    return _treatments.where((t) => t.isActive).toList();
  }

  // =====================
  // Milestones
  // =====================

  /// Add a milestone
  Future<void> addMilestone(Milestone milestone) async {
    // Check if similar milestone already exists
    final exists = _milestones.any((m) => 
      m.title == milestone.title && 
      m.dateAchieved.year == milestone.dateAchieved.year &&
      m.dateAchieved.month == milestone.dateAchieved.month &&
      m.dateAchieved.day == milestone.dateAchieved.day
    );
    
    if (!exists) {
      _milestones.insert(0, milestone);
      _milestones.sort((a, b) => b.dateAchieved.compareTo(a.dateAchieved));
      await _saveMilestones();
      notifyListeners();
    }
  }

  /// Mark milestone as celebrated
  Future<void> celebrateMilestone(String milestoneId) async {
    final index = _milestones.indexWhere((m) => m.id == milestoneId);
    if (index >= 0) {
      _milestones[index] = _milestones[index].copyWith(isCelebrated: true);
      await _saveMilestones();
      notifyListeners();
    }
  }

  /// Delete a milestone
  Future<void> deleteMilestone(String milestoneId) async {
    _milestones.removeWhere((m) => m.id == milestoneId);
    await _saveMilestones();
    notifyListeners();
  }

  /// Check and create streak milestones
  Future<void> _checkForStreakMilestones() async {
    final streak = currentStreak;
    final streakMilestones = [7, 14, 30, 60, 90, 180, 365];
    
    for (final days in streakMilestones) {
      if (streak == days) {
        await addMilestone(Milestone(
          id: '${DateTime.now().millisecondsSinceEpoch}_streak_$days',
          title: '$days Day Logging Streak! 🔥',
          description: 'You\'ve logged your journey for $days consecutive days!',
          type: MilestoneType.personal,
          dateAchieved: DateTime.now(),
          daysCount: days,
        ));
        break;
      }
    }
  }

  /// Check and create treatment milestones
  Future<void> _checkForTreatmentMilestones(Treatment treatment) async {
    if (treatment.totalSessions == 0) return;
    
    final percentage = treatment.progressPercentage;
    
    for (final template in MilestoneTemplates.treatmentTemplates) {
      if (percentage >= template['percent'] && percentage < (template['percent'] as int) + 1) {
        await addMilestone(Milestone(
          id: '${DateTime.now().millisecondsSinceEpoch}_treatment_${treatment.id}_${template['percent']}',
          title: template['title'] as String,
          description: '${treatment.name}: ${template['description']}',
          type: MilestoneType.sessionComplete,
          dateAchieved: DateTime.now(),
        ));
        break;
      }
    }
  }

  /// Check and create cancer-free milestones
  Future<void> checkCancerFreeMilestones() async {
    if (_cancerFreeStartDate == null) return;
    
    final days = daysCancerFree;
    
    for (final template in MilestoneTemplates.daysFreeTemplates) {
      if (days >= template['days']) {
        final existingMilestone = _milestones.any((m) => 
          m.type == MilestoneType.daysFree && 
          m.daysCount == template['days']
        );
        
        if (!existingMilestone) {
          await addMilestone(Milestone(
            id: '${DateTime.now().millisecondsSinceEpoch}_free_${template['days']}',
            title: template['title'] as String,
            description: template['description'] as String,
            type: MilestoneType.daysFree,
            dateAchieved: DateTime.now(),
            daysCount: template['days'] as int,
          ));
        }
      }
    }
  }

  /// Get uncelebrated milestones
  List<Milestone> get uncelebratedMilestones {
    return _milestones.where((m) => !m.isCelebrated).toList();
  }

  // =====================
  // Statistics
  // =====================

  /// Get mood trend data for charts (last N days)
  List<Map<String, dynamic>> getMoodTrend(int days) {
    final result = <Map<String, dynamic>>[];
    final now = DateTime.now();
    
    for (int i = days - 1; i >= 0; i--) {
      final date = now.subtract(Duration(days: i));
      final entry = getEntryForDate(date);
      result.add({
        'date': date,
        'mood': entry?.moodLevel ?? 0,
        'pain': entry?.painLevel ?? 0,
        'energy': entry?.energyLevel ?? 0,
      });
    }
    
    return result;
  }

  /// Get most common symptoms
  Map<String, int> getMostCommonSymptoms() {
    final symptomCounts = <String, int>{};
    
    for (final entry in _entries) {
      for (final symptom in entry.symptoms) {
        symptomCounts[symptom] = (symptomCounts[symptom] ?? 0) + 1;
      }
    }
    
    // Sort by count
    final sorted = symptomCounts.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    
    return Map.fromEntries(sorted.take(10));
  }

  /// Reset all journey data
  Future<void> resetJourney() async {
    final prefs = await SharedPreferences.getInstance();
    
    await prefs.remove(_entriesKey);
    await prefs.remove(_treatmentsKey);
    await prefs.remove(_milestonesKey);
    await prefs.remove(_diagnosisDateKey);
    await prefs.remove(_cancerFreeStartKey);
    await prefs.remove(_journeyStartedKey);
    
    _entries.clear();
    _treatments.clear();
    _milestones.clear();
    _diagnosisDate = null;
    _cancerFreeStartDate = null;
    _journeyStarted = false;
    
    notifyListeners();
  }
}
