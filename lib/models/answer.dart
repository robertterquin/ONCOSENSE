/// Answer model for Q&A Forum responses
class Answer {
  final String id;
  final String questionId;
  final String content;
  final String userId;
  final String? userName;
  final bool isAnonymous;
  final int upvotes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isAccepted; // Marked as best answer by question author
  final String? parentAnswerId; // For replies to answers

  Answer({
    required this.id,
    required this.questionId,
    required this.content,
    required this.userId,
    this.userName,
    required this.isAnonymous,
    this.upvotes = 0,
    required this.createdAt,
    required this.updatedAt,
    this.isAccepted = false,
    this.parentAnswerId,
  });

  /// Create from JSON (Supabase response)
  factory Answer.fromJson(Map<String, dynamic> json) {
    return Answer(
      id: json['id'] as String,
      questionId: json['question_id'] as String,
      content: json['content'] as String,
      userId: json['user_id'] as String,
      userName: json['user_name'] as String?,
      isAnonymous: json['is_anonymous'] as bool? ?? false,
      upvotes: json['upvotes'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      isAccepted: json['is_accepted'] as bool? ?? false,
      parentAnswerId: json['parent_answer_id'] as String?,
    );
  }

  /// Convert to JSON for Supabase
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'question_id': questionId,
      'content': content,
      'user_id': userId,
      'user_name': userName,
      'is_anonymous': isAnonymous,
      'upvotes': upvotes,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'is_accepted': isAccepted,
      'parent_answer_id': parentAnswerId,
    };
  }

  /// Create a copy with modified fields
  Answer copyWith({
    String? id,
    String? questionId,
    String? content,
    String? userId,
    String? userName,
    bool? isAnonymous,
    int? upvotes,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isAccepted,
    String? parentAnswerId,
  }) {
    return Answer(
      id: id ?? this.id,
      questionId: questionId ?? this.questionId,
      content: content ?? this.content,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      isAnonymous: isAnonymous ?? this.isAnonymous,
      upvotes: upvotes ?? this.upvotes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isAccepted: isAccepted ?? this.isAccepted,
      parentAnswerId: parentAnswerId ?? this.parentAnswerId,
    );
  }

  /// Get display name (Anonymous if user chose anonymous)
  String get displayName => isAnonymous ? 'Anonymous' : (userName ?? 'User');

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

  /// Check if this is a reply (has parent answer)
  bool get isReply => parentAnswerId != null;
}
