import 'dart:convert';

/// Model class for storing notifications in the app
class AppNotification {
  final String id;
  final String title;
  final String body;
  final String type; // health_tip, hydration, movement, forum_reply, etc.
  final DateTime timestamp;
  final bool isRead;
  final String? payload;
  final String? iconName; // Icon name for display

  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.timestamp,
    this.isRead = false,
    this.payload,
    this.iconName,
  });

  /// Create a copy with updated fields
  AppNotification copyWith({
    String? id,
    String? title,
    String? body,
    String? type,
    DateTime? timestamp,
    bool? isRead,
    String? payload,
    String? iconName,
  }) {
    return AppNotification(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      payload: payload ?? this.payload,
      iconName: iconName ?? this.iconName,
    );
  }

  /// Convert to JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'type': type,
      'timestamp': timestamp.toIso8601String(),
      'isRead': isRead,
      'payload': payload,
      'iconName': iconName,
    };
  }

  /// Create from JSON map
  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      type: json['type'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      isRead: json['isRead'] as bool? ?? false,
      payload: json['payload'] as String?,
      iconName: json['iconName'] as String?,
    );
  }

  /// Encode to JSON string
  String toJsonString() => jsonEncode(toJson());

  /// Create from JSON string
  factory AppNotification.fromJsonString(String jsonString) {
    return AppNotification.fromJson(jsonDecode(jsonString) as Map<String, dynamic>);
  }

  /// Get formatted time ago string
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 7) {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  /// Get display icon based on notification type
  String get displayIcon {
    if (iconName != null) return iconName!;
    
    switch (type) {
      case 'health_tip':
        return 'lightbulb';
      case 'hydration':
        return 'water_drop';
      case 'movement':
        return 'directions_walk';
      case 'sun_protection':
        return 'wb_sunny';
      case 'self_check':
        return 'health_and_safety';
      case 'screening':
        return 'calendar_today';
      case 'forum_reply':
        return 'reply';
      case 'forum_upvote':
        return 'thumb_up';
      case 'weekly_check_in':
        return 'check_circle';
      default:
        return 'notifications';
    }
  }

  @override
  String toString() {
    return 'AppNotification(id: $id, title: $title, type: $type, isRead: $isRead)';
  }
}
