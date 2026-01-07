import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/cancer_info_service.dart';
import 'package:cancerapp/models/cancer_type.dart';

// =============================================================================
// CANCER INFO PROVIDERS - Cancer types and educational content
// =============================================================================

/// Base provider for CancerInfoService access
final cancerInfoServiceProvider = Provider<CancerInfoService>((ref) {
  return getIt<CancerInfoService>();
});

/// All cancer types provider
/// Usage: ref.watch(cancerTypesProvider)
/// Returns: AsyncValue<List<CancerType>>
final cancerTypesProvider = FutureProvider<List<CancerType>>((ref) async {
  final cancerInfoService = ref.watch(cancerInfoServiceProvider);
  return await cancerInfoService.fetchAllCancerTypes();
});

/// Single cancer type by ID
/// Usage: ref.watch(cancerTypeByIdProvider(cancerId))
/// Parameter: cancerId - the ID of the cancer type to fetch
final cancerTypeByIdProvider = FutureProvider.family<CancerType?, String>((ref, cancerId) async {
  final cancerInfoService = ref.watch(cancerInfoServiceProvider);
  return await cancerInfoService.fetchCancerTypeById(cancerId);
});

/// Filtered cancer types provider with search
/// This is a StateNotifier that manages filtered results
final filteredCancerTypesProvider = StateNotifierProvider<FilteredCancerTypesNotifier, AsyncValue<List<CancerType>>>((ref) {
  return FilteredCancerTypesNotifier(ref);
});

class FilteredCancerTypesNotifier extends StateNotifier<AsyncValue<List<CancerType>>> {
  final Ref ref;
  String _searchQuery = '';
  List<CancerType> _allTypes = [];

  FilteredCancerTypesNotifier(this.ref) : super(const AsyncValue.loading()) {
    _loadCancerTypes();
  }

  String get searchQuery => _searchQuery;

  Future<void> _loadCancerTypes() async {
    state = const AsyncValue.loading();
    try {
      final cancerInfoService = ref.read(cancerInfoServiceProvider);
      _allTypes = await cancerInfoService.fetchAllCancerTypes();
      state = AsyncValue.data(_allTypes);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  void search(String query) {
    _searchQuery = query;
    if (query.isEmpty) {
      state = AsyncValue.data(_allTypes);
    } else {
      final filtered = _allTypes
          .where((cancer) => cancer.name.toLowerCase().contains(query.toLowerCase()))
          .toList();
      state = AsyncValue.data(filtered);
    }
  }

  void clearSearch() {
    _searchQuery = '';
    state = AsyncValue.data(_allTypes);
  }

  Future<void> refresh() async {
    await _loadCancerTypes();
  }
}
