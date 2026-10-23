import {
  sendTestNotification,
  setNotificationsEnabled,
  setNotificationTypeEnabled,
} from '@/lib/notifications/service';
import { useNotificationPrefs, type NotificationType } from '@/stores/notificationStore';
import { showToast } from '@/stores/toastStore';

import { PinkSwitch } from '../PinkSwitch';
import { MenuItem } from './ProfileMenu';

// Notification switches shared by Settings (settings_screen.dart) and the
// Notifications screen (profile/notifications_screen.dart).

type ReminderRow = {
  icon: string;
  color: string;
  background: string;
  title: string;
  subtitle: string;
};

export const REMINDER_ROWS: Record<NotificationType, ReminderRow> = {
  health_tips: {
    icon: 'lightbulb',
    color: '#FF9800',
    background: '#FFF3E0',
    title: 'Daily Health Tips',
    subtitle: 'Get daily cancer prevention tips at 9 AM',
  },
  hydration: {
    icon: 'water_drop',
    color: '#2196F3',
    background: '#E3F2FD',
    title: 'Hydration Reminders',
    subtitle: 'Stay hydrated throughout the day',
  },
  movement: {
    icon: 'directions_walk',
    color: '#4CAF50',
    background: '#E8F5E9',
    title: 'Movement Reminders',
    subtitle: 'Get reminders to stay active',
  },
  sun_protection: {
    icon: 'wb_sunny',
    color: '#FFC107',
    background: '#FFF8E1',
    title: 'Sun Protection',
    subtitle: 'Daily reminder at 10 AM',
  },
  self_check: {
    icon: 'favorite',
    color: '#E91E63',
    background: '#FCE4EC',
    title: 'Self-Check Reminders',
    subtitle: 'Monthly breast self-exam reminder',
  },
  weekly_checkin: {
    icon: 'spa',
    color: '#9C27B0',
    background: '#F3E5F5',
    title: 'Weekly Wellness Check',
    subtitle: 'Sunday morning wellness reminder',
  },
  forum: {
    icon: 'forum',
    color: '#D81B60',
    background: '#FCE4EC',
    title: 'Forum Notifications',
    subtitle: 'Replies and upvotes on your posts',
  },
};

/** "Push Notifications": the master switch. */
export function MasterSwitchItem() {
  const enabled = useNotificationPrefs((state) => state.enabled);
  return (
    <MenuItem
      icon="notifications"
      iconColor="#2196F3"
      iconBackground="#E3F2FD"
      title="Push Notifications"
      subtitle="Master switch for all notifications"
      right={
        <PinkSwitch
          accessibilityLabel="Push Notifications"
          value={enabled}
          onValueChange={setNotificationsEnabled}
        />
      }
    />
  );
}

export function ReminderSwitchItem({ type }: { type: NotificationType }) {
  const enabled = useNotificationPrefs((state) => state.types[type]);
  const row = REMINDER_ROWS[type];
  return (
    <MenuItem
      icon={row.icon}
      iconColor={row.color}
      iconBackground={row.background}
      title={row.title}
      subtitle={row.subtitle}
      right={
        <PinkSwitch
          accessibilityLabel={row.title}
          value={enabled}
          onValueChange={(value) => setNotificationTypeEnabled(type, value)}
        />
      }
    />
  );
}

export async function sendTestNotificationWithToast(): Promise<void> {
  await sendTestNotification();
  showToast('🧪 Test notification sent!', 'success');
}

/** Settings' "Test Notification" row. */
export function TestNotificationItem() {
  return (
    <MenuItem
      icon="science"
      iconColor="#607D8B"
      iconBackground="#ECEFF1"
      title="Test Notification"
      subtitle="Send a test notification"
      onPress={sendTestNotificationWithToast}
    />
  );
}
