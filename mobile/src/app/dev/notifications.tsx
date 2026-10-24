import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { hasPermission, scheduledSummary } from '@/lib/notifications/device';
import { sendTestNotification } from '@/lib/notifications/service';
import { useNotificationPrefs } from '@/stores/notificationStore';

/**
 * Development-only screen listing the reminders scheduled on this device, for the
 * Phase 6 device check (14 pending with every type on). Open /dev/notifications.
 */
export default function NotificationCheckScreen() {
  const prefs = useNotificationPrefs();
  const query = useQuery({
    queryKey: ['dev', 'scheduled-notifications'],
    queryFn: async () => ({
      permission: await hasPermission(),
      reminders: await scheduledSummary(),
    }),
    // Always re-read the device; a cached list would hide changes made in Settings.
    gcTime: 0,
  });

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <Screen
      header={
        <AppHeader title="Scheduled reminders" subtitle="Development check" showBackButton />
      }>
      <Card>
        <AppText variant="label">
          Permission: {query.data ? (query.data.permission ? 'granted' : 'not granted') : '…'}
        </AppText>
        <AppText>
          Master switch: {prefs.enabled ? 'on' : 'off'} · setup complete:{' '}
          {prefs.setupComplete ? 'yes' : 'no'}
        </AppText>
        <AppText variant="label">Pending: {query.data?.reminders.length ?? '…'}</AppText>
      </Card>
      <Button title="Refresh" outlined onPress={() => query.refetch()} />
      <Button title="Send test notification" outlined onPress={sendTestNotification} />
      <View style={styles.list}>
        {query.data?.reminders.map((reminder) => (
          <Card key={reminder.identifier}>
            <AppText variant="label">{reminder.identifier}</AppText>
            <AppText variant="bodySmall" secondary>
              {reminder.trigger}
            </AppText>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
});
