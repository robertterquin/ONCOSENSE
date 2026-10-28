import { Pressable, StyleSheet, View } from 'react-native';

import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import { haptics } from '@/lib/haptics';

import { Icon } from './Icon';
import { Text } from './Text';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** `toggle` (any number selected, shows a check) or `radio` (one of a group). */
  kind?: 'toggle' | 'radio';
  /** Selected color: violet, or teal on Help. */
  tone?: 'action' | 'help';
};

/** Rounded choice, 44 pt tall. Selected state differs in border, fill and weight. */
export function Chip({ label, selected, onPress, kind = 'toggle', tone = 'action' }: ChipProps) {
  const { palette } = useDesign();
  const on =
    tone === 'help'
      ? { fill: palette.helpTint, line: palette.help, text: 'onHelpTint' as const }
      : { fill: palette.raised, line: palette.action, text: 'action' as const };
  return (
    <Pressable
      accessibilityRole={kind === 'radio' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? { backgroundColor: on.fill, borderColor: on.line, borderWidth: 2 }
          : { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1.5 },
        pressed && styles.pressed,
      ]}>
      {selected && kind === 'toggle' ? (
        <Icon name="check" size={16} tone={on.text} strokeWidth={3} />
      ) : null}
      <Text variant={selected ? 'strong' : 'row'} tone={selected ? on.text : 'ink'}>
        {label}
      </Text>
    </Pressable>
  );
}

type SegmentedControlProps<T extends string> = {
  /** Read before the options ("Theme"). */
  accessibilityLabel: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** One-of-a-few choice (theme, text size). */
export function SegmentedControl<T extends string>({
  accessibilityLabel,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { palette, isDark } = useDesign();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.segments, { backgroundColor: palette.ground }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
            onPress={() => {
              haptics.selection();
              onChange(option.value);
            }}
            style={[
              styles.segment,
              selected && { backgroundColor: palette.surface },
              selected && !isDark && styles.raisedShadow,
              selected && isDark && { borderWidth: 1.5, borderColor: palette.action },
            ]}>
            <Text
              variant={selected ? 'strong' : 'row'}
              tone={selected ? 'action' : 'ink'}
              style={styles.segmentLabel}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: sizes.touch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    paddingHorizontal: space.lg - 2,
    borderRadius: radii.round,
  },
  pressed: { opacity: 0.7 },
  segments: { flexDirection: 'row', gap: space.xs, padding: space.xs, borderRadius: radii.control },
  segment: {
    flex: 1,
    minHeight: sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
    borderRadius: radii.control - 4,
  },
  segmentLabel: { textAlign: 'center' },
  raisedShadow: {
    shadowColor: '#221A36',
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
