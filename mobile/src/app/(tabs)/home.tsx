import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { userDisplayName } from '@/api/auth';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ComingSoon } from '@/components/ComingSoon';
import { useSignOut } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { brand } from '@/theme/colors';

// Placeholder until Phase 4. The account card and dev links are temporary; sign-out
// moves to the Profile screen in Phase 5.

export default function HomeTab() {
  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const signOut = useSignOut();

  return (
    <ComingSoon title="OncoSense" subtitle="Empowering Awareness" phase={4} icon="home">
      <Card>
        <AppText variant="titleMedium">
          {user ? `Signed in as ${userDisplayName(user)}` : 'Browsing as a guest'}
        </AppText>
        {user?.email ? <AppText secondary>{user.email}</AppText> : null}
        <Button
          title={isGuest ? 'Back to Welcome' : 'Sign out'}
          outlined
          loading={signOut.isPending}
          onPress={() => signOut.mutate()}
        />
      </Card>
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
    </ComingSoon>
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
