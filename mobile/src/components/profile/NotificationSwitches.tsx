import { setNotificationsEnabled, setNotificationTypeEnabled } from '@/lib/notifications/service';
import { useNotificationPrefs, type NotificationType } from '@/stores/notificationStore';

import { PinkSwitch } from '../PinkSwitch';
import { MenuItem } from './ProfileMenu';

// Reminder switches in Settings (from settings_screen.dart).

type ReminderRow = {
  icon: string;
  color: string;
  background: string;
  title: string;
  subtitle: string;
};

export const REMINDER_ROWS: Record<NotificationType, ReminderRow> = {
  self_check: {
    icon: 'favorite',
    color: '#E91E63',
    background: '#FCE4EC',
    title: 'Self-Check Reminders',
    subtitle: 'On the day your next self-check is due',
  },
  daily_checkin: {
    icon: 'spa',
    color: '#9C27B0',
    background: '#F3E5F5',
    title: 'Daily Check-in',
    subtitle: 'Every evening at 8 PM, when you use Journey',
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
