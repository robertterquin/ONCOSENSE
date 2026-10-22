import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { AuthLayout } from '@/components/AuthLayout';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';
import { brand } from '@/theme/colors';

// Port of lib/screens/auth/welcome_screen.dart

export default function WelcomeScreen() {
  return (
    <AuthLayout gradient={['#FFFFFF', '#FFF0F5', '#FCE4EC']} centered>
      <View style={styles.hero}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="OncoSense logo"
        />
        <AppText variant="displayLarge" color={brand.headerPink} style={styles.name}>
          {APP_NAME}
        </AppText>
        <AppText color="#757575" style={styles.tagline}>
          {APP_TAGLINE}
        </AppText>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/register')}
          style={({ pressed }) => [styles.pill, styles.filled, pressed && styles.pressed]}>
          <AppText variant="button" color={brand.white}>
            Create an account
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/login')}
          style={({ pressed }) => [styles.pill, styles.outlined, pressed && styles.pressed]}>
          <AppText variant="button" color={brand.headerPink}>
            I already have an account
          </AppText>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  name: {
    fontSize: 36,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    gap: 16,
    marginBottom: 16,
  },
  pill: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: brand.headerPink,
  },
  outlined: {
    borderWidth: 2,
    borderColor: brand.headerPink,
  },
  pressed: {
    opacity: 0.8,
  },
});
