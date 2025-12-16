/// Health Reminder model for daily health tips and reminders
class HealthReminder {
  final String id;
  final String title;
  final String message;
  final String icon; // Icon name as string
  final String color; // Color hex code
  final String category; // hydration, exercise, nutrition, screening, etc.
  final int frequencyHours; // How often to show (in hours)
  final bool isActive;
  final DateTime? lastShownAt;
  final String? source; // Reference source for the information
  final int priority; // 1-5, higher priority shows first

  HealthReminder({
    required this.id,
    required this.title,
    required this.message,
    required this.icon,
    required this.color,
    required this.category,
    this.frequencyHours = 24,
    this.isActive = true,
    this.lastShownAt,
    this.source,
    this.priority = 3,
  });

  /// Create from JSON (Supabase response)
  factory HealthReminder.fromJson(Map<String, dynamic> json) {
    return HealthReminder(
      id: json['id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      icon: json['icon'] as String,
      color: json['color'] as String,
      category: json['category'] as String,
      frequencyHours: json['frequency_hours'] as int? ?? 24,
      isActive: json['is_active'] as bool? ?? true,
      lastShownAt: json['last_shown_at'] != null
          ? DateTime.parse(json['last_shown_at'] as String)
          : null,
      source: json['source'] as String?,
      priority: json['priority'] as int? ?? 3,
    );
  }

  /// Convert to JSON for Supabase
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'icon': icon,
      'color': color,
      'category': category,
      'frequency_hours': frequencyHours,
      'is_active': isActive,
      'last_shown_at': lastShownAt?.toIso8601String(),
      'source': source,
      'priority': priority,
    };
  }

  /// Create a copy with modified fields
  HealthReminder copyWith({
    String? id,
    String? title,
    String? message,
    String? icon,
    String? color,
    String? category,
    int? frequencyHours,
    bool? isActive,
    DateTime? lastShownAt,
    String? source,
    int? priority,
  }) {
    return HealthReminder(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      icon: icon ?? this.icon,
      color: color ?? this.color,
      category: category ?? this.category,
      frequencyHours: frequencyHours ?? this.frequencyHours,
      isActive: isActive ?? this.isActive,
      lastShownAt: lastShownAt ?? this.lastShownAt,
      source: source ?? this.source,
      priority: priority ?? this.priority,
    );
  }

  /// Check if reminder should be shown based on frequency
  bool shouldShow() {
    if (!isActive) return false;
    if (lastShownAt == null) return true;

    final hoursSinceLastShown = DateTime.now().difference(lastShownAt!).inHours;
    return hoursSinceLastShown >= frequencyHours;
  }
}

/// Predefined categories for health reminders
class ReminderCategory {
  static const String hydration = 'hydration';
  static const String exercise = 'exercise';
  static const String nutrition = 'nutrition';
  static const String screening = 'screening';
  static const String mentalHealth = 'mental_health';
  static const String sunProtection = 'sun_protection';
  static const String sleepHealth = 'sleep_health';
  static const String selfExam = 'self_exam';

  static const List<String> all = [
    hydration,
    exercise,
    nutrition,
    screening,
    mentalHealth,
    sunProtection,
    sleepHealth,
    selfExam,
  ];
}
