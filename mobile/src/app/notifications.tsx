import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { withAlpha } from '@/components/home/HealthReminderCard';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import { confirm } from '@/lib/confirm';
import { useNotificationHistory } from '@/stores/notificationHistoryStore';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';
import {
  appNotificationColor,
  appNotificationIcon,
  appNotificationTimeAgo,
  type AppNotification,
} from '@/types/appNotification';

// Port of lib/screens/notifications/notification_center_screen.dart.

export default function NotificationCenterScreen() {
  const notifications = useNotificationHistory((state) => state.notifications);
  const markAllAsRead = useNotificationHistory((state) => state.markAllAsRead);
  const clearAll = useNotificationHistory((state) => state.clearAll);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const onMarkAllAsRead = () => {
    markAllAsRead();
    showToast('All notifications marked as read');
  };

  const onClearAll = async () => {
    const confirmed = await confirm({
      title: 'Clear All Notifications',
      message: 'Are you sure you want to delete all notifications? This cannot be undone.',
      confirmText: 'Clear All',
      destructive: true,
    });
    if (confirmed) clearAll();
  };

  return (
    <Screen
      header={
        <AppHeader
          title="Notifications"
          subtitle={
            unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'
          }
          showBackButton
          right={
            notifications.length > 0 ? (
              <View style={styles.headerActions}>
                {unreadCount > 0 ? (
                  <HeaderButton
                    icon="done_all"
                    label="Mark all as read"
                    onPress={onMarkAllAsRead}
                  />
                ) : null}
                <HeaderButton icon="delete_sweep" label="Clear all" onPress={onClearAll} />
              </View>
            ) : undefined
          }
        />
      }
      scroll={notifications.length > 0}>
      {notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <View style={styles.list}>
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function HeaderButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <MaterialIcon name={icon} size={24} color={brand.white} />
    </Pressable>
  );
}

function EmptyNotifications() {
  const { isDark, colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F5F5F5' },
        ]}>
        <MaterialIcon
          name="notifications_off"
          size={48}
          color={isDark ? 'rgba(255,255,255,0.38)' : '#BDBDBD'}
        />
      </View>
      <AppText variant="titleMedium" style={styles.emptyTitle} color={colors.text}>
        No notifications yet
      </AppText>
      <AppText style={styles.centered} color={isDark ? 'rgba(255,255,255,0.54)' : '#757575'}>
        {'Your health reminders and updates\nwill appear here'}
      </AppText>
    </View>
  );
}

function NotificationCard({ notification }: { notification: AppNotification }) {
  const { isDark, colors } = useTheme();
  const markAsRead = useNotificationHistory((state) => state.markAsRead);
  const remove = useNotificationHistory((state) => state.remove);
  const color = appNotificationColor(notification);
  const unread = !notification.isRead;

  const onDelete = () => {
    remove(notification.id);
    showToast('Notification deleted');
  };

  // The delete button sits beside the tappable area: nested buttons break on the web.
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowOpacity: isDark ? 0.2 : 0.06 },
        unread && { borderColor: withAlpha(color, 0.3), borderWidth: 1.5 },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${unread ? 'Unread: ' : ''}${notification.title}. ${notification.body}`}
        accessibilityHint={unread ? 'Marks it as read' : undefined}
        onPress={() => (unread ? markAsRead(notification.id) : undefined)}
        style={styles.cardMain}>
        <View style={styles.iconWrap}>
          <View style={[styles.icon, { backgroundColor: withAlpha(color, 0.15) }]}>
            <MaterialIcon name={appNotificationIcon(notification)} size={22} color={color} />
          </View>
          {unread ? (
            <View style={[styles.dot, { backgroundColor: color, borderColor: colors.card }]} />
          ) : null}
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <AppText
              numberOfLines={1}
              variant={unread ? 'label' : 'bodyMedium'}
              style={styles.title}>
              {notification.title}
            </AppText>
            <AppText
              variant="bodySmall"
              style={styles.time}
              color={isDark ? 'rgba(255,255,255,0.54)' : '#9E9E9E'}>
              {appNotificationTimeAgo(notification)}
            </AppText>
          </View>
          <AppText
            numberOfLines={2}
            style={styles.body}
            color={isDark ? 'rgba(255,255,255,0.7)' : '#616161'}>
            {notification.body}
          </AppText>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete notification: ${notification.title}`}
        onPress={onDelete}
        hitSlop={6}
        style={({ pressed }) => [styles.delete, pressed && styles.pressed]}>
        <MaterialIcon
          name="close"
          size={18}
          color={isDark ? 'rgba(255,255,255,0.38)' : '#BDBDBD'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: -8 },
  headerButton: { padding: 8, borderRadius: 20 },
  pressed: { opacity: 0.6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 18 },
  centered: { textAlign: 'center' },
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: { padding: 16, paddingRight: 12 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute',
    top: 14,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  content: { flex: 1, paddingVertical: 14, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 15 },
  time: { fontSize: 11 },
  body: { fontSize: 13, lineHeight: 17 },
  delete: { marginTop: 8, marginRight: 8, padding: 7, borderRadius: 16 },
});
