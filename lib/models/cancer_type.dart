class CancerType {
  final String id;
  final String name;
  final String description;
  final String iconName;
  final List<String> symptoms;
  final List<String> riskFactors;
  final List<String> preventionTips;
  final List<String> screeningMethods;
  final String earlyDetectionInfo;
  final String? statistics;

  CancerType({
    required this.id,
    required this.name,
    required this.description,
    required this.iconName,
    required this.symptoms,
    required this.riskFactors,
    required this.preventionTips,
    required this.screeningMethods,
    required this.earlyDetectionInfo,
    this.statistics,
  });

  factory CancerType.fromJson(Map<String, dynamic> json) {
    return CancerType(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      iconName: json['icon_name'] as String,
      symptoms: List<String>.from(json['symptoms'] as List),
      riskFactors: List<String>.from(json['risk_factors'] as List),
      preventionTips: List<String>.from(json['prevention_tips'] as List),
      screeningMethods: List<String>.from(json['screening_methods'] as List),
      earlyDetectionInfo: json['early_detection_info'] as String,
      statistics: json['statistics'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'icon_name': iconName,
      'symptoms': symptoms,
      'risk_factors': riskFactors,
      'prevention_tips': preventionTips,
      'screening_methods': screeningMethods,
      'early_detection_info': earlyDetectionInfo,
      'statistics': statistics,
    };
  }
}
