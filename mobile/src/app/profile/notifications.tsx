import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { MaterialIcon } from '@/components/MaterialIcon';
import {
  MasterSwitchItem,
  ReminderSwitchItem,
  sendTestNotificationWithToast,
} from '@/components/profile/NotificationSwitches';
import { MenuGroup, MenuHeading } from '@/components/profile/ProfileMenu';
import { Screen } from '@/components/Screen';
import { REMINDERS_SUPPORTED } from '@/lib/notifications/service';
import { brand } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';

// Port of lib/screens/profile/notifications_screen.dart.

// Flutter used #2196F3; white text on it is only 3.1:1, so a darker blue (4.6:1).
const BLUE = '#1976D2';

export default function NotificationSettingsScreen() {
  const { isDark } = useTheme();
  return (
    <Screen
      header={
        <AppHeader title="Notifications" subtitle="Manage your app notifications" showBackButton />
      }>
      <View
        style={[
          styles.banner,
          { backgroundColor: isDark ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.08)' },
        ]}>
        <MaterialIcon name="info_outline" size={24} color={BLUE} />
        <AppText style={styles.bannerText} color={isDark ? '#90CAF9' : '#1565C0'}>
          {REMINDERS_SUPPORTED
            ? 'Notifications work even when the app is closed. Manage your preferences below.'
            : 'Reminders are sent by the OncoSense app on iPhone and Android. Your preferences are saved here.'}
        </AppText>
      </View>

      <MenuHeading>General</MenuHeading>
      <MenuGroup>
        <MasterSwitchItem />
      </MenuGroup>

      <MenuHeading>Health & Prevention</MenuHeading>
      <MenuGroup>
        <ReminderSwitchItem type="health_tips" />
        <ReminderSwitchItem type="hydration" />
        <ReminderSwitchItem type="movement" />
        <ReminderSwitchItem type="sun_protection" />
      </MenuGroup>

      <MenuHeading>Self-Check & Screening</MenuHeading>
      <MenuGroup>
        <ReminderSwitchItem type="self_check" />
      </MenuGroup>

      <MenuHeading>Community & Wellness</MenuHeading>
      <MenuGroup>
        <ReminderSwitchItem type="weekly_checkin" />
        <ReminderSwitchItem type="forum" />
      </MenuGroup>

      <Pressable
        accessibilityRole="button"
        onPress={sendTestNotificationWithToast}
        style={({ pressed }) => [styles.testButton, pressed && styles.pressed]}>
        <MaterialIcon name="science" size={22} color={brand.white} />
        <AppText variant="button" color={brand.white}>
          Send Test Notification
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(33,150,243,0.3)',
  },
  bannerText: { flex: 1, lineHeight: 20 },
  testButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: BLUE,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pressed: { opacity: 0.8 },
});
