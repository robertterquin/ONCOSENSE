import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type CardProps = {
  children: ReactNode;
  /** Makes the whole card tappable. */
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Rounded card on the theme's card color. */
export function Card({ children, onPress, accessibilityLabel, style }: CardProps) {
  const { colors, isDark } = useTheme();
  const cardStyle = [
    styles.card,
    { backgroundColor: colors.card },
    !isDark && styles.shadow,
    style,
  ];

  if (!onPress) return <View style={cardStyle}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.large,
    padding: spacing.medium,
    gap: spacing.small,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
