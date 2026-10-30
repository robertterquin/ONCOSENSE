import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ReminderRow } from '@/components/account/ReminderSettings';
import {
  Banner,
  Button,
  ListRow,
  Screen,
  Section,
  SegmentedControl,
  Sheet,
  Switch,
  Text,
} from '@/components/ui';
import { useDeleteAccount } from '@/hooks/useAuth';
import { useFocus } from '@/hooks/useFocus';
import { usesJourney } from '@/lib/focus';
import { REMINDERS_SUPPORTED, setNotificationsEnabled } from '@/lib/notifications/service';
import { useIsSignedIn } from '@/stores/authStore';
import { useNotificationPrefs, type NotificationType } from '@/stores/notificationStore';
import { useThemeStore, type ThemeMode } from '@/stores/themeStore';
import type { TextSize } from '@/theme/type';
import { space } from '@/theme/tokens';

// Settings (redesign Phase 6): display, reminders with their times and account, in one place.

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

const DELETED = [
  'Your profile and photo',
  'Your check-ins, treatments, appointments and milestones',
  'Your questions, answers and saved items',
];

export default function SettingsScreen() {
  const signedIn = useIsSignedIn();
  const focus = useFocus();
  const { mode, setMode, textSize, setTextSize, highReadability, setHighReadability } =
    useThemeStore();
  const remindersOn = useNotificationPrefs((state) => state.enabled);
  const [deleting, setDeleting] = useState(false);
  const reminders: NotificationType[] = [
    'self_check',
    ...(signedIn && usesJourney(focus) ? (['daily_checkin', 'appointments'] as const) : []),
    'weekly_tip',
  ];

  return (
    <Screen back={{ label: 'Profile', onPress: back }} title="Settings">
      <Section title="Display">
        <View style={styles.display}>
          <View style={styles.group}>
            <Text variant="row">Theme</Text>
            <SegmentedControl<ThemeMode>
              accessibilityLabel="Theme"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'Phone' },
              ]}
            />
          </View>
          <View style={styles.group}>
            <Text variant="row">Text size</Text>
            <SegmentedControl<TextSize>
              accessibilityLabel="Text size"
              value={textSize}
              onChange={setTextSize}
              options={[
                { value: 'default', label: 'Default' },
                { value: 'large', label: 'Large' },
                { value: 'larger', label: 'Larger' },
              ]}
            />
          </View>
        </View>
        <ListRow
          title="Easier reading"
          subtitle="Stronger contrast, more spacing and bigger buttons"
          accessory={
            <Switch
              accessibilityLabel="Easier reading"
              value={highReadability}
              onValueChange={setHighReadability}
            />
          }
        />
      </Section>

      {REMINDERS_SUPPORTED ? (
        <Section title="Reminders" subtitle="Tap a reminder to change when it comes">
          <ListRow
            title="All reminders"
            subtitle={remindersOn ? 'On' : 'Off for everything'}
            accessory={
              <Switch
                accessibilityLabel="All reminders"
                value={remindersOn}
                onValueChange={(value) => void setNotificationsEnabled(value)}
              />
            }
          />
          {reminders.map((type) => (
            <ReminderRow key={type} type={type} />
          ))}
        </Section>
      ) : (
        <Banner tone="info" title="Reminders">
          Reminders work in the iPhone and Android apps.
        </Banner>
      )}

      <Section title="Account">
        {signedIn ? (
          <>
            <ListRow title="Change password" onPress={() => router.push('/profile/password')} />
            <ListRow
              icon="trash"
              iconTone="danger"
              title="Delete account"
              titleTone="danger"
              onPress={() => setDeleting(true)}
            />
          </>
        ) : (
          <ListRow title="Sign in or create an account" onPress={() => router.push('/welcome')} />
        )}
      </Section>

      <DeleteAccountSheet visible={deleting} onClose={() => setDeleting(false)} />
    </Screen>
  );
}

function DeleteAccountSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const remove = useDeleteAccount();
  return (
    <Sheet
      visible={visible}
      onClose={remove.isPending ? () => {} : onClose}
      title="Delete your account?">
      <Text variant="body">This permanently deletes:</Text>
      {DELETED.map((item) => (
        <Text key={item} variant="body">
          • {item}
        </Text>
      ))}
      <Banner tone="guard">This can&apos;t be undone. You&apos;ll be signed out.</Banner>
      <Button
        title={remove.isPending ? 'Deleting your account' : 'Delete my account'}
        variant="destructive"
        loading={remove.isPending}
        onPress={() => remove.mutate(undefined, { onSettled: onClose })}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  // More room between the two settings than between a label and its control.
  display: { gap: space.xl, paddingVertical: space.lg },
  group: { gap: space.sm },
});
