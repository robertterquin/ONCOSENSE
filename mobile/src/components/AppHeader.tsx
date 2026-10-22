import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brand, gradients } from '@/theme/colors';
import { radius } from '@/theme/tokens';

import { AppText } from './AppText';
import { MaterialIcon } from './MaterialIcon';

type AppHeaderProps = {
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  /** Defaults to going back one screen. */
  onBackPress?: () => void;
  /** Buttons on the right (Home's notifications and profile). */
  right?: ReactNode;
  /** Title size; Home's greeting is slightly smaller (18). */
  titleSize?: number;
};

/** Pink gradient header with rounded bottom corners (port of CustomAppHeader). */
export function AppHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  right,
  titleSize = 20,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.shadow}>
      <LinearGradient
        colors={gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { height: 85 + insets.top, paddingTop: insets.top }]}>
        <View style={[styles.circle, styles.circleLarge]} />
        <View style={[styles.circle, styles.circleSmall]} />
        <MaterialIcon
          name="favorite"
          size={40}
          color="rgba(255, 255, 255, 0.15)"
          style={[styles.heart, { top: insets.top + 10, right: right ? 70 : 20 }]}
        />

        <View style={styles.row}>
          {showBackButton && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBackPress ?? (() => router.back())}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <MaterialIcon name="arrow_back_ios_new" size={20} color={brand.white} />
            </Pressable>
          )}
          <View style={styles.text}>
            <AppText
              variant="titleLarge"
              color={brand.white}
              numberOfLines={1}
              style={[styles.title, { fontSize: titleSize }]}>
              {title}
            </AppText>
            <AppText
              variant="bodySmall"
              color="rgba(255, 255, 255, 0.9)"
              numberOfLines={1}
              style={styles.subtitle}>
              {subtitle}
            </AppText>
            <View style={styles.accentLine} />
          </View>
          {right}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: brand.headerPink,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderBottomLeftRadius: radius.header,
    borderBottomRightRadius: radius.header,
  },
  container: {
    overflow: 'hidden',
    borderBottomLeftRadius: radius.header,
    borderBottomRightRadius: radius.header,
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleLarge: {
    width: 120,
    height: 120,
    right: -30,
    top: -30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circleSmall: {
    width: 80,
    height: 80,
    left: -20,
    bottom: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heart: {
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  backButton: {
    marginLeft: -12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
  },
  title: {
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 3,
  },
  accentLine: {
    marginTop: 6,
    width: 40,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
