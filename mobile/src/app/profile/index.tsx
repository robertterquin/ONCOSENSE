import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { userDisplayName } from '@/api/auth';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateViews';
import { useSignOut } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { brand } from '@/theme/colors';

// Placeholder until Phase 5 (profile_screen.dart). Keeps sign-out reachable.

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const signOut = useSignOut();

  return (
    <Screen header={<AppHeader title="Profile" subtitle="Your account" showBackButton />}>
      <Card>
        <AppText variant="titleMedium">
          {user ? userDisplayName(user) : 'Browsing as a guest'}
        </AppText>
        {user?.email ? <AppText secondary>{user.email}</AppText> : null}
        <Button
          title={isGuest ? 'Back to Welcome' : 'Logout'}
          outlined
          loading={signOut.isPending}
          onPress={() => signOut.mutate()}
        />
      </Card>
      <EmptyState
        icon="person"
        title="Profile is coming soon"
        message="Editing your profile, saved items and settings are being rebuilt in migration Phase 5."
      />
      {__DEV__ ? (
        <View style={styles.devLinks}>
          <Link href="/dev/components" style={styles.link}>
            Component gallery
          </Link>
          <Link href="/dev/data" style={styles.link}>
            Data check
          </Link>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  devLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  link: {
    color: brand.primaryPink,
    fontFamily: 'Poppins_600SemiBold',
  },
});
