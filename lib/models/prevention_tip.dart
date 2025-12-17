/// Model representing a prevention tip with source information
class PreventionTip {
  final String id;
  final String iconName;
  final String title;
  final String description;
  final String category;
  final String? detailedInfo;
  final String sourceName;
  final String sourceUrl;
  final DateTime? dateVerified;
  final int displayOrder;
  final bool isActive;

  PreventionTip({
    required this.id,
    required this.iconName,
    required this.title,
    required this.description,
    required this.category,
    this.detailedInfo,
    required this.sourceName,
    required this.sourceUrl,
    this.dateVerified,
    this.displayOrder = 0,
    this.isActive = true,
  });

  /// Create PreventionTip from Supabase JSON
  factory PreventionTip.fromJson(Map<String, dynamic> json) {
    return PreventionTip(
      id: json['id'] as String,
      iconName: json['icon_name'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      category: json['category'] as String,
      detailedInfo: json['detailed_info'] as String?,
      sourceName: json['source_name'] as String,
      sourceUrl: json['source_url'] as String,
      dateVerified: json['date_verified'] != null
          ? DateTime.parse(json['date_verified'] as String)
          : null,
      displayOrder: json['display_order'] as int? ?? 0,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  /// Convert PreventionTip to JSON for Supabase
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'icon_name': iconName,
      'title': title,
      'description': description,
      'category': category,
      'detailed_info': detailedInfo,
      'source_name': sourceName,
      'source_url': sourceUrl,
      'date_verified': dateVerified?.toIso8601String(),
      'display_order': displayOrder,
      'is_active': isActive,
    };
  }

  @override
  String toString() {
    return 'PreventionTip(id: $id, title: $title, category: $category, source: $sourceName)';
  }
}
