import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useTransition } from '@/theme/motion';
import { fontFamily } from '@/theme/type';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import { haptics } from '@/lib/haptics';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
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
  const colorTransition = useTransition('base', ['backgroundColor', 'borderColor']);
  const on =
    tone === 'help'
      ? { fill: palette.helpTint, line: palette.help, text: 'onHelpTint' as const }
      : { fill: palette.raised, line: palette.action, text: 'action' as const };
  return (
    <PressableScale
      accessibilityRole={kind === 'radio' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={[
        styles.chip,
        colorTransition,
        selected
          ? { backgroundColor: on.fill, borderColor: on.line, borderWidth: 2 }
          : { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1.5 },
      ]}>
      {selected && kind === 'toggle' ? <Icon name="check" size={16} tone={on.text} bold /> : null}
      <Text variant={selected ? 'strong' : 'row'} tone={selected ? on.text : 'ink'}>
        {label}
      </Text>
    </PressableScale>
  );
}

type SegmentedControlProps<T extends string> = {
  /** Read before the options ("Theme"). */
  accessibilityLabel: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** One-of-a-few choice (theme, text size, filters). */
export function SegmentedControl<T extends string>({
  accessibilityLabel,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { palette, isDark } = useDesign();
  const isCompact = options.length >= 4;
  const glide = useTransition('base', 'left');
  const [width, setWidth] = useState(0);
  // The selection is one shape that glides between options, so it's measured, not per option.
  const inset = isCompact ? 3 : space.xs;
  const gap = isCompact ? 4 : space.xs;
  const segment = (width - 2 - 2 * inset - gap * (options.length - 1)) / options.length;
  const index = options.findIndex((option) => option.value === value);
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[
        styles.segments,
        isCompact && styles.segmentsCompact,
        // The track is the page colour, so its edge is what shows it.
        { backgroundColor: palette.ground, borderColor: palette.border, borderWidth: 1 },
      ]}>
      {width > 0 && index >= 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.selection,
            glide,
            !isDark && styles.raisedShadow,
            {
              top: inset,
              bottom: inset,
              width: segment,
              left: inset + index * (segment + gap),
              backgroundColor: palette.surface,
              borderColor: palette.action,
            },
          ]}
        />
      ) : null}
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
            style={[styles.segment, isCompact && styles.segmentCompact]}>
            <Text
              variant={isCompact ? 'caption' : selected ? 'strong' : 'row'}
              tone={selected ? 'action' : 'ink'}
              numberOfLines={1}
              style={[styles.segmentLabel, isCompact && selected && styles.compactSelectedLabel]}>
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
  segments: { flexDirection: 'row', gap: space.xs, padding: space.xs, borderRadius: radii.control },
  segmentsCompact: { gap: 4, padding: 3 },
  segment: {
    flex: 1,
    minHeight: sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
    borderRadius: radii.control - 4,
  },
  segmentCompact: {
    paddingHorizontal: 4,
  },
  selection: { position: 'absolute', borderWidth: 1.5, borderRadius: radii.control - 4 },
  segmentLabel: { textAlign: 'center' },
  compactSelectedLabel: { fontFamily: fontFamily.extraBold },
  raisedShadow: {
    shadowColor: '#221A36',
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
