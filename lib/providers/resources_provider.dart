import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/resources_service.dart';
import 'package:cancerapp/models/resource.dart';

// =============================================================================
// RESOURCES PROVIDERS - Hotlines, screening centers, support groups, etc.
// =============================================================================

/// Base provider for ResourcesService access
final resourcesServiceProvider = Provider<ResourcesService>((ref) {
  return getIt<ResourcesService>();
});

/// Hotlines provider
/// Usage: ref.watch(hotlinesProvider)
final hotlinesProvider = FutureProvider<List<Resource>>((ref) async {
  final resourcesService = ref.watch(resourcesServiceProvider);
  return await resourcesService.fetchHotlines();
});

/// Screening centers provider
/// Usage: ref.watch(screeningCentersProvider)
final screeningCentersProvider = FutureProvider<List<Resource>>((ref) async {
  final resourcesService = ref.watch(resourcesServiceProvider);
  return await resourcesService.fetchScreeningCenters();
});

/// Financial support provider
/// Usage: ref.watch(financialSupportProvider)
final financialSupportProvider = FutureProvider<List<Resource>>((ref) async {
  final resourcesService = ref.watch(resourcesServiceProvider);
  return await resourcesService.fetchFinancialSupport();
});

/// Support groups provider
/// Usage: ref.watch(supportGroupsProvider)
final supportGroupsProvider = FutureProvider<List<Resource>>((ref) async {
  final resourcesService = ref.watch(resourcesServiceProvider);
  return await resourcesService.fetchSupportGroups();
});

/// All resources combined provider
/// Usage: ref.watch(allResourcesProvider)
/// Returns all resource types in a single async operation for efficiency
final allResourcesProvider = FutureProvider<AllResources>((ref) async {
  final resourcesService = ref.watch(resourcesServiceProvider);
  
  final results = await Future.wait([
    resourcesService.fetchHotlines(),
    resourcesService.fetchScreeningCenters(),
    resourcesService.fetchFinancialSupport(),
    resourcesService.fetchSupportGroups(),
  ]);
  
  return AllResources(
    hotlines: results[0],
    screeningCenters: results[1],
    financialSupport: results[2],
    supportGroups: results[3],
  );
});

/// Data class to hold all resource types
class AllResources {
  final List<Resource> hotlines;
  final List<Resource> screeningCenters;
  final List<Resource> financialSupport;
  final List<Resource> supportGroups;

  AllResources({
    required this.hotlines,
    required this.screeningCenters,
    required this.financialSupport,
    required this.supportGroups,
  });
  
  /// Get total resource count
  int get totalCount => 
      hotlines.length + 
      screeningCenters.length + 
      financialSupport.length + 
      supportGroups.length;
}
