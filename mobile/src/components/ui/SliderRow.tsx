import Slider from '@react-native-community/slider';
import { StyleSheet, View } from 'react-native';

import { sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { decorative } from './a11y';
import { Text } from './Text';

type SliderRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Spoken and shown value ("3 of 10, moderate"). */
  valueText: string;
  /** Labels under each end of the track. */
  minLabel: string;
  maxLabel: string;
};

/** Labelled 0–10 style slider with the current value written out. */
export function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  valueText,
  minLabel,
  maxLabel,
}: SliderRowProps) {
  const { palette } = useDesign();
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text variant="section">{label}</Text>
        <Text variant="strong" tone="action" {...decorative}>
          {valueText}
        </Text>
      </View>
      <Slider
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value, text: valueText }}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={1}
        onValueChange={onChange}
        minimumTrackTintColor={palette.action}
        maximumTrackTintColor={palette.border}
        thumbTintColor={palette.action}
        style={styles.slider}
      />
      <View style={styles.ends} {...decorative}>
        <Text variant="caption" tone="muted">
          {minLabel}
        </Text>
        <Text variant="caption" tone="muted">
          {maxLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.sm },
  top: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.md,
  },
  slider: { height: sizes.touch },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
});
