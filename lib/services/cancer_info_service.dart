import 'package:cancerapp/services/supabase_service.dart';
import 'package:cancerapp/models/cancer_type.dart';

class CancerInfoService {
  final supabase = SupabaseService();

  /// Fetches all cancer types from Supabase
  Future<List<CancerType>> fetchAllCancerTypes() async {
    try {
      final response = await supabase.client
          .from('cancer_types')
          .select()
          .order('name', ascending: true);

      return (response as List)
          .map((json) => CancerType.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch cancer types: $e');
    }
  }

  /// Fetches a specific cancer type by ID
  Future<CancerType?> fetchCancerTypeById(String id) async {
    try {
      final response = await supabase.client
          .from('cancer_types')
          .select()
          .eq('id', id)
          .single();

      return CancerType.fromJson(response);
    } catch (e) {
      throw Exception('Failed to fetch cancer type: $e');
    }
  }

  /// Searches cancer types by name
  Future<List<CancerType>> searchCancerTypes(String query) async {
    try {
      if (query.isEmpty) {
        return fetchAllCancerTypes();
      }

      final response = await supabase.client
          .from('cancer_types')
          .select()
          .ilike('name', '%$query%')
          .order('name', ascending: true);

      return (response as List)
          .map((json) => CancerType.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to search cancer types: $e');
    }
  }
}
