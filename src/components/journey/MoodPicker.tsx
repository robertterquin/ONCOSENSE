import { StyleSheet, View } from 'react-native';

import { Icon, PressableScale, Text } from '@/components/ui';
import { haptics } from '@/lib/haptics';
import { MOODS } from '@/lib/journeyLabels';
import { useTransition } from '@/theme/motion';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// Five mood buttons (Rough to Great): Today's quick check-in and the full check-in.

type MoodPickerProps = {
  value: number | null;
  onChange: (mood: number) => void;
  disabled?: boolean;
};

export function MoodPicker({ value, onChange, disabled = false }: MoodPickerProps) {
  const { palette } = useDesign();
  const fill = useTransition('base', 'backgroundColor');
  return (
    <View style={styles.moods} accessibilityRole="radiogroup" accessibilityLabel="Mood">
      {MOODS.map((mood) => {
        const selected = value === mood.value;
        return (
          <PressableScale
            key={mood.value}
            accessibilityRole="radio"
            accessibilityLabel={mood.label}
            accessibilityState={{ checked: selected, disabled }}
            disabled={disabled}
            onPress={() => {
              haptics.selection();
              onChange(mood.value);
            }}
            style={[
              styles.mood,
              fill,
              { backgroundColor: selected ? palette.action : palette.ground },
            ]}>
            <Icon
              name={mood.icon}
              size={34}
              // Quiet until chosen, so only the chosen face carries colour.
              tone={selected ? 'onAction' : 'muted'}
            />
            <Text variant="caption" tone={selected ? 'onAction' : 'muted'} numberOfLines={1}>
              {mood.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  moods: { flexDirection: 'row', gap: space.xs },
  mood: {
    flex: 1,
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.md,
    borderRadius: radii.tile,
    minHeight: sizes.touch,
  },
});
