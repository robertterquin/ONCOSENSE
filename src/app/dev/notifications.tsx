import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Section, Text } from '@/components/ui';
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
    <Screen back={{ label: 'Back' }} title="Scheduled reminders" subtitle="Development check">
      <Section look="tinted" tint="raised">
        <Text variant="row">
          Permission: {query.data ? (query.data.permission ? 'granted' : 'not granted') : '…'}
        </Text>
        <Text>
          Master switch: {prefs.enabled ? 'on' : 'off'} · setup complete:{' '}
          {prefs.setupComplete ? 'yes' : 'no'}
        </Text>
        <Text variant="row">Pending: {query.data?.reminders.length ?? '…'}</Text>
      </Section>
      <Button title="Refresh" variant="secondary" onPress={() => query.refetch()} />
      <Button title="Send test notification" variant="secondary" onPress={sendTestNotification} />
      <View style={styles.list}>
        {query.data?.reminders.map((reminder) => (
          <Section key={reminder.identifier} look="tinted" tint="raised">
            <Text variant="row">{reminder.identifier}</Text>
            <Text variant="supporting" tone="muted">
              {reminder.trigger}
            </Text>
          </Section>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
});
