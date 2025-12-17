import 'package:cancerapp/models/prevention_tip.dart';
import 'package:cancerapp/models/self_check_guide.dart';
import 'package:cancerapp/services/supabase_service.dart';

/// Service for managing prevention tips and self-check guides from Supabase
/// All content is sourced from reliable medical organizations (WHO, CDC, NCI, etc.)
class PreventionService {
  final _supabase = SupabaseService().client;

  /// Fetch all active prevention tips from Supabase
  /// Returns tips ordered by display_order
  Future<List<PreventionTip>> getPreventionTips({String? category}) async {
    try {
      print('📊 Fetching prevention tips from Supabase...');
      
      dynamic query = _supabase
          .from('prevention_tips')
          .select()
          .eq('is_active', true);

      // Filter by category if provided
      if (category != null && category.isNotEmpty) {
        query = query.eq('category', category);
      }

      // Apply ordering last
      final response = await query.order('display_order', ascending: true);
      
      final tips = (response as List)
          .map((json) => PreventionTip.fromJson(json))
          .toList();

      print('✅ Fetched ${tips.length} prevention tips');
      return tips;
    } catch (e) {
      print('❌ Error fetching prevention tips: $e');
      rethrow;
    }
  }

  /// Fetch prevention tips by category
  Future<List<PreventionTip>> getPreventionTipsByCategory(
      String category) async {
    return getPreventionTips(category: category);
  }

  /// Fetch all available categories for prevention tips
  Future<List<String>> getPreventionCategories() async {
    try {
      print('📊 Fetching prevention categories...');
      
      final response = await _supabase
          .from('prevention_tips')
          .select('category')
          .eq('is_active', true);

      // Extract unique categories
      final categories = <String>{};
      for (var item in response as List) {
        categories.add(item['category'] as String);
      }

      final sortedCategories = categories.toList()..sort();
      print('✅ Found ${sortedCategories.length} categories');
      return sortedCategories;
    } catch (e) {
      print('❌ Error fetching categories: $e');
      rethrow;
    }
  }

  /// Fetch all active self-check guides from Supabase
  /// Returns guides ordered by display_order
  Future<List<SelfCheckGuide>> getSelfCheckGuides({String? cancerType}) async {
    try {
      print('📊 Fetching self-check guides from Supabase...');
      
      dynamic query = _supabase
          .from('self_check_guides')
          .select()
          .eq('is_active', true);

      // Filter by cancer type if provided
      if (cancerType != null && cancerType.isNotEmpty) {
        query = query.eq('cancer_type', cancerType);
      }

      // Apply ordering last
      final response = await query.order('display_order', ascending: true);
      
      final guides = (response as List)
          .map((json) => SelfCheckGuide.fromJson(json))
          .toList();

      print('✅ Fetched ${guides.length} self-check guides');
      return guides;
    } catch (e) {
      print('❌ Error fetching self-check guides: $e');
      rethrow;
    }
  }

  /// Fetch a specific self-check guide by ID
  Future<SelfCheckGuide?> getSelfCheckGuideById(String id) async {
    try {
      print('📊 Fetching self-check guide by ID: $id');
      
      final response = await _supabase
          .from('self_check_guides')
          .select()
          .eq('id', id)
          .eq('is_active', true)
          .single();

      print('✅ Fetched self-check guide');
      return SelfCheckGuide.fromJson(response);
    } catch (e) {
      print('❌ Error fetching self-check guide: $e');
      return null;
    }
  }

  /// Fetch all available cancer types for self-check guides
  Future<List<String>> getSelfCheckCancerTypes() async {
    try {
      print('📊 Fetching cancer types for self-checks...');
      
      final response = await _supabase
          .from('self_check_guides')
          .select('cancer_type')
          .eq('is_active', true);

      // Extract unique cancer types
      final cancerTypes = <String>{};
      for (var item in response as List) {
        cancerTypes.add(item['cancer_type'] as String);
      }

      final sortedTypes = cancerTypes.toList()..sort();
      print('✅ Found ${sortedTypes.length} cancer types');
      return sortedTypes;
    } catch (e) {
      print('❌ Error fetching cancer types: $e');
      rethrow;
    }
  }

  /// Search prevention tips by keyword
  Future<List<PreventionTip>> searchPreventionTips(String keyword) async {
    try {
      print('🔍 Searching prevention tips for: $keyword');
      
      final response = await _supabase
          .from('prevention_tips')
          .select()
          .eq('is_active', true)
          .or('title.ilike.%$keyword%,description.ilike.%$keyword%,detailed_info.ilike.%$keyword%')
          .order('display_order', ascending: true);

      final tips = (response as List)
          .map((json) => PreventionTip.fromJson(json))
          .toList();

      print('✅ Found ${tips.length} matching tips');
      return tips;
    } catch (e) {
      print('❌ Error searching prevention tips: $e');
      rethrow;
    }
  }

  /// Search self-check guides by keyword
  Future<List<SelfCheckGuide>> searchSelfCheckGuides(String keyword) async {
    try {
      print('🔍 Searching self-check guides for: $keyword');
      
      final response = await _supabase
          .from('self_check_guides')
          .select()
          .eq('is_active', true)
          .or('title.ilike.%$keyword%,description.ilike.%$keyword%,cancer_type.ilike.%$keyword%')
          .order('display_order', ascending: true);

      final guides = (response as List)
          .map((json) => SelfCheckGuide.fromJson(json))
          .toList();

      print('✅ Found ${guides.length} matching guides');
      return guides;
    } catch (e) {
      print('❌ Error searching self-check guides: $e');
      rethrow;
    }
  }

  /// Get prevention statistics (for dashboard or reports)
  Future<Map<String, int>> getPreventionStats() async {
    try {
      print('📊 Fetching prevention statistics...');
      
      final tipsResponse = await _supabase
          .from('prevention_tips')
          .select('id')
          .eq('is_active', true);

      final guidesResponse = await _supabase
          .from('self_check_guides')
          .select('id')
          .eq('is_active', true);

      final stats = {
        'total_tips': (tipsResponse as List).length,
        'total_guides': (guidesResponse as List).length,
      };

      print('✅ Fetched statistics: $stats');
      return stats;
    } catch (e) {
      print('❌ Error fetching statistics: $e');
      return {'total_tips': 0, 'total_guides': 0};
    }
  }
}
