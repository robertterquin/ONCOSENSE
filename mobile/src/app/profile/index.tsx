import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { userDisplayName, userProfilePictureUrl } from '@/api/auth';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { InfoDialog } from '@/components/InfoDialog';
import { MaterialIcon } from '@/components/MaterialIcon';
import { MenuGroup, MenuHeading, MenuItem } from '@/components/profile/ProfileMenu';
import { Screen } from '@/components/Screen';
import { APP_TAGLINE, APP_VERSION } from '@/constants/app';
import { useSignOut } from '@/hooks/useAuth';
import { useBookmarkedQuestions, useBookmarkedResources } from '@/hooks/useBookmarks';
import { useFocus } from '@/hooks/useFocus';
import { confirm } from '@/lib/confirm';
import { FOCUS_OPTIONS } from '@/lib/focus';
import { useAuthStore } from '@/stores/authStore';
import { brand, gradients } from '@/theme/colors';
import { radius } from '@/theme/tokens';

// Port of lib/screens/profile/profile_screen.dart

const RED = '#F44336';

function countLabel(count: number, noun: string, empty: string) {
  return count > 0 ? `${count} saved ${noun}${count !== 1 ? 's' : ''}` : empty;
}

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useSignOut();
  const questions = useBookmarkedQuestions().data?.length ?? 0;
  const resources = useBookmarkedResources().data?.length ?? 0;
  const [dialog, setDialog] = useState<'help' | 'about' | null>(null);
  const focus = useFocus();
  const focusTitle = FOCUS_OPTIONS.find((option) => option.value === focus)?.title ?? null;

  const logout = async () => {
    if (!user) {
      signOut.mutate();
      return;
    }
    const ok = await confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      destructive: true,
    });
    if (ok) signOut.mutate();
  };

  return (
    <Screen
      header={
        <AppHeader title="Profile" subtitle="Manage your account and preferences" showBackButton />
      }>
      <ProfileHeader
        name={user ? userDisplayName(user) : 'Guest'}
        email={user?.email ?? 'guest@oncosense.app'}
        pictureUrl={userProfilePictureUrl(user)}
        isGuest={!user}
      />

      <MenuHeading>Your Content</MenuHeading>
      <MenuGroup>
        {user ? (
          <MenuItem
            icon="edit"
            iconColor={brand.headerPink}
            iconBackground={brand.lightPink}
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => router.push('/profile/edit')}
          />
        ) : null}
        <MenuItem
          icon="bookmark"
          iconColor="#E91E63"
          iconBackground={brand.lightPink}
          title="Saved"
          subtitle={countLabel(
            questions + resources,
            'item',
            'Questions and help contacts you saved',
          )}
          badge={questions + resources}
          onPress={() => router.push('/profile/saved')}
        />
      </MenuGroup>

      <MenuHeading>Preferences</MenuHeading>
      <MenuGroup>
        <MenuItem
          icon="explore"
          iconColor="#5236B5"
          iconBackground="#ECE7F8"
          title="What brings you here"
          subtitle={focusTitle ? `${focusTitle} · Change` : 'Choose what the app shows you'}
          onPress={() => router.push('/journey/focus')}
        />
        <MenuItem
          icon="settings"
          iconColor="#2196F3"
          iconBackground="#E3F2FD"
          title="Settings"
          subtitle="App preferences and privacy"
          onPress={() => router.push('/profile/settings')}
        />
        {user ? (
          <MenuItem
            icon="lock"
            iconColor="#FF7043"
            iconBackground="#FFE0B2"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => router.push('/profile/password')}
          />
        ) : null}
        <MenuItem
          icon="help"
          iconColor="#4CAF50"
          iconBackground="#E8F5E9"
          title="Help & Support"
          subtitle="Get help and contact us"
          onPress={() => setDialog('help')}
        />
        <MenuItem
          icon="info"
          iconColor="#607D8B"
          iconBackground="#ECEFF1"
          title="About"
          subtitle="App version and information"
          onPress={() => setDialog('about')}
        />
      </MenuGroup>

      <MenuGroup>
        <MenuItem
          icon={user ? 'logout' : 'login'}
          iconColor={user ? RED : brand.headerPink}
          iconBackground={user ? '#FFEBEE' : brand.lightPink}
          titleColor={user ? RED : brand.headerPink}
          title={user ? 'Log Out' : 'Sign In'}
          subtitle={user ? 'Sign out of your account' : 'Save your journey, bookmarks and posts'}
          onPress={logout}
        />
      </MenuGroup>

      <InfoDialog
        visible={dialog === 'help'}
        onClose={() => setDialog(null)}
        title="Help & Support"
        icon="help"
        iconColor="#4CAF50"
        iconBackground="#E8F5E9">
        <AppText variant="titleMedium">Need assistance?</AppText>
        <AppText secondary>For questions, feedback, or support, please contact us:</AppText>
        <ContactItem icon="email" text="support@oncosense.app" />
        <ContactItem icon="phone" text="+63 123 456 7890" />
        <AppText variant="bodySmall" secondary>
          You can also visit our FAQ section for common questions.
        </AppText>
      </InfoDialog>

      <InfoDialog
        visible={dialog === 'about'}
        onClose={() => setDialog(null)}
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
        <AppText variant="bodySmall" secondary>
          © 2024 OncoSense Team. All rights reserved.
        </AppText>
      </InfoDialog>
    </Screen>
  );
}

function ContactItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.contact}>
      <MaterialIcon name={icon} size={18} color="#4CAF50" />
      <AppText variant="label">{text}</AppText>
    </View>
  );
}

function ProfileHeader({
  name,
  email,
  pictureUrl,
  isGuest,
}: {
  name: string;
  email: string;
  pictureUrl: string | null;
  isGuest: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <LinearGradient
      colors={gradients.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.profileCard}>
      <View style={styles.avatar}>
        {pictureUrl && !failed ? (
          <Image
            source={{ uri: pictureUrl }}
            style={styles.avatarImage}
            contentFit="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <AppText variant="headlineMedium" color={brand.headerPink} style={styles.bold}>
            {(name[0] ?? 'U').toUpperCase()}
          </AppText>
        )}
      </View>
      <View style={styles.profileText}>
        <AppText variant="titleLarge" color={brand.white} numberOfLines={1} style={styles.bold}>
          {name}
        </AppText>
        <AppText variant="bodySmall" color="rgba(255,255,255,0.9)" numberOfLines={1}>
          {email}
        </AppText>
        {!isGuest ? (
          <View style={styles.memberBadge}>
            <MaterialIcon name="verified" size={14} color={brand.white} />
            <AppText style={styles.memberText}>Active Member</AppText>
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: 'Poppins_700Bold' },
  italic: { fontStyle: 'italic' },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: radius.large,
    shadowColor: brand.headerPink,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  profileText: { flex: 1, gap: 4 },
  memberBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  memberText: { fontSize: 11, color: brand.white, fontFamily: 'Poppins_600SemiBold' },
});
