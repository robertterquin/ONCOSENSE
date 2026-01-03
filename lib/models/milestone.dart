import 'dart:convert';

/// Types of milestones
enum MilestoneType {
  daysFree, // Days cancer-free
  treatmentComplete, // Completed treatment milestone
  sessionComplete, // Completed session (25%, 50%, etc.)
  recovery, // Recovery milestone
  personal, // Personal milestone
  anniversary, // Anniversary of important dates
}

/// Represents a milestone in the cancer journey
class Milestone {
  final String id;
  final String title;
  final String description;
  final MilestoneType type;
  final DateTime dateAchieved;
  final bool isCelebrated;
  final String? iconName;
  final int? daysCount; // For days-free milestones

  Milestone({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.dateAchieved,
    this.isCelebrated = false,
    this.iconName,
    this.daysCount,
  });

  Milestone copyWith({
    String? id,
    String? title,
    String? description,
    MilestoneType? type,
    DateTime? dateAchieved,
    bool? isCelebrated,
    String? iconName,
    int? daysCount,
  }) {
    return Milestone(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      type: type ?? this.type,
      dateAchieved: dateAchieved ?? this.dateAchieved,
      isCelebrated: isCelebrated ?? this.isCelebrated,
      iconName: iconName ?? this.iconName,
      daysCount: daysCount ?? this.daysCount,
    );
  }

  /// Get display icon based on milestone type
  String get displayIcon {
    if (iconName != null) return iconName!;

    switch (type) {
      case MilestoneType.daysFree:
        return 'celebration';
      case MilestoneType.treatmentComplete:
        return 'emoji_events';
      case MilestoneType.sessionComplete:
        return 'check_circle';
      case MilestoneType.recovery:
        return 'favorite';
      case MilestoneType.personal:
        return 'star';
      case MilestoneType.anniversary:
        return 'cake';
    }
  }

  /// Get formatted date
  String get formattedDate {
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[dateAchieved.month - 1]} ${dateAchieved.day}, ${dateAchieved.year}';
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type.name,
      'date_achieved': dateAchieved.toIso8601String(),
      'is_celebrated': isCelebrated,
      'days_count': daysCount,
      // user_id will be added by the service when saving to Supabase
    };
  }

  factory Milestone.fromJson(Map<String, dynamic> json) {
    // Parse type - support both string name and int index
    MilestoneType parsedType;
    final typeValue = json['type'];
    if (typeValue is String) {
      parsedType = MilestoneType.values.firstWhere(
        (e) => e.name == typeValue,
        orElse: () => MilestoneType.personal,
      );
    } else {
      parsedType = MilestoneType.values[typeValue as int];
    }
    
    return Milestone(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      type: parsedType,
      dateAchieved: DateTime.parse((json['date_achieved'] ?? json['dateAchieved']) as String),
      isCelebrated: (json['is_celebrated'] ?? json['isCelebrated'] ?? false) as bool,
      daysCount: (json['days_count'] ?? json['daysCount']) as int?,
    );
  }

  String toJsonString() => jsonEncode(toJson());

  factory Milestone.fromJsonString(String jsonString) {
    return Milestone.fromJson(jsonDecode(jsonString) as Map<String, dynamic>);
  }
}

/// Predefined milestone templates
class MilestoneTemplates {
  static List<Map<String, dynamic>> daysFreeTemplates = [
    {'days': 7, 'title': '1 Week Cancer-Free! 🎉', 'description': 'You\'ve completed your first week!'},
    {'days': 30, 'title': '1 Month Cancer-Free! 🌟', 'description': 'One month of strength and courage!'},
    {'days': 90, 'title': '3 Months Cancer-Free! 💪', 'description': 'Quarter milestone achieved!'},
    {'days': 180, 'title': '6 Months Cancer-Free! 🏆', 'description': 'Half a year of fighting strong!'},
    {'days': 365, 'title': '1 Year Cancer-Free! 🎊', 'description': 'A full year - incredible achievement!'},
    {'days': 730, 'title': '2 Years Cancer-Free! 🌈', 'description': 'Two years of victory!'},
    {'days': 1825, 'title': '5 Years Cancer-Free! 👑', 'description': 'Five-year survivor milestone!'},
  ];

  static List<Map<String, dynamic>> treatmentTemplates = [
    {'percent': 25, 'title': '25% Treatment Complete! 💪', 'description': 'Quarter way through!'},
    {'percent': 50, 'title': '50% Treatment Complete! 🎯', 'description': 'Halfway there!'},
    {'percent': 75, 'title': '75% Treatment Complete! 🌟', 'description': 'Almost at the finish line!'},
    {'percent': 100, 'title': 'Treatment Complete! 🎉', 'description': 'You did it! Treatment finished!'},
  ];
}
