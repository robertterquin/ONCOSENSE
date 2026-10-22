import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { brand, gradients } from '@/theme/colors';
import { radius } from '@/theme/tokens';

import { AppText } from './AppText';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Pink outline instead of the filled gradient. */
  outlined?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Full-width pink button (port of AuthButton). Disabled while loading. */
export function Button({ title, onPress, loading, disabled, outlined, style }: ButtonProps) {
  const inactive = loading || disabled;
  const content = loading ? (
    <ActivityIndicator color={outlined ? brand.primaryPink : brand.white} />
  ) : (
    <AppText variant="button" color={outlined ? brand.primaryPink : brand.white}>
      {title}
    </AppText>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      accessibilityLabel={title}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        outlined ? styles.outlined : styles.shadow,
        (pressed || disabled) && styles.dimmed,
        style,
      ]}>
      {outlined ? (
        content
      ) : (
        <LinearGradient
          colors={gradients.button}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}>
          {content}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'stretch',
    borderRadius: radius.medium,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    alignSelf: 'stretch',
    minHeight: 54,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  outlined: {
    borderWidth: 2,
    borderColor: brand.primaryPink,
    paddingHorizontal: 32,
  },
  shadow: {
    shadowColor: brand.primaryPink,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dimmed: {
    opacity: 0.7,
  },
});
