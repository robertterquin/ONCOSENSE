import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/utils/service_locator.dart';
import 'package:cancerapp/services/notification_storage_service.dart';
import 'package:cancerapp/models/app_notification.dart';

/// Notification storage service provider
final notificationStorageServiceProvider = Provider<NotificationStorageService>((ref) {
  return getIt<NotificationStorageService>();
});

/// Notifications provider - all notifications
final notificationsProvider = StateNotifierProvider<NotificationsNotifier, AsyncValue<List<AppNotification>>>((ref) {
  return NotificationsNotifier();
});

class NotificationsNotifier extends StateNotifier<AsyncValue<List<AppNotification>>> {
  NotificationsNotifier() : super(const AsyncValue.loading()) {
    _loadNotifications();
  }

  final _notificationService = getIt<NotificationStorageService>();

  Future<void> _loadNotifications() async {
    state = const AsyncValue.loading();
    try {
      // Use the notifications getter instead of getAllNotifications method
      final notifications = _notificationService.notifications;
      state = AsyncValue.data(notifications);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> refresh() async {
    await _notificationService.refresh();
    await _loadNotifications();
  }

  Future<void> markAsRead(String id) async {
    await _notificationService.markAsRead(id);
    await _loadNotifications();
  }

  Future<void> markAllAsRead() async {
    await _notificationService.markAllAsRead();
    await _loadNotifications();
  }

  Future<void> deleteNotification(String id) async {
    await _notificationService.deleteNotification(id);
    await _loadNotifications();
  }

  Future<void> clearAll() async {
    await _notificationService.clearAllNotifications();
    await _loadNotifications();
  }
}

/// Unread notification count provider
final unreadNotificationCountProvider = Provider<int>((ref) {
  final notificationsAsync = ref.watch(notificationsProvider);
  return notificationsAsync.when(
    data: (notifications) => notifications.where((n) => !n.isRead).length,
    loading: () => 0,
    error: (_, __) => 0,
  );
});

/// Unread notifications provider
final unreadNotificationsProvider = Provider<List<AppNotification>>((ref) {
  final notificationsAsync = ref.watch(notificationsProvider);
  return notificationsAsync.when(
    data: (notifications) => notifications.where((n) => !n.isRead).toList(),
    loading: () => [],
    error: (_, __) => [],
  );
});
