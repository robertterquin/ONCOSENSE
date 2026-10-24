import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { userDisplayName, userProfilePictureUrl } from '@/api/auth';
import { LegalSheet, type LegalTitle } from '@/components/account/LegalSheet';
import { Button, ListRow, Screen, Section, Sheet, Text } from '@/components/ui';
import { APP_TAGLINE, APP_VERSION } from '@/constants/app';
import { useSignOut } from '@/hooks/useAuth';
import { useBookmarkedQuestions, useBookmarkedResources } from '@/hooks/useBookmarks';
import { useFocus } from '@/hooks/useFocus';
import { initials } from '@/lib/community';
import { confirm } from '@/lib/confirm';
import { FOCUS_OPTIONS } from '@/lib/focus';
import { REMINDERS_SUPPORTED } from '@/lib/notifications/service';
import { useAuthStore } from '@/stores/authStore';
import { NOTIFICATION_TYPES, useNotificationPrefs } from '@/stores/notificationStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// Profile (redesign Phase 6): who you are, what the app is set up for, and the way to
// Saved, reminders, Settings and the legal pages.

const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useSignOut();
  const focus = useFocus();
  const focusTitle = FOCUS_OPTIONS.find((option) => option.value === focus)?.title ?? null;
  const savedCount =
    (useBookmarkedQuestions().data?.length ?? 0) +
    (useBookmarkedResources().data?.length ?? 0) +
    useSelfCheckStore((state) => state.savedGuides.length);
  const prefs = useNotificationPrefs();
  const remindersOn = prefs.enabled
    ? NOTIFICATION_TYPES.filter((type) => prefs.types[type]).length
    : 0;
  const [legal, setLegal] = useState<LegalTitle | null>(null);
  const [about, setAbout] = useState(false);
  const name = user ? userDisplayName(user) : 'Guest';

  const logOut = async () => {
    const ok = await confirm({
      title: 'Log out?',
      message: 'Your check-ins and saved items stay in your account.',
      confirmText: 'Log out',
      cancelText: 'Stay',
    });
    if (ok) signOut.mutate();
  };

  return (
    <Screen back={{ label: 'Back', onPress: back }}>
      <View style={styles.header}>
        <Avatar name={user ? name : null} pictureUrl={userProfilePictureUrl(user)} />
        <View style={styles.flex}>
          <Text variant="title" accessibilityRole="header">
            {name}
          </Text>
          <Text variant="supporting" tone="muted">
            {user?.email ?? 'Looking around without an account'}
          </Text>
        </View>
      </View>
      {user ? (
        <Button
          title="Edit profile"
          variant="secondary"
          icon="user"
          onPress={() => router.push('/profile/edit')}
        />
      ) : (
        <Button title="Sign in or create an account" onPress={() => router.push('/welcome')} />
      )}

      <Section look="tinted" tint="raised">
        <ListRow
          icon="sliders"
          title={
            focusTitle
              ? `The app is set up for ${focusTitle.toLowerCase()}`
              : 'What brings you here?'
          }
          subtitle={focusTitle ? 'Change' : 'Choose what the app shows you'}
          onPress={() => router.push('/journey/focus')}
        />
      </Section>

      <Section>
        <ListRow
          icon="bookmark"
          title="Saved"
          trailing={savedCount ? `${savedCount}` : undefined}
          onPress={() => router.push('/profile/saved')}
        />
        <ListRow
          icon="bell"
          title="Reminders"
          trailing={REMINDERS_SUPPORTED ? (remindersOn ? `${remindersOn} on` : 'Off') : undefined}
          onPress={() => router.push('/profile/settings')}
        />
        <ListRow icon="sliders" title="Settings" onPress={() => router.push('/profile/settings')} />
      </Section>

      <Section>
        <ListRow icon="info" title="About OncoSense" onPress={() => setAbout(true)} />
        <ListRow
          icon="shield"
          title="Privacy and terms"
          onPress={() => setLegal('Privacy policy')}
        />
        <ListRow
          icon="circle-alert"
          title="Medical disclaimer"
          onPress={() => setLegal('Medical disclaimer')}
        />
      </Section>

      {user ? (
        <Button
          title="Log out"
          variant="destructive"
          icon="log-out"
          loading={signOut.isPending}
          onPress={logOut}
        />
      ) : null}
      <Text variant="caption" tone="muted" style={styles.version}>
        OncoSense {APP_VERSION}
      </Text>

      <LegalSheet open={legal} onClose={() => setLegal(null)} />
      <Sheet visible={about} onClose={() => setAbout(false)} title="About OncoSense">
        <Text variant="reading">
          OncoSense helps people in the Philippines learn the early signs of cancer, check
          themselves, keep track of treatment and find support. It shares general health
          information, not medical advice.
        </Text>
        <Text variant="supporting" tone="muted">
          {APP_TAGLINE} Version {APP_VERSION}.
        </Text>
        <ListRow icon="mail" title="Questions or feedback" subtitle="support@oncosense.app" />
        <Button
          title="Terms of service"
          variant="quiet"
          fullWidth={false}
          onPress={() => {
            setAbout(false);
            setTimeout(() => setLegal('Terms of service'), 350);
          }}
        />
        <Button
          title="Credits"
          variant="quiet"
          fullWidth={false}
          onPress={() => {
            setAbout(false);
            setTimeout(() => setLegal('Credits'), 350);
          }}
        />
      </Sheet>
    </Screen>
  );
}

function Avatar({ name, pictureUrl }: { name: string | null; pictureUrl: string | null }) {
  const { palette } = useDesign();
  const [failed, setFailed] = useState(false);
  return (
    <View style={[styles.avatar, { backgroundColor: palette.raised }]}>
      {pictureUrl && !failed ? (
        <Image
          source={{ uri: pictureUrl }}
          style={styles.fill}
          contentFit="cover"
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text variant="heading" tone="action">
          {name ? initials(name) : '?'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fill: { width: '100%', height: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  version: { textAlign: 'center' },
});
