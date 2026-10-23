import { AppHeader } from '@/components/AppHeader';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateViews';

// Placeholder until Phase 6 (profile/notifications_screen.dart). The on/off switches
// are already in Settings.

export default function NotificationSettingsScreen() {
  return (
    <Screen
      header={
        <AppHeader title="Notifications" subtitle="Manage your notifications" showBackButton />
      }>
      <EmptyState
        icon="notifications"
        title="Notification settings are coming soon"
        message="Reminder scheduling is being rebuilt in migration Phase 6. You can already turn reminders on or off in Settings."
      />
    </Screen>
  );
}
