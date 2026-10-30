import { Image } from 'expo-image';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { APP_NAME } from '@/constants/app';
import { continueAsGuest } from '@/hooks/useAuth';
import { space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// Welcome (redesign Phase 6): the night-violet panel with the satin ribbon logo (the
// splash image, so the first two screens match), in light and dark alike.

const LOGO = require('../../../assets/images/splash.png');

export default function WelcomeScreen() {
  const { palette } = useDesign();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  return (
    <View style={[styles.root, { backgroundColor: palette.panel }]}>
      {/* Only while shown: Welcome stays mounted under Sign in and Create account. */}
      {focused ? <StatusBar style="light" /> : null}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.xxxl, paddingBottom: insets.bottom + space.xl },
        ]}>
        <View style={styles.hero}>
          <Image source={LOGO} style={styles.logo} contentFit="contain" accessible={false} />
          <Text variant="display" tone="onPanel" accessibilityRole="header" style={styles.center}>
            {APP_NAME}
          </Text>
          <Text variant="reading" tone="onPanelMuted" style={styles.center}>
            Know the early signs, check yourself, and keep track of treatment, in one calm place.
          </Text>
        </View>
        <View style={styles.actions}>
          <Button
            title="Create an account"
            variant="onPanel"
            onPress={() => router.push('/register')}
          />
          <Button title="Sign in" variant="onPanelOutline" onPress={() => router.push('/login')} />
          <Button
            title="Look around without an account"
            variant="onPanelQuiet"
            onPress={continueAsGuest}
          />
          <Text variant="caption" tone="onPanelMuted" style={styles.center}>
            General health information, not medical advice.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    gap: space.xxxl,
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg },
  center: { textAlign: 'center' },
  // The ribbon fills about two thirds of the square image.
  logo: { width: 220, height: 220, marginVertical: -space.xl },
  actions: { gap: space.md },
});
