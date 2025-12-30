import 'dart:convert';

/// Treatment types available for tracking
enum TreatmentType {
  surgery,
  chemotherapy,
  radiation,
  immunotherapy,
  hormoneTherapy,
  targetedTherapy,
  stemCell,
  other,
}

/// Represents a treatment in the cancer journey
class Treatment {
  final String id;
  final String name;
  final TreatmentType type;
  final DateTime startDate;
  final DateTime? endDate;
  final String? doctorName;
  final String? hospitalName;
  final String? notes;
  final int totalSessions;
  final int completedSessions;
  final List<String> sideEffects;
  final bool isActive;

  Treatment({
    required this.id,
    required this.name,
    required this.type,
    required this.startDate,
    this.endDate,
    this.doctorName,
    this.hospitalName,
    this.notes,
    this.totalSessions = 0,
    this.completedSessions = 0,
    this.sideEffects = const [],
    this.isActive = true,
  });

  Treatment copyWith({
    String? id,
    String? name,
    TreatmentType? type,
    DateTime? startDate,
    DateTime? endDate,
    String? doctorName,
    String? hospitalName,
    String? notes,
    int? totalSessions,
    int? completedSessions,
    List<String>? sideEffects,
    bool? isActive,
  }) {
    return Treatment(
      id: id ?? this.id,
      name: name ?? this.name,
      type: type ?? this.type,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      doctorName: doctorName ?? this.doctorName,
      hospitalName: hospitalName ?? this.hospitalName,
      notes: notes ?? this.notes,
      totalSessions: totalSessions ?? this.totalSessions,
      completedSessions: completedSessions ?? this.completedSessions,
      sideEffects: sideEffects ?? this.sideEffects,
      isActive: isActive ?? this.isActive,
    );
  }

  /// Calculate progress percentage
  double get progressPercentage {
    if (totalSessions == 0) return 0;
    return (completedSessions / totalSessions * 100).clamp(0, 100);
  }

  /// Get treatment type display name
  String get typeDisplayName {
    switch (type) {
      case TreatmentType.surgery:
        return 'Surgery';
      case TreatmentType.chemotherapy:
        return 'Chemotherapy';
      case TreatmentType.radiation:
        return 'Radiation Therapy';
      case TreatmentType.immunotherapy:
        return 'Immunotherapy';
      case TreatmentType.hormoneTherapy:
        return 'Hormone Therapy';
      case TreatmentType.targetedTherapy:
        return 'Targeted Therapy';
      case TreatmentType.stemCell:
        return 'Stem Cell Transplant';
      case TreatmentType.other:
        return 'Other';
    }
  }

  /// Get treatment type icon name
  String get typeIcon {
    switch (type) {
      case TreatmentType.surgery:
        return 'medical_services';
      case TreatmentType.chemotherapy:
        return 'science';
      case TreatmentType.radiation:
        return 'radio_button_checked';
      case TreatmentType.immunotherapy:
        return 'security';
      case TreatmentType.hormoneTherapy:
        return 'medication';
      case TreatmentType.targetedTherapy:
        return 'track_changes';
      case TreatmentType.stemCell:
        return 'biotech';
      case TreatmentType.other:
        return 'healing';
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type.index,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'doctorName': doctorName,
      'hospitalName': hospitalName,
      'notes': notes,
      'totalSessions': totalSessions,
      'completedSessions': completedSessions,
      'sideEffects': sideEffects,
      'isActive': isActive,
    };
  }

  factory Treatment.fromJson(Map<String, dynamic> json) {
    return Treatment(
      id: json['id'] as String,
      name: json['name'] as String,
      type: TreatmentType.values[json['type'] as int],
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate'] as String) : null,
      doctorName: json['doctorName'] as String?,
      hospitalName: json['hospitalName'] as String?,
      notes: json['notes'] as String?,
      totalSessions: json['totalSessions'] as int? ?? 0,
      completedSessions: json['completedSessions'] as int? ?? 0,
      sideEffects: List<String>.from(json['sideEffects'] ?? []),
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  String toJsonString() => jsonEncode(toJson());

  factory Treatment.fromJsonString(String jsonString) {
    return Treatment.fromJson(jsonDecode(jsonString) as Map<String, dynamic>);
  }
}
