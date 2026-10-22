import { AppHeader } from '@/components/AppHeader';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateViews';

// Placeholder until Phase 6 (notification_center_screen.dart).

export default function NotificationCenterScreen() {
  return (
    <Screen
      header={
        <AppHeader title="Notifications" subtitle="Your reminders and updates" showBackButton />
      }>
      <EmptyState
        icon="notifications_none"
        title="Notification center is coming soon"
        message="Reminders and their history are being rebuilt in migration Phase 6."
      />
    </Screen>
  );
}
