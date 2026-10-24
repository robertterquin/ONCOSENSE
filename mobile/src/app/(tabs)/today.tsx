import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { userDisplayName, userProfilePictureUrl } from '@/api/auth';
import { AppHeader } from '@/components/AppHeader';
import { AwarenessBanner, DailyTipCard } from '@/components/home/TipAndAwareness';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import { useDailyHealthTip } from '@/hooks/useHome';
import { useUser } from '@/stores/authStore';
import { brand } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';

// The Today tab, from lib/screens/home/home_screen.dart. The news, stories and
// wellness cards were removed in redesign Phase 1; Phase 3 builds the new Today
// (next step, check-in, coming up, tip, help).

export default function TodayTab() {
  const user = useUser();
  const tip = useDailyHealthTip();

  return (
    <Screen
      inTabs
      background="surface"
      header={
        <AppHeader
          title={`Hello, ${userDisplayName(user)} 👋`}
          subtitle="Your wellness journey starts here"
          titleSize={18}
          right={<ProfileButton pictureUrl={userProfilePictureUrl(user)} />}
        />
      }>
      <DailyTipCard tip={tip} />
      <AwarenessBanner />
    </Screen>
  );
}

function ProfileButton({ pictureUrl }: { pictureUrl: string | null }) {
  const [pictureFailed, setPictureFailed] = useState(false);
  const { isDark } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Profile"
      onPress={() => router.push('/profile')}
      style={[styles.avatar, isDark && styles.avatarDark]}>
      {pictureUrl && !pictureFailed ? (
        <Image
          source={{ uri: pictureUrl }}
          style={styles.avatarImage}
          contentFit="cover"
          onError={() => setPictureFailed(true)}
        />
      ) : (
        <MaterialIcon name="person" size={24} color={brand.headerPink} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarDark: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
