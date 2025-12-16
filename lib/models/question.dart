/// Question model for the Q&A Forum
class Question {
  final String id;
  final String title;
  final String content;
  final String category;
  final String userId;
  final String? userName; // null if anonymous
  final String? profilePictureUrl; // null if anonymous or no profile picture
  final bool isAnonymous;
  final int upvotes;
  final int answerCount;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isResolved;
  final List<String> tags;

  Question({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    required this.userId,
    this.userName,
    this.profilePictureUrl,
    required this.isAnonymous,
    this.upvotes = 0,
    this.answerCount = 0,
    required this.createdAt,
    required this.updatedAt,
    this.isResolved = false,
    this.tags = const [],
  });

  /// Create from JSON (Supabase response)
  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      category: json['category'] as String,
      userId: json['user_id'] as String,
      userName: json['user_name'] as String?,
      profilePictureUrl: json['profile_picture_url'] as String?,
      isAnonymous: json['is_anonymous'] as bool? ?? false,
      upvotes: json['upvotes'] as int? ?? 0,
      answerCount: json['answer_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      isResolved: json['is_resolved'] as bool? ?? false,
      tags: json['tags'] != null 
          ? List<String>.from(json['tags'] as List)
          : [],
    );
  }

  /// Convert to JSON for Supabase
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'category': category,
      'user_id': userId,
      'user_name': userName,
      'profile_picture_url': profilePictureUrl,
      'is_anonymous': isAnonymous,
      'upvotes': upvotes,
      'answer_count': answerCount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'is_resolved': isResolved,
      'tags': tags,
    };
  }

  /// Create a copy with modified fields
  Question copyWith({
    String? id,
    String? title,
    String? content,
    String? category,
    String? userId,
    String? userName,
    String? profilePictureUrl,
    bool? isAnonymous,
    int? upvotes,
    int? answerCount,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isResolved,
    List<String>? tags,
  }) {
    return Question(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      category: category ?? this.category,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      profilePictureUrl: profilePictureUrl ?? this.profilePictureUrl,
      isAnonymous: isAnonymous ?? this.isAnonymous,
      upvotes: upvotes ?? this.upvotes,
      answerCount: answerCount ?? this.answerCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isResolved: isResolved ?? this.isResolved,
      tags: tags ?? this.tags,
    );
  }

  /// Get display name (Random anonymous name if user chose anonymous)
  String get displayName {
    if (isAnonymous) {
      return _getAnonymousName(userId);
    }
    // If userName is empty, generate a display name from userId
    if (userName == null || userName!.isEmpty) {
      return 'User ${userId.substring(0, 8)}';
    }
    return userName!;
  }

  /// Generate consistent anonymous name based on user ID
  static String _getAnonymousName(String userId) {
    final anonymousNames = [
      'Anonymous User',
      'Anonymous Helper',
      'Anonymous Friend',
      'Anonymous Supporter',
      'Anonymous Warrior',
      'Anonymous Hope',
      'Anonymous Light',
      'Anonymous Care',
      'Anonymous Heart',
      'Anonymous Soul',
    ];
    
    // Use user ID hash to get consistent name for same user
    final hash = userId.hashCode.abs();
    return anonymousNames[hash % anonymousNames.length];
  }

  /// Get relative time string (e.g., "2 hours ago")
  String get relativeTime {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inDays > 365) {
      final years = (difference.inDays / 365).floor();
      return '$years ${years == 1 ? 'year' : 'years'} ago';
    } else if (difference.inDays > 30) {
      final months = (difference.inDays / 30).floor();
      return '$months ${months == 1 ? 'month' : 'months'} ago';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} ${difference.inDays == 1 ? 'day' : 'days'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} ${difference.inHours == 1 ? 'hour' : 'hours'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} ${difference.inMinutes == 1 ? 'minute' : 'minutes'} ago';
    } else {
      return 'Just now';
    }
  }
}

/// Forum categories
class ForumCategory {
  static const String symptoms = 'Symptoms';
  static const String diagnosis = 'Diagnosis';
  static const String mentalHealth = 'Mental Health';
  static const String lifestyle = 'Lifestyle';
  static const String familySupport = 'Family Support';

  static const List<String> all = [
    symptoms,
    diagnosis,
    mentalHealth,
    lifestyle,
    familySupport,
  ];

  /// Get icon for category
  static String getIcon(String category) {
    switch (category) {
      case symptoms:
        return '🩺';
      case diagnosis:
        return '🔬';
      case mentalHealth:
        return '🧠';
      case lifestyle:
        return '💪';
      case familySupport:
        return '👨‍👩‍👧‍👦';
      default:
        return '💬';
    }
  }
}
