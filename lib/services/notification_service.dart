import 'dart:io';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz_data;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cancerapp/services/health_reminders_service.dart';
import 'package:cancerapp/models/health_reminder.dart';

/// Notification types for the Cancer Awareness App
class NotificationType {
  static const String healthTip = 'health_tip';
  static const String hydration = 'hydration';
  static const String movement = 'movement';
  static const String sunProtection = 'sun_protection';
  static const String selfCheck = 'self_check';
  static const String screening = 'screening';
  static const String forumReply = 'forum_reply';
  static const String forumUpvote = 'forum_upvote';
  static const String weeklyCheckIn = 'weekly_check_in';
  static const String resourceUpdate = 'resource_update';
}

/// Notification channel IDs for Android
class NotificationChannels {
  static const String healthReminders = 'health_reminders';
  static const String hydrationReminders = 'hydration_reminders';
  static const String movementReminders = 'movement_reminders';
  static const String forumNotifications = 'forum_notifications';
  static const String screeningReminders = 'screening_reminders';
  static const String wellnessCheckIn = 'wellness_check_in';
}

/// Comprehensive Notification Service for OncoSense App
/// Supports background notifications even when app is closed
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();
  final HealthRemindersService _healthRemindersService = HealthRemindersService();
  
  bool _isInitialized = false;
  
  // Notification IDs
  static const int _dailyHealthTipId = 1000;
  static const int _hydrationBaseId = 2000;
  static const int _movementBaseId = 3000;
  static const int _sunProtectionId = 4000;
  static const int _selfCheckId = 5000;
  static const int _weeklyCheckInId = 6000;
  static const int _forumBaseId = 7000;

  /// Initialize the notification service
  Future<void> initialize() async {
    if (_isInitialized) return;

    // Initialize timezone
    tz_data.initializeTimeZones();
    
    // Android initialization settings
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    
    // iOS initialization settings
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
      onDidReceiveBackgroundNotificationResponse: _onBackgroundNotificationTapped,
    );

    // Create notification channels for Android
    await _createNotificationChannels();
    
    _isInitialized = true;
    debugPrint('✅ NotificationService initialized');
  }

  /// Create Android notification channels
  Future<void> _createNotificationChannels() async {
    final androidPlugin = _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    
    if (androidPlugin != null) {
      // Health Reminders Channel
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          NotificationChannels.healthReminders,
          'Health Reminders',
          description: 'Daily health tips and cancer prevention reminders',
          importance: Importance.high,
          enableVibration: true,
          playSound: true,
        ),
      );

      // Hydration Reminders Channel
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          NotificationChannels.hydrationReminders,
          'Hydration Reminders',
          description: 'Drink water reminders throughout the day',
          importance: Importance.defaultImportance,
          enableVibration: true,
        ),
      );

      // Movement Reminders Channel
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          NotificationChannels.movementReminders,
          'Movement Reminders',
          description: 'Reminders to stay active and take walks',
          importance: Importance.defaultImportance,
          enableVibration: true,
        ),
      );

      // Forum Notifications Channel
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          NotificationChannels.forumNotifications,
          'Forum Notifications',
          description: 'Replies and upvotes on your questions',
          importance: Importance.high,
          enableVibration: true,
          playSound: true,
        ),
      );

      // Screening Reminders Channel
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          NotificationChannels.screeningReminders,
          'Screening Reminders',
          description: 'Self-check and screening appointment reminders',
          importance: Importance.high,
          enableVibration: true,
          playSound: true,
        ),
      );

      // Wellness Check-in Channel
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          NotificationChannels.wellnessCheckIn,
          'Wellness Check-in',
          description: 'Weekly wellness check-in reminders',
          importance: Importance.defaultImportance,
          enableVibration: true,
        ),
      );
    }
  }

  /// Handle notification tap when app is in foreground/background
  static void _onNotificationTapped(NotificationResponse response) {
    debugPrint('Notification tapped: ${response.payload}');
    // TODO: Navigate to appropriate screen based on payload
  }

  /// Handle notification tap when app was terminated
  @pragma('vm:entry-point')
  static void _onBackgroundNotificationTapped(NotificationResponse response) {
    debugPrint('Background notification tapped: ${response.payload}');
  }

  /// Request notification permissions
  Future<bool> requestPermissions() async {
    if (Platform.isAndroid) {
      final androidPlugin = _notifications.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      
      if (androidPlugin != null) {
        final granted = await androidPlugin.requestNotificationsPermission();
        return granted ?? false;
      }
    } else if (Platform.isIOS) {
      final iosPlugin = _notifications.resolvePlatformSpecificImplementation<
          IOSFlutterLocalNotificationsPlugin>();
      
      if (iosPlugin != null) {
        final granted = await iosPlugin.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );
        return granted ?? false;
      }
    }
    return false;
  }

  /// Check if notifications are enabled
  Future<bool> areNotificationsEnabled() async {
    if (Platform.isAndroid) {
      final androidPlugin = _notifications.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      return await androidPlugin?.areNotificationsEnabled() ?? false;
    }
    return true; // iOS handles this differently
  }

  
  Future<void> scheduleDailyHealthTip({
    int hour = 9,
    int minute = 0,
  }) async {
    await _cancelNotification(_dailyHealthTipId);
    
    final reminders = await _healthRemindersService.getActiveReminders();
    if (reminders.isEmpty) return;

    final random = Random();
    final reminder = reminders[random.nextInt(reminders.length)];

    await _notifications.zonedSchedule(
      _dailyHealthTipId,
      '💡 ${reminder.title}',
      reminder.message,
      _nextInstanceOfTime(hour, minute),
      NotificationDetails(
        android: AndroidNotificationDetails(
          NotificationChannels.healthReminders,
          'Health Reminders',
          channelDescription: 'Daily health tips and cancer prevention reminders',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
          color: const Color(0xFFD81B60),
          styleInformation: BigTextStyleInformation(
            reminder.message,
            contentTitle: '💡 ${reminder.title}',
            summaryText: reminder.source ?? 'OncoSense Health Tip',
          ),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
      payload: '${NotificationType.healthTip}:${reminder.id}',
    );

    debugPrint('✅ Daily health tip scheduled for $hour:$minute');
  }

  /// Schedule hydration reminders throughout the day
  Future<void> scheduleHydrationReminders({
    int startHour = 8,
    int endHour = 20,
    int intervalHours = 2,
  }) async {
    // Cancel existing hydration reminders
    for (int i = 0; i < 10; i++) {
      await _cancelNotification(_hydrationBaseId + i);
    }

    final messages = [
      "💧 Don't forget to drink water!",
      "💧 Stay hydrated - have a glass of water",
      "💧 Time for a water break",
      "💧 Keep sipping! Hydration is key",
      "💧 Water time! Your body will thank you",
      "💧 Drink 8 glasses of water daily",
    ];

    int notificationIndex = 0;
    for (int hour = startHour; hour <= endHour; hour += intervalHours) {
      if (notificationIndex >= messages.length) break;
      
      await _notifications.zonedSchedule(
        _hydrationBaseId + notificationIndex,
        '💧 Hydration Reminder',
        messages[notificationIndex],
        _nextInstanceOfTime(hour, 0),
        NotificationDetails(
          android: AndroidNotificationDetails(
            NotificationChannels.hydrationReminders,
            'Hydration Reminders',
            channelDescription: 'Drink water reminders throughout the day',
            importance: Importance.defaultImportance,
            priority: Priority.defaultPriority,
            icon: '@mipmap/ic_launcher',
            color: const Color(0xFF2196F3),
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        matchDateTimeComponents: DateTimeComponents.time,
        payload: '${NotificationType.hydration}:$hour',
      );
      
      notificationIndex++;
    }

    debugPrint('✅ Hydration reminders scheduled');
  }

  /// Schedule movement/activity reminders
  Future<void> scheduleMovementReminders({
    int startHour = 9,
    int endHour = 18,
    int intervalHours = 3,
  }) async {
    // Cancel existing movement reminders
    for (int i = 0; i < 5; i++) {
      await _cancelNotification(_movementBaseId + i);
    }

    final messages = [
      "🏃 Take a short walk to stay active!",
      "🏃 Time to stretch! Simple stretches reduce tension",
      "🏃 Stand up and move every hour",
      "🏃 Take the stairs instead of elevator",
      "🏃 A 3-minute walk break does wonders!",
    ];

    int notificationIndex = 0;
    for (int hour = startHour; hour <= endHour; hour += intervalHours) {
      if (notificationIndex >= messages.length) break;
      
      await _notifications.zonedSchedule(
        _movementBaseId + notificationIndex,
        '🏃 Movement Reminder',
        messages[notificationIndex],
        _nextInstanceOfTime(hour, 30),
        NotificationDetails(
          android: AndroidNotificationDetails(
            NotificationChannels.movementReminders,
            'Movement Reminders',
            channelDescription: 'Reminders to stay active and take walks',
            importance: Importance.defaultImportance,
            priority: Priority.defaultPriority,
            icon: '@mipmap/ic_launcher',
            color: const Color(0xFF4CAF50),
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        matchDateTimeComponents: DateTimeComponents.time,
        payload: '${NotificationType.movement}:$hour',
      );
      
      notificationIndex++;
    }

    debugPrint('✅ Movement reminders scheduled');
  }

  /// Schedule sun protection reminder (10AM - 3PM warning)
  Future<void> scheduleSunProtectionReminder({int hour = 10}) async {
    await _cancelNotification(_sunProtectionId);

    await _notifications.zonedSchedule(
      _sunProtectionId,
      '☀️ Sun Protection Reminder',
      'Avoid sun exposure from 10AM–3PM. Apply SPF 30+ sunscreen!',
      _nextInstanceOfTime(hour, 0),
      NotificationDetails(
        android: AndroidNotificationDetails(
          NotificationChannels.healthReminders,
          'Health Reminders',
          channelDescription: 'Daily health tips and cancer prevention reminders',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
          color: const Color(0xFFFFC107),
          styleInformation: const BigTextStyleInformation(
            'Avoid sun exposure from 10AM–3PM. Apply SPF 30+ sunscreen and seek shade when possible.',
            contentTitle: '☀️ Sun Protection Reminder',
            summaryText: 'American Cancer Society',
          ),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
      payload: NotificationType.sunProtection,
    );

    debugPrint('✅ Sun protection reminder scheduled for $hour:00');
  }

  // ============================================
  // SELF-CHECK & SCREENING REMINDERS
  // ============================================

  /// Schedule monthly breast self-exam reminder
  Future<void> scheduleMonthlyBreastSelfExam({int dayOfMonth = 1}) async {
    await _cancelNotification(_selfCheckId);

    final now = DateTime.now();
    var scheduledDate = DateTime(now.year, now.month, dayOfMonth, 9, 0);
    
    // If the day has passed this month, schedule for next month
    if (scheduledDate.isBefore(now)) {
      scheduledDate = DateTime(now.year, now.month + 1, dayOfMonth, 9, 0);
    }

    await _notifications.zonedSchedule(
      _selfCheckId,
      '🩺 Monthly Self-Exam Reminder',
      "It's time for your monthly breast self-examination. Early detection saves lives!",
      tz.TZDateTime.from(scheduledDate, tz.local),
      NotificationDetails(
        android: AndroidNotificationDetails(
          NotificationChannels.screeningReminders,
          'Screening Reminders',
          channelDescription: 'Self-check and screening appointment reminders',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
          color: const Color(0xFFD81B60),
          styleInformation: const BigTextStyleInformation(
            "It's time for your monthly breast self-examination. Early detection saves lives! Tap to learn the proper technique.",
            contentTitle: '🩺 Monthly Self-Exam Reminder',
            summaryText: 'American Cancer Society Guidelines',
          ),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.dayOfMonthAndTime,
      payload: NotificationType.selfCheck,
    );

    debugPrint('✅ Monthly self-exam reminder scheduled for day $dayOfMonth');
  }

  /// Schedule custom screening reminder
  Future<void> scheduleScreeningReminder({
    required String title,
    required String message,
    required DateTime scheduledDate,
    int? notificationId,
  }) async {
    final id = notificationId ?? _selfCheckId + Random().nextInt(100);
    
    await _notifications.zonedSchedule(
      id,
      '🏥 $title',
      message,
      tz.TZDateTime.from(scheduledDate, tz.local),
      NotificationDetails(
        android: AndroidNotificationDetails(
          NotificationChannels.screeningReminders,
          'Screening Reminders',
          channelDescription: 'Self-check and screening appointment reminders',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
          color: const Color(0xFFE91E63),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: '${NotificationType.screening}:$id',
    );

    debugPrint('✅ Screening reminder scheduled for $scheduledDate');
  }

  // ============================================
  // WEEKLY WELLNESS CHECK-IN
  // ============================================

  /// Schedule weekly wellness check-in
  Future<void> scheduleWeeklyCheckIn({
    int dayOfWeek = DateTime.sunday, // 1 = Monday, 7 = Sunday
    int hour = 10,
  }) async {
    await _cancelNotification(_weeklyCheckInId);

    await _notifications.zonedSchedule(
      _weeklyCheckInId,
      '💗 Weekly Wellness Check-in',
      "How are you feeling today? Take a moment to reflect on your well-being.",
      _nextInstanceOfDayAndTime(dayOfWeek, hour, 0),
      NotificationDetails(
        android: AndroidNotificationDetails(
          NotificationChannels.wellnessCheckIn,
          'Wellness Check-in',
          channelDescription: 'Weekly wellness check-in reminders',
          importance: Importance.defaultImportance,
          priority: Priority.defaultPriority,
          icon: '@mipmap/ic_launcher',
          color: const Color(0xFF9C27B0),
          styleInformation: const BigTextStyleInformation(
            "How are you feeling today? Take a moment to reflect on your well-being. Your mental health matters! 💗",
            contentTitle: '💗 Weekly Wellness Check-in',
            summaryText: 'OncoSense Wellness',
          ),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.dayOfWeekAndTime,
      payload: NotificationType.weeklyCheckIn,
    );

    debugPrint('✅ Weekly check-in scheduled for day $dayOfWeek at $hour:00');
  }

  // ============================================
  // FORUM NOTIFICATIONS
  // ============================================

  /// Show immediate forum reply notification
  Future<void> showForumReplyNotification({
    required String questionTitle,
    required String replierName,
    required String questionId,
  }) async {
    final id = _forumBaseId + Random().nextInt(1000);
    
    await _notifications.show(
      id,
      '💬 New Reply to Your Question',
      '$replierName replied to "$questionTitle"',
      NotificationDetails(
        android: AndroidNotificationDetails(
          NotificationChannels.forumNotifications,
          'Forum Notifications',
          channelDescription: 'Replies and upvotes on your questions',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
          color: const Color(0xFFD81B60),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: '${NotificationType.forumReply}:$questionId',
    );
  }

  /// Show forum upvote notification
  Future<void> showForumUpvoteNotification({
    required String contentTitle,
    required int upvoteCount,
    required String contentId,
    bool isQuestion = true,
  }) async {
    final id = _forumBaseId + Random().nextInt(1000);
    final contentType = isQuestion ? 'question' : 'answer';
    
    await _notifications.show(
      id,
      '👍 Your $contentType was upvoted!',
      '"$contentTitle" now has $upvoteCount upvotes',
      NotificationDetails(
        android: AndroidNotificationDetails(
          NotificationChannels.forumNotifications,
          'Forum Notifications',
          channelDescription: 'Replies and upvotes on your questions',
          importance: Importance.defaultImportance,
          priority: Priority.defaultPriority,
          icon: '@mipmap/ic_launcher',
          color: const Color(0xFFD81B60),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: '${NotificationType.forumUpvote}:$contentId',
    );
  }

  // ============================================
  // RESOURCE UPDATE NOTIFICATIONS
  // ============================================

  /// Show resource update notification
  Future<void> showResourceUpdateNotification({
    required String title,
    required String message,
  }) async {
    final id = Random().nextInt(10000) + 8000;
    
    await _notifications.show(
      id,
      '📢 $title',
      message,
      NotificationDetails(
        android: AndroidNotificationDetails(
          NotificationChannels.healthReminders,
          'Health Reminders',
          channelDescription: 'Daily health tips and cancer prevention reminders',
          importance: Importance.defaultImportance,
          priority: Priority.defaultPriority,
          icon: '@mipmap/ic_launcher',
          color: const Color(0xFF1976D2),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: NotificationType.resourceUpdate,
    );
  }

  // ============================================
  // NOTIFICATION SETTINGS MANAGEMENT
  // ============================================

  /// Enable all default notifications
  Future<void> enableAllNotifications() async {
    await scheduleDailyHealthTip();
    await scheduleHydrationReminders();
    await scheduleMovementReminders();
    await scheduleSunProtectionReminder();
    await scheduleMonthlyBreastSelfExam();
    await scheduleWeeklyCheckIn();
    
    await _saveNotificationSettings(
      healthTipsEnabled: true,
      hydrationEnabled: true,
      movementEnabled: true,
      sunProtectionEnabled: true,
      selfCheckEnabled: true,
      weeklyCheckInEnabled: true,
      forumEnabled: true,
    );
    
    debugPrint('✅ All notifications enabled');
  }

  /// Disable all notifications
  Future<void> disableAllNotifications() async {
    await _notifications.cancelAll();
    
    await _saveNotificationSettings(
      healthTipsEnabled: false,
      hydrationEnabled: false,
      movementEnabled: false,
      sunProtectionEnabled: false,
      selfCheckEnabled: false,
      weeklyCheckInEnabled: false,
      forumEnabled: false,
    );
    
    debugPrint('✅ All notifications disabled');
  }

  /// Save notification settings to SharedPreferences
  Future<void> _saveNotificationSettings({
    required bool healthTipsEnabled,
    required bool hydrationEnabled,
    required bool movementEnabled,
    required bool sunProtectionEnabled,
    required bool selfCheckEnabled,
    required bool weeklyCheckInEnabled,
    required bool forumEnabled,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notification_health_tips', healthTipsEnabled);
    await prefs.setBool('notification_hydration', hydrationEnabled);
    await prefs.setBool('notification_movement', movementEnabled);
    await prefs.setBool('notification_sun_protection', sunProtectionEnabled);
    await prefs.setBool('notification_self_check', selfCheckEnabled);
    await prefs.setBool('notification_weekly_checkin', weeklyCheckInEnabled);
    await prefs.setBool('notification_forum', forumEnabled);
  }

  /// Get notification settings from SharedPreferences
  Future<Map<String, bool>> getNotificationSettings() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'health_tips': prefs.getBool('notification_health_tips') ?? true,
      'hydration': prefs.getBool('notification_hydration') ?? true,
      'movement': prefs.getBool('notification_movement') ?? true,
      'sun_protection': prefs.getBool('notification_sun_protection') ?? true,
      'self_check': prefs.getBool('notification_self_check') ?? true,
      'weekly_checkin': prefs.getBool('notification_weekly_checkin') ?? true,
      'forum': prefs.getBool('notification_forum') ?? true,
    };
  }

  /// Toggle individual notification type
  Future<void> toggleNotificationType(String type, bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notification_$type', enabled);

    switch (type) {
      case 'health_tips':
        if (enabled) {
          await scheduleDailyHealthTip();
        } else {
          await _cancelNotification(_dailyHealthTipId);
        }
        break;
      case 'hydration':
        if (enabled) {
          await scheduleHydrationReminders();
        } else {
          for (int i = 0; i < 10; i++) {
            await _cancelNotification(_hydrationBaseId + i);
          }
        }
        break;
      case 'movement':
        if (enabled) {
          await scheduleMovementReminders();
        } else {
          for (int i = 0; i < 5; i++) {
            await _cancelNotification(_movementBaseId + i);
          }
        }
        break;
      case 'sun_protection':
        if (enabled) {
          await scheduleSunProtectionReminder();
        } else {
          await _cancelNotification(_sunProtectionId);
        }
        break;
      case 'self_check':
        if (enabled) {
          await scheduleMonthlyBreastSelfExam();
        } else {
          await _cancelNotification(_selfCheckId);
        }
        break;
      case 'weekly_checkin':
        if (enabled) {
          await scheduleWeeklyCheckIn();
        } else {
          await _cancelNotification(_weeklyCheckInId);
        }
        break;
    }
  }

  /// Cancel a specific notification
  Future<void> _cancelNotification(int id) async {
    await _notifications.cancel(id);
  }

  /// Get the next instance of a specific time today or tomorrow
  tz.TZDateTime _nextInstanceOfTime(int hour, int minute) {
    final now = tz.TZDateTime.now(tz.local);
    var scheduledDate = tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);
    
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    
    return scheduledDate;
  }

  /// Get the next instance of a specific day and time
  tz.TZDateTime _nextInstanceOfDayAndTime(int dayOfWeek, int hour, int minute) {
    var scheduledDate = _nextInstanceOfTime(hour, minute);
    
    while (scheduledDate.weekday != dayOfWeek) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    
    return scheduledDate;
  }

  /// Get pending notifications (for debugging)
  Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _notifications.pendingNotificationRequests();
  }

  /// Show a test notification (for debugging)
  Future<void> showTestNotification() async {
    await _notifications.show(
      0,
      '🧪 Test Notification',
      'OncoSense notifications are working!',
      NotificationDetails(
        android: AndroidNotificationDetails(
          NotificationChannels.healthReminders,
          'Health Reminders',
          channelDescription: 'Daily health tips and cancer prevention reminders',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
          color: const Color(0xFFD81B60),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
    );
  }
}
