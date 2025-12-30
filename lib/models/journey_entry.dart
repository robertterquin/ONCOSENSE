import 'dart:convert';

/// Represents a daily journal entry for the cancer journey tracker
class JourneyEntry {
  final String id;
  final DateTime date;
  final int moodLevel; // 1-5 scale (1=very sad, 5=very happy)
  final int painLevel; // 0-10 scale
  final int energyLevel; // 1-10 scale
  final int sleepQuality; // 1-5 scale
  final List<String> symptoms; // List of symptom names
  final String? notes;
  final String? appointmentNotes;
  final bool hasAppointment;

  JourneyEntry({
    required this.id,
    required this.date,
    required this.moodLevel,
    required this.painLevel,
    required this.energyLevel,
    required this.sleepQuality,
    this.symptoms = const [],
    this.notes,
    this.appointmentNotes,
    this.hasAppointment = false,
  });

  JourneyEntry copyWith({
    String? id,
    DateTime? date,
    int? moodLevel,
    int? painLevel,
    int? energyLevel,
    int? sleepQuality,
    List<String>? symptoms,
    String? notes,
    String? appointmentNotes,
    bool? hasAppointment,
  }) {
    return JourneyEntry(
      id: id ?? this.id,
      date: date ?? this.date,
      moodLevel: moodLevel ?? this.moodLevel,
      painLevel: painLevel ?? this.painLevel,
      energyLevel: energyLevel ?? this.energyLevel,
      sleepQuality: sleepQuality ?? this.sleepQuality,
      symptoms: symptoms ?? this.symptoms,
      notes: notes ?? this.notes,
      appointmentNotes: appointmentNotes ?? this.appointmentNotes,
      hasAppointment: hasAppointment ?? this.hasAppointment,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date': date.toIso8601String(),
      'moodLevel': moodLevel,
      'painLevel': painLevel,
      'energyLevel': energyLevel,
      'sleepQuality': sleepQuality,
      'symptoms': symptoms,
      'notes': notes,
      'appointmentNotes': appointmentNotes,
      'hasAppointment': hasAppointment,
    };
  }

  factory JourneyEntry.fromJson(Map<String, dynamic> json) {
    return JourneyEntry(
      id: json['id'] as String,
      date: DateTime.parse(json['date'] as String),
      moodLevel: json['moodLevel'] as int,
      painLevel: json['painLevel'] as int,
      energyLevel: json['energyLevel'] as int,
      sleepQuality: json['sleepQuality'] as int,
      symptoms: List<String>.from(json['symptoms'] ?? []),
      notes: json['notes'] as String?,
      appointmentNotes: json['appointmentNotes'] as String?,
      hasAppointment: json['hasAppointment'] as bool? ?? false,
    );
  }

  String toJsonString() => jsonEncode(toJson());

  factory JourneyEntry.fromJsonString(String jsonString) {
    return JourneyEntry.fromJson(jsonDecode(jsonString) as Map<String, dynamic>);
  }

  /// Get mood emoji based on level
  String get moodEmoji {
    switch (moodLevel) {
      case 1:
        return '😢';
      case 2:
        return '😞';
      case 3:
        return '😐';
      case 4:
        return '🙂';
      case 5:
        return '😄';
      default:
        return '😐';
    }
  }

  /// Get mood label based on level
  String get moodLabel {
    switch (moodLevel) {
      case 1:
        return 'Very Sad';
      case 2:
        return 'Sad';
      case 3:
        return 'Okay';
      case 4:
        return 'Good';
      case 5:
        return 'Great';
      default:
        return 'Okay';
    }
  }

  /// Get formatted date string
  String get formattedDate {
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}

/// Predefined symptoms for quick selection
class SymptomOptions {
  static const List<String> commonSymptoms = [
    'Fatigue',
    'Nausea',
    'Pain',
    'Headache',
    'Dizziness',
    'Loss of Appetite',
    'Difficulty Sleeping',
    'Anxiety',
    'Hair Loss',
    'Numbness/Tingling',
    'Mouth Sores',
    'Constipation',
    'Diarrhea',
    'Shortness of Breath',
    'Fever',
    'Chills',
    'Skin Changes',
    'Weight Changes',
    'Memory Issues',
    'Mood Changes',
  ];
}
