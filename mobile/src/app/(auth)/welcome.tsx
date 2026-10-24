import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, RibbonMark, Text } from '@/components/ui';
import { APP_NAME } from '@/constants/app';
import { continueAsGuest } from '@/hooks/useAuth';
import { space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// Welcome (redesign Phase 6): the night-violet panel with the ribbon, in light and
// dark alike.

export default function WelcomeScreen() {
  const { palette } = useDesign();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor: palette.panel }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.xxxl, paddingBottom: insets.bottom + space.xl },
        ]}>
        <View style={styles.hero}>
          <RibbonMark height={168} color="#7B63D6" highlight="#B4A3F5" weight={24} />
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
  actions: { gap: space.md },
});
