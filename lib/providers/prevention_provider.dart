import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/prevention_service.dart';
import 'package:cancerapp/models/prevention_tip.dart';
import 'package:cancerapp/models/self_check_guide.dart';

// =============================================================================
// PREVENTION PROVIDERS - Prevention tips and self-check guides
// =============================================================================

/// Base provider for PreventionService access
final preventionServiceProvider = Provider<PreventionService>((ref) {
  return getIt<PreventionService>();
});

/// Prevention tips provider
/// Usage: ref.watch(preventionTipsProvider)
/// Returns: AsyncValue<List<PreventionTip>>
final preventionTipsProvider = FutureProvider<List<PreventionTip>>((ref) async {
  final preventionService = ref.watch(preventionServiceProvider);
  return await preventionService.getPreventionTips();
});

/// Self-check guides provider
/// Usage: ref.watch(selfCheckGuidesProvider)
/// Returns: AsyncValue<List<SelfCheckGuide>>
final selfCheckGuidesProvider = FutureProvider<List<SelfCheckGuide>>((ref) async {
  final preventionService = ref.watch(preventionServiceProvider);
  return await preventionService.getSelfCheckGuides();
});

/// Combined prevention data provider for convenience
/// Usage: ref.watch(preventionDataProvider)
/// Returns both tips and guides in a single async operation
final preventionDataProvider = FutureProvider<PreventionData>((ref) async {
  final preventionService = ref.watch(preventionServiceProvider);
  
  final results = await Future.wait([
    preventionService.getPreventionTips(),
    preventionService.getSelfCheckGuides(),
  ]);
  
  return PreventionData(
    tips: results[0] as List<PreventionTip>,
    guides: results[1] as List<SelfCheckGuide>,
  );
});

/// Data class to hold both prevention tips and self-check guides
class PreventionData {
  final List<PreventionTip> tips;
  final List<SelfCheckGuide> guides;

  PreventionData({required this.tips, required this.guides});
}
