import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { InfoDialog } from '@/components/InfoDialog';
import { MaterialIcon } from '@/components/MaterialIcon';
import { PinkSwitch } from '@/components/PinkSwitch';
import { MenuGroup, MenuHeading, MenuItem } from '@/components/profile/ProfileMenu';
import { Screen } from '@/components/Screen';
import { APP_TAGLINE, APP_VERSION } from '@/constants/app';
import { CREDITS, MEDICAL_DISCLAIMER, PRIVACY_POLICY, TERMS_OF_SERVICE } from '@/constants/legal';
import { useDeleteAccount } from '@/hooks/useAuth';
import { useIsSignedIn } from '@/stores/authStore';
import { useNotificationPrefs, type NotificationType } from '@/stores/notificationStore';
import { useThemeStore } from '@/stores/themeStore';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

// Port of lib/screens/profile/settings_screen.dart. The notification switches are
// saved now; Phase 6 schedules reminders from them and adds "Test Notification".

const REMINDER_ROWS: {
  type: NotificationType;
  icon: string;
  color: string;
  background: string;
  title: string;
  subtitle: string;
}[] = [
  {
    type: 'health_tips',
    icon: 'lightbulb',
    color: '#FF9800',
    background: '#FFF3E0',
    title: 'Daily Health Tips',
    subtitle: 'Get daily cancer prevention tips at 9 AM',
  },
  {
    type: 'hydration',
    icon: 'water_drop',
    color: '#2196F3',
    background: '#E3F2FD',
    title: 'Hydration Reminders',
    subtitle: 'Stay hydrated throughout the day',
  },
  {
    type: 'movement',
    icon: 'directions_walk',
    color: '#4CAF50',
    background: '#E8F5E9',
    title: 'Movement Reminders',
    subtitle: 'Get reminders to stay active',
  },
  {
    type: 'sun_protection',
    icon: 'wb_sunny',
    color: '#FFC107',
    background: '#FFF8E1',
    title: 'Sun Protection',
    subtitle: 'Daily reminder at 10 AM',
  },
  {
    type: 'self_check',
    icon: 'favorite',
    color: '#E91E63',
    background: '#FCE4EC',
    title: 'Self-Check Reminders',
    subtitle: 'Monthly breast self-exam reminder',
  },
  {
    type: 'weekly_checkin',
    icon: 'spa',
    color: '#9C27B0',
    background: '#F3E5F5',
    title: 'Weekly Wellness Check',
    subtitle: 'Sunday morning wellness reminder',
  },
  {
    type: 'forum',
    icon: 'forum',
    color: '#D81B60',
    background: '#FCE4EC',
    title: 'Forum Notifications',
    subtitle: 'Replies and upvotes on your posts',
  },
];

const LEGAL = {
  'Medical Disclaimer': MEDICAL_DISCLAIMER,
  'Terms of Service': TERMS_OF_SERVICE,
  'Privacy Policy': PRIVACY_POLICY,
  'Credits & Attributions': CREDITS,
} as const;

type LegalTitle = keyof typeof LEGAL;

