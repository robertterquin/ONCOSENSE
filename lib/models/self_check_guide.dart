/// Model representing a self-check guide step
class SelfCheckStep {
  final int step;
  final String instruction;
  final String detail;

  SelfCheckStep({
    required this.step,
    required this.instruction,
    required this.detail,
  });

  factory SelfCheckStep.fromJson(Map<String, dynamic> json) {
    return SelfCheckStep(
      step: json['step'] as int,
      instruction: json['instruction'] as String,
      detail: json['detail'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'step': step,
      'instruction': instruction,
      'detail': detail,
    };
  }
}

/// Model representing a self-check guide with source information
class SelfCheckGuide {
  final String id;
  final String title;
  final String description;
  final String cancerType;
  final String frequency;
  final String? ageRecommendation;
  final List<SelfCheckStep> steps;
  final List<String>? warningSigns;
  final String whenToSeeDoctor;
  final String sourceName;
  final String sourceUrl;
  final DateTime? dateVerified;
  final int displayOrder;
  final bool isActive;

  SelfCheckGuide({
    required this.id,
    required this.title,
    required this.description,
    required this.cancerType,
    required this.frequency,
    this.ageRecommendation,
    required this.steps,
    this.warningSigns,
    required this.whenToSeeDoctor,
    required this.sourceName,
    required this.sourceUrl,
    this.dateVerified,
    this.displayOrder = 0,
    this.isActive = true,
  });

  /// Create SelfCheckGuide from Supabase JSON
  factory SelfCheckGuide.fromJson(Map<String, dynamic> json) {
    // Parse steps from JSONB array
    List<SelfCheckStep> stepsList = [];
    if (json['steps'] != null) {
      if (json['steps'] is String) {
        // Handle if steps is stored as JSON string
        final stepsData = json['steps'];
        stepsList = (stepsData as List)
            .map((step) => SelfCheckStep.fromJson(step as Map<String, dynamic>))
            .toList();
      } else if (json['steps'] is List) {
        stepsList = (json['steps'] as List)
            .map((step) => SelfCheckStep.fromJson(step as Map<String, dynamic>))
            .toList();
      }
    }

    // Parse warning signs from JSONB array
    List<String>? warningSignsList;
    if (json['warning_signs'] != null) {
      if (json['warning_signs'] is String) {
        warningSignsList = List<String>.from(json['warning_signs'] as List);
      } else if (json['warning_signs'] is List) {
        warningSignsList =
            (json['warning_signs'] as List).map((e) => e.toString()).toList();
      }
    }

    return SelfCheckGuide(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      cancerType: json['cancer_type'] as String,
      frequency: json['frequency'] as String,
      ageRecommendation: json['age_recommendation'] as String?,
      steps: stepsList,
      warningSigns: warningSignsList,
      whenToSeeDoctor: json['when_to_see_doctor'] as String,
      sourceName: json['source_name'] as String,
      sourceUrl: json['source_url'] as String,
      dateVerified: json['date_verified'] != null
          ? DateTime.parse(json['date_verified'] as String)
          : null,
      displayOrder: json['display_order'] as int? ?? 0,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  /// Convert SelfCheckGuide to JSON for Supabase
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'cancer_type': cancerType,
      'frequency': frequency,
      'age_recommendation': ageRecommendation,
      'steps': steps.map((step) => step.toJson()).toList(),
      'warning_signs': warningSigns,
      'when_to_see_doctor': whenToSeeDoctor,
      'source_name': sourceName,
      'source_url': sourceUrl,
      'date_verified': dateVerified?.toIso8601String(),
      'display_order': displayOrder,
      'is_active': isActive,
    };
  }

  @override
  String toString() {
    return 'SelfCheckGuide(id: $id, title: $title, cancerType: $cancerType, source: $sourceName)';
  }
}
