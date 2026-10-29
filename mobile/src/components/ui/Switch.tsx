import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { useTransition } from '@/theme/motion';
import { useDesign } from '@/theme/useTheme';
import { haptics } from '@/lib/haptics';

import { PressableScale } from './PressableScale';

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
  const fill = useTransition('base', ['backgroundColor', 'borderColor']);
  const slide = useTransition('base', [
    'left',
    'width',
    'height',
    'borderRadius',
    'backgroundColor',
  ]);
  return (
    <PressableScale
      feedback="fade"
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={() => {
        haptics.selection();
        onValueChange(!value);
      }}
      style={[
        styles.track,
        fill,
        value
          ? { backgroundColor: palette.action, borderColor: palette.action }
          : { backgroundColor: palette.surface, borderColor: palette.muted },
        disabled && styles.disabled,
      ]}>
      {/* The thumb slides across and grows; off it's smaller, so the state reads without color. */}
      <Animated.View
        style={[
          styles.thumb,
          slide,
          value ? styles.thumbOn : styles.thumbOff,
          { backgroundColor: value ? palette.onAction : palette.muted },
        ]}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  track: { width: 56, height: 34, borderRadius: 17, borderWidth: 2, justifyContent: 'center' },
  thumb: { position: 'absolute' },
  // Inside the 2 pt border the track is 52 wide: off sits 4 from the left, on 1 from the right.
  thumbOn: { left: 23, width: 28, height: 28, borderRadius: 14 },
  thumbOff: { left: 4, width: 22, height: 22, borderRadius: 11 },
  disabled: { opacity: 0.45 },
});
