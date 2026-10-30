import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { userDisplayName, userProfilePictureUrl } from '@/api/auth';
import { Icon, Text } from '@/components/ui';
import { initials } from '@/lib/community';
import { useUser } from '@/stores/authStore';
import { radii, sizes } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

/** The signed-in person's photo or initials at the top right of every tab, opening Profile. */
export function ProfileButton() {
  const { palette } = useDesign();
  const user = useUser();
  const [pictureFailed, setPictureFailed] = useState(false);
  const pictureUrl = userProfilePictureUrl(user);
  const name = user ? userDisplayName(user) : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Profile and settings"
      onPress={() => router.push('/profile')}
      style={({ pressed }) => [
        styles.avatar,
        { backgroundColor: palette.raised },
        pressed && styles.pressed,
      ]}>
      {pictureUrl && !pictureFailed ? (
        <Image
          source={{ uri: pictureUrl }}
          style={styles.image}
          contentFit="cover"
          onError={() => setPictureFailed(true)}
        />
      ) : name ? (
        <Text variant="strong" tone="action">
          {initials(name)}
        </Text>
      ) : (
        <Icon name="user" tone="action" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.6 },
  avatar: {
    width: sizes.touch,
    height: sizes.touch,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
});
