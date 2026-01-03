import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/journey_service.dart';
import 'package:cancerapp/models/journey_entry.dart';
import 'package:cancerapp/models/treatment.dart';
import 'package:cancerapp/models/milestone.dart';

/// Journey entries provider - auto-loads on user login
final journeyEntriesProvider = StateNotifierProvider<JourneyEntriesNotifier, AsyncValue<List<JourneyEntry>>>((ref) {
  return JourneyEntriesNotifier();
});

class JourneyEntriesNotifier extends StateNotifier<AsyncValue<List<JourneyEntry>>> {
  JourneyEntriesNotifier() : super(const AsyncValue.loading()) {
    _loadEntries();
  }

  final _journeyService = getIt<JourneyService>();

  Future<void> _loadEntries() async {
    state = const AsyncValue.loading();
    try {
      await _journeyService.initialize();
      state = AsyncValue.data(_journeyService.entries);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> refresh() async {
    await _loadEntries();
  }

  Future<void> addEntry(JourneyEntry entry) async {
    await _journeyService.addEntry(entry);
    state = AsyncValue.data(_journeyService.entries);
  }

  Future<void> updateEntry(JourneyEntry entry) async {
    await _journeyService.updateEntry(entry);
    state = AsyncValue.data(_journeyService.entries);
  }

  Future<void> deleteEntry(String id) async {
    await _journeyService.deleteEntry(id);
    state = AsyncValue.data(_journeyService.entries);
  }
}

/// Journey treatments provider
final journeyTreatmentsProvider = StateNotifierProvider<JourneyTreatmentsNotifier, AsyncValue<List<Treatment>>>((ref) {
  return JourneyTreatmentsNotifier();
});

class JourneyTreatmentsNotifier extends StateNotifier<AsyncValue<List<Treatment>>> {
  JourneyTreatmentsNotifier() : super(const AsyncValue.loading()) {
    _loadTreatments();
  }

  final _journeyService = getIt<JourneyService>();

  Future<void> _loadTreatments() async {
    state = const AsyncValue.loading();
    try {
      await _journeyService.initialize();
      state = AsyncValue.data(_journeyService.treatments);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> refresh() async {
    await _loadTreatments();
  }

  Future<void> addTreatment(Treatment treatment) async {
    await _journeyService.addTreatment(treatment);
    state = AsyncValue.data(_journeyService.treatments);
  }

  Future<void> updateTreatment(Treatment treatment) async {
    await _journeyService.updateTreatment(treatment);
    state = AsyncValue.data(_journeyService.treatments);
  }

  Future<void> deleteTreatment(String id) async {
    await _journeyService.deleteTreatment(id);
    state = AsyncValue.data(_journeyService.treatments);
  }
}

/// Journey milestones provider
final journeyMilestonesProvider = StateNotifierProvider<JourneyMilestonesNotifier, AsyncValue<List<Milestone>>>((ref) {
  return JourneyMilestonesNotifier();
});

class JourneyMilestonesNotifier extends StateNotifier<AsyncValue<List<Milestone>>> {
  JourneyMilestonesNotifier() : super(const AsyncValue.loading()) {
    _loadMilestones();
  }

  final _journeyService = getIt<JourneyService>();

  Future<void> _loadMilestones() async {
    state = const AsyncValue.loading();
    try {
      await _journeyService.initialize();
      state = AsyncValue.data(_journeyService.milestones);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> refresh() async {
    await _loadMilestones();
  }

  Future<void> addMilestone(Milestone milestone) async {
    await _journeyService.addMilestone(milestone);
    state = AsyncValue.data(_journeyService.milestones);
  }

  Future<void> celebrateMilestone(String id) async {
    await _journeyService.celebrateMilestone(id);
    state = AsyncValue.data(_journeyService.milestones);
  }

  Future<void> deleteMilestone(String id) async {
    await _journeyService.deleteMilestone(id);
    state = AsyncValue.data(_journeyService.milestones);
  }
}

/// Journey started provider
final journeyStartedProvider = FutureProvider<bool>((ref) async {
  final journeyService = getIt<JourneyService>();
  await journeyService.initialize();
  return journeyService.journeyStarted;
});

/// Journey setup data provider (syncs from Supabase first)
final journeySetupProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final journeyService = getIt<JourneyService>();
  await journeyService.syncFromSupabase();
  // Return a map with relevant journey setup data
  return {
    'journeyStarted': journeyService.journeyStarted,
    'diagnosisDate': journeyService.diagnosisDate?.toIso8601String(),
    'cancerFreeStartDate': journeyService.cancerFreeStartDate?.toIso8601String(),
  };
});