export default function SettingsScreen() {
  const signedIn = useIsSignedIn();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const setDarkMode = useThemeStore((state) => state.setDarkMode);
  const prefs = useNotificationPrefs();
  const [legal, setLegal] = useState<LegalTitle | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <Screen
      header={<AppHeader title="Settings" subtitle="App preferences and privacy" showBackButton />}>
      <MenuHeading>Notifications</MenuHeading>
      <MenuGroup>
        <MenuItem
          icon="notifications"
          iconColor="#2196F3"
          iconBackground="#E3F2FD"
          title="Push Notifications"
          subtitle="Master switch for all notifications"
          right={
            <PinkSwitch
              accessibilityLabel="Push Notifications"
              value={prefs.enabled}
              onValueChange={prefs.setEnabled}
            />
          }
        />
        {REMINDER_ROWS.map((row) => (
          <MenuItem
            key={row.type}
            icon={row.icon}
            iconColor={row.color}
            iconBackground={row.background}
            title={row.title}
            subtitle={row.subtitle}
            right={
              <PinkSwitch
                accessibilityLabel={row.title}
                value={prefs.types[row.type]}
                onValueChange={(value) => prefs.setType(row.type, value)}
              />
            }
          />
        ))}
      </MenuGroup>

      <MenuHeading>Appearance</MenuHeading>
      <MenuGroup>
        <MenuItem
          icon="dark_mode"
          iconColor="#5C6BC0"
          iconBackground="#E8EAF6"
          title="Dark Mode"
          subtitle="Switch to dark theme"
          right={
            <PinkSwitch
              accessibilityLabel="Dark Mode"
              value={isDarkMode}
              onValueChange={setDarkMode}
            />
          }
        />
      </MenuGroup>

      <MenuHeading>Legal</MenuHeading>
      <MenuGroup>
        <MenuItem
          icon="health_and_safety"
          iconColor="#E53935"
          iconBackground="#FFEBEE"
          title="Medical Disclaimer"
          subtitle="Important health information"
          onPress={() => setLegal('Medical Disclaimer')}
        />
        <MenuItem
          icon="description"
          iconColor="#607D8B"
          iconBackground="#ECEFF1"
          title="Terms of Service"
          subtitle="Read our terms and conditions"
          onPress={() => setLegal('Terms of Service')}
        />
        <MenuItem
          icon="privacy_tip"
          iconColor="#9C27B0"
          iconBackground="#F3E5F5"
          title="Privacy Policy"
          subtitle="How we handle your data"
          onPress={() => setLegal('Privacy Policy')}
        />
      </MenuGroup>

      {signedIn ? (
        <>
          <MenuHeading>Account</MenuHeading>
          <MenuGroup>
            <MenuItem
              icon="delete_forever"
              iconColor="#E53935"
              iconBackground="#FFEBEE"
              title="Delete Account"
              subtitle="Permanently delete your account"
              onPress={() => setConfirmingDelete(true)}
            />
          </MenuGroup>
        </>
      ) : null}

      <MenuHeading>About</MenuHeading>
      <MenuGroup>
        <MenuItem
          icon="info"
          iconColor="#D81B60"
          iconBackground="#FCE4EC"
          title="About OncoSense"
          subtitle={`Version ${APP_VERSION}`}
          onPress={() => setShowAbout(true)}
        />
        <MenuItem
          icon="workspace_premium"
          iconColor="#4CAF50"
          iconBackground="#E8F5E9"
          title="Credits & Attributions"
          subtitle="Third-party services & licenses"
          onPress={() => setLegal('Credits & Attributions')}
        />
        <MenuItem
          icon="star"
          iconColor="#FFC107"
          iconBackground="#FFF8E1"
          title="Rate the App"
          subtitle="Share your feedback"
          onPress={() => showToast('App store rating will be available soon')}
        />
        <MenuItem
          icon="share"
          iconColor="#00BCD4"
          iconBackground="#E0F7FA"
          title="Share App"
          subtitle="Spread cancer awareness"
          onPress={() => showToast('Sharing will be available soon')}
        />
      </MenuGroup>

      <LegalSheet title={legal} onClose={() => setLegal(null)} />
      <InfoDialog
        visible={showAbout}
        onClose={() => setShowAbout(false)}
        title="OncoSense"
        icon="favorite"
        iconColor={brand.white}
        iconBackground={brand.headerPink}>
        <AppText variant="label" secondary>
          Version {APP_VERSION}
        </AppText>
        <AppText>
          OncoSense is a cancer awareness and education app designed to provide reliable information
          about cancer types, prevention strategies, and support resources.
        </AppText>
        <AppText color={brand.headerPink} style={styles.italic}>
          {APP_TAGLINE}
        </AppText>
      </InfoDialog>
      <DeleteAccountDialog visible={confirmingDelete} onClose={() => setConfirmingDelete(false)} />
    </Screen>
  );
}

function LegalSheet({ title, onClose }: { title: LegalTitle | null; onClose: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={title !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <View
          style={[styles.sheet, { backgroundColor: colors.surface, marginTop: insets.top + 40 }]}>
          <View style={styles.sheetHeader}>
            <AppText variant="titleLarge" style={styles.flex}>
              {title}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              onPress={onClose}>
              <MaterialIcon name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={[styles.sheetBody, { paddingBottom: 24 + insets.bottom }]}>
            <AppText style={styles.legalText}>{title ? LEGAL[title] : ''}</AppText>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const DELETE_ITEMS = [
  'Your profile and personal information',
  'All saved articles and bookmarks',
  'Your forum posts and comments',
  'Cancer journey tracking data',
  'Health reminders and preferences',
];

function DeleteAccountDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const remove = useDeleteAccount();
  const busy = remove.isPending;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={busy ? undefined : onClose}>
      <View style={styles.dialogBackdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <View style={styles.dialogTitle}>
            <View style={styles.warningIcon}>
              <MaterialIcon name="warning" size={24} color="#E53935" />
            </View>
            <AppText variant="titleLarge">Delete Account</AppText>
          </View>
          <AppText variant="titleMedium">Are you sure you want to delete your account?</AppText>
          <AppText secondary>This will permanently delete:</AppText>
          {DELETE_ITEMS.map((item) => (
            <AppText key={item}>• {item}</AppText>
          ))}
          <View style={styles.note}>
            <MaterialIcon name="info_outline" size={20} color="#E53935" />
            <AppText variant="bodySmall" color="#C62828" style={styles.flex}>
              This cannot be undone. You will be signed out.
            </AppText>
          </View>
          <View style={styles.dialogActions}>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={onClose}
              style={styles.dialogButton}>
              <AppText variant="label" secondary>
                Cancel
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => remove.mutate(undefined, { onSettled: onClose })}
              style={[styles.dialogButton, styles.deleteButton, busy && styles.dimmed]}>
              <AppText variant="label" color={brand.white}>
                {busy ? 'Deleting your account...' : 'Delete Account'}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  italic: { fontStyle: 'italic' },
  dimmed: { opacity: 0.6 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20 },
  sheetBody: { paddingHorizontal: 20 },
  legalText: { lineHeight: 22 },
  dialogBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialog: { width: '100%', maxWidth: 440, borderRadius: radius.large, padding: 24, gap: 8 },
  dialogTitle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  warningIcon: { padding: 8, borderRadius: 10, backgroundColor: '#FFEBEE' },
  note: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: radius.medium,
    backgroundColor: '#FFEBEE',
    marginTop: 8,
  },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
  dialogButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.small },
  deleteButton: { backgroundColor: '#E53935' },
});
