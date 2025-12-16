import 'package:cancerapp/models/resource.dart';
import 'package:cancerapp/services/supabase_service.dart';

/// Service for managing resources (hotlines, screening centers, support groups, etc.)
class ResourcesService {
  final supabase = SupabaseService();

  /// Fetch all verified and active resources
  Future<List<Resource>> fetchAllResources() async {
    try {
      final response = await supabase.client
          .from('resources')
          .select()
          .eq('is_verified', true)
          .eq('is_active', true)
          .order('name', ascending: true);

      return (response as List)
          .map((json) => Resource.fromJson(json))
          .toList();
    } catch (e) {
      print('Error fetching resources: $e');
      // Return fallback data if database isn't set up yet
      return _getFallbackResources();
    }
  }

  /// Fetch resources by type (e.g., 'hotline', 'screening_center', etc.)
  Future<List<Resource>> fetchResourcesByType(String type) async {
    try {
      final response = await supabase.client
          .from('resources')
          .select()
          .eq('type', type)
          .eq('is_verified', true)
          .eq('is_active', true)
          .order('name', ascending: true);

      return (response as List)
          .map((json) => Resource.fromJson(json))
          .toList();
    } catch (e) {
      print('Error fetching resources by type: $e');
      // Return fallback data for this type
      return _getFallbackResources().where((r) => r.type == type).toList();
    }
  }

  /// Fetch hotlines only
  Future<List<Resource>> fetchHotlines() async {
    return fetchResourcesByType('hotline');
  }

  /// Fetch screening centers only
  Future<List<Resource>> fetchScreeningCenters() async {
    return fetchResourcesByType('screening_center');
  }

  /// Fetch financial support resources only
  Future<List<Resource>> fetchFinancialSupport() async {
    return fetchResourcesByType('financial_support');
  }

  /// Fetch support groups only
  Future<List<Resource>> fetchSupportGroups() async {
    return fetchResourcesByType('support_group');
  }

  /// Search resources by name or description
  Future<List<Resource>> searchResources(String query) async {
    try {
      final response = await supabase.client
          .from('resources')
          .select()
          .or('name.ilike.%$query%,description.ilike.%$query%')
          .eq('is_verified', true)
          .eq('is_active', true)
          .order('name', ascending: true);

      return (response as List)
          .map((json) => Resource.fromJson(json))
          .toList();
    } catch (e) {
      print('Error searching resources: $e');
      // Return filtered fallback data
      final allResources = _getFallbackResources();
      final lowerQuery = query.toLowerCase();
      return allResources.where((r) =>
        r.name.toLowerCase().contains(lowerQuery) ||
        r.description.toLowerCase().contains(lowerQuery)
      ).toList();
    }
  }

  /// Fallback sample data when database is not set up
  List<Resource> _getFallbackResources() {
    final now = DateTime.now();
    return [
      // Hotlines
      Resource(
        id: '1',
        name: 'Department of Health',
        type: 'hotline',
        description: 'National health hotline for health concerns and emergencies',
        phone: '1555',
        location: 'Philippines',
        isVerified: true,
        createdAt: now,
      ),
      Resource(
        id: '2',
        name: 'Philippine Cancer Society',
        type: 'hotline',
        description: 'Cancer support, information, and counseling hotline',
        phone: '(02) 8508-7777',
        location: 'Metro Manila',
        isVerified: true,
        createdAt: now,
      ),
      Resource(
        id: '3',
        name: 'Philippine Red Cross',
        type: 'hotline',
        description: 'Emergency medical services and blood donation',
        phone: '143',
        location: 'Philippines',
        isVerified: true,
        createdAt: now,
      ),
      
      // Screening Centers
      Resource(
        id: '4',
        name: 'Philippine General Hospital',
        type: 'screening_center',
        description: 'Cancer screening and treatment facility',
        phone: '(02) 8554-8400',
        location: 'Manila',
        isVerified: true,
        createdAt: now,
      ),
      Resource(
        id: '5',
        name: 'Philippine Heart Center',
        type: 'screening_center',
        description: 'Comprehensive health screening including cancer detection',
        phone: '(02) 8925-2401',
        location: 'Quezon City',
        isVerified: true,
        createdAt: now,
      ),
      
      // Financial Support
      Resource(
        id: '6',
        name: 'PhilHealth',
        type: 'financial_support',
        description: 'Government health insurance coverage for cancer treatment',
        phone: '(02) 8441-7442',
        location: 'Philippines',
        isVerified: true,
        createdAt: now,
      ),
      Resource(
        id: '7',
        name: 'PCSO Medical Assistance',
        type: 'financial_support',
        description: 'Financial aid for medicines, chemotherapy, and hospital bills',
        phone: '(02) 8733-8384',
        location: 'Philippines',
        isVerified: true,
        createdAt: now,
      ),
      
      // Support Groups
      Resource(
        id: '8',
        name: 'Cancer Warriors Foundation',
        type: 'support_group',
        description: 'Peer support for cancer patients and survivors',
        phone: '(02) 8705-2110',
        location: 'Metro Manila',
        isVerified: true,
        createdAt: now,
      ),
      Resource(
        id: '9',
        name: 'ICanServe Foundation',
        type: 'support_group',
        description: 'Breast cancer support community and education',
        phone: '(02) 8820-6363',
        location: 'Online & Local',
        isVerified: true,
        createdAt: now,
      ),
    ];
  }
}
