import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cancerapp/models/app_notification.dart';

/// Service to manage stored notifications in the app
/// Provides functionality to save, load, mark as read, and delete notifications
class NotificationStorageService extends ChangeNotifier {
  static final NotificationStorageService _instance = NotificationStorageService._internal();
  factory NotificationStorageService() => _instance;
  NotificationStorageService._internal();

  static const String _storageKey = 'stored_notifications';
  static const int _maxStoredNotifications = 50; // Limit to prevent storage bloat

  List<AppNotification> _notifications = [];
  bool _isLoaded = false;

  /// Get all stored notifications (newest first)
  List<AppNotification> get notifications => List.unmodifiable(_notifications);

  /// Get unread notifications count
  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  /// Check if there are unread notifications
  bool get hasUnread => unreadCount > 0;

  /// Initialize and load notifications from storage
  Future<void> initialize() async {
    if (_isLoaded) return;
    await _loadNotifications();
    _isLoaded = true;
  }

  /// Load notifications from SharedPreferences
  Future<void> _loadNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = prefs.getString(_storageKey);
      
      if (jsonString != null && jsonString.isNotEmpty) {
        final List<dynamic> jsonList = jsonDecode(jsonString);
        _notifications = jsonList
            .map((json) => AppNotification.fromJson(json as Map<String, dynamic>))
            .toList();
        
        // Sort by timestamp (newest first)
        _notifications.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      }
      
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading notifications: $e');
      _notifications = [];
    }
  }

  /// Save notifications to SharedPreferences
  Future<void> _saveNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonList = _notifications.map((n) => n.toJson()).toList();
      await prefs.setString(_storageKey, jsonEncode(jsonList));
    } catch (e) {
      debugPrint('Error saving notifications: $e');
    }
  }

  /// Add a new notification
  Future<void> addNotification(AppNotification notification) async {
    // Check if notification with same ID already exists
    final existingIndex = _notifications.indexWhere((n) => n.id == notification.id);
    if (existingIndex >= 0) {
      _notifications[existingIndex] = notification;
    } else {
      _notifications.insert(0, notification);
    }

    // Trim to max stored notifications
    if (_notifications.length > _maxStoredNotifications) {
      _notifications = _notifications.sublist(0, _maxStoredNotifications);
    }

    await _saveNotifications();
    notifyListeners();
  }

  /// Add notification from raw data (convenience method)
  Future<void> addNotificationFromData({
    required String title,
    required String body,
    required String type,
    String? payload,
    String? iconName,
  }) async {
    final notification = AppNotification(
      id: '${DateTime.now().millisecondsSinceEpoch}_${type}',
      title: title,
      body: body,
      type: type,
      timestamp: DateTime.now(),
      isRead: false,
      payload: payload,
      iconName: iconName,
    );
    
    await addNotification(notification);
  }

  /// Mark a notification as read
  Future<void> markAsRead(String notificationId) async {
    final index = _notifications.indexWhere((n) => n.id == notificationId);
    if (index >= 0) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
      await _saveNotifications();
      notifyListeners();
    }
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    _notifications = _notifications
        .map((n) => n.copyWith(isRead: true))
        .toList();
    await _saveNotifications();
    notifyListeners();
  }

  /// Delete a specific notification
  Future<void> deleteNotification(String notificationId) async {
    _notifications.removeWhere((n) => n.id == notificationId);
    await _saveNotifications();
    notifyListeners();
  }

  /// Delete all notifications
  Future<void> clearAllNotifications() async {
    _notifications.clear();
    await _saveNotifications();
    notifyListeners();
  }

  /// Delete read notifications only
  Future<void> clearReadNotifications() async {
    _notifications.removeWhere((n) => n.isRead);
    await _saveNotifications();
    notifyListeners();
  }

  /// Get notifications by type
  List<AppNotification> getNotificationsByType(String type) {
    return _notifications.where((n) => n.type == type).toList();
  }

  /// Get notifications from today
  List<AppNotification> get todayNotifications {
    final today = DateTime.now();
    return _notifications.where((n) {
      return n.timestamp.year == today.year &&
          n.timestamp.month == today.month &&
          n.timestamp.day == today.day;
    }).toList();
  }

  /// Get notifications from this week
  List<AppNotification> get thisWeekNotifications {
    final now = DateTime.now();
    final weekAgo = now.subtract(const Duration(days: 7));
    return _notifications.where((n) => n.timestamp.isAfter(weekAgo)).toList();
  }

  /// Refresh notifications from storage
  Future<void> refresh() async {
    await _loadNotifications();
  }
}
