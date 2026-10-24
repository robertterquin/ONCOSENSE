import { Pressable, StyleSheet, View } from 'react-native';

import { useDesign } from '@/theme/useTheme';

type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

/**
 * On/off switch drawn by the app, so it looks and behaves the same on iOS, Android
 * and the web. On and off differ in shape (filled track, large thumb on the right vs.
 * outlined track, small thumb on the left), not only in color.
 */
export function Switch({
  value,
  onValueChange,
  accessibilityLabel,
  disabled = false,
}: SwitchProps) {
  const { palette } = useDesign();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.track,
        value
          ? { backgroundColor: palette.action, borderColor: palette.action }
          : { backgroundColor: palette.surface, borderColor: palette.muted },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <View
        style={[
          value ? styles.thumbOn : styles.thumbOff,
          { backgroundColor: value ? palette.onAction : palette.muted },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 56, height: 34, borderRadius: 17, borderWidth: 2, justifyContent: 'center' },
  thumbOn: { position: 'absolute', right: 1, width: 28, height: 28, borderRadius: 14 },
  thumbOff: { position: 'absolute', left: 4, width: 22, height: 22, borderRadius: 11 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.45 },
});
