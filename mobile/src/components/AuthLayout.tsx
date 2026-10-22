import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { brand, gradients } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

import { AppText } from './AppText';
import { MaterialIcon } from './MaterialIcon';

type AuthLayoutProps = {
  children: ReactNode;
  /** Title next to the back button. Omit for no top bar (Welcome). */
  title?: string;
  /** Background gradient stops, top to bottom. Defaults to the soft pink of the login screen. */
  gradient?: readonly [string, string, ...string[]];
  /** Centers the content vertically instead of scrolling from the top. */
  centered?: boolean;
};

/** Background, back button and keyboard-aware scrolling shared by the sign-in screens. */
export function AuthLayout({
  children,
  title,
  gradient = gradients.softPink,
  centered = false,
}: AuthLayoutProps) {
  return (
    <LinearGradient colors={gradient} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        {title ? (
          <View style={styles.topBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}>
              <MaterialIcon name="arrow_back" size={24} color={brand.headerPink} />
            </Pressable>
            <AppText variant="headlineMedium" color="#212121">
              {title}
            </AppText>
          </View>
        ) : null}
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.content, centered && styles.centered]}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  content: {
    flexGrow: 1,
    padding: spacing.large,
    gap: spacing.medium,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  centered: {
    justifyContent: 'center',
  },
});
