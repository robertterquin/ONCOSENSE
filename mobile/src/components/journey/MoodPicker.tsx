import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { haptics } from '@/lib/haptics';
import { MOODS } from '@/lib/journeyLabels';
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
  return (
    <View style={styles.moods} accessibilityRole="radiogroup" accessibilityLabel="Mood">
      {MOODS.map((mood) => {
        const selected = value === mood.value;
        return (
          <Pressable
            key={mood.value}
            accessibilityRole="radio"
            accessibilityLabel={mood.label}
            accessibilityState={{ checked: selected, disabled }}
            disabled={disabled}
            onPress={() => {
              haptics.selection();
              onChange(mood.value);
            }}
            style={({ pressed }) => [
              styles.mood,
              { backgroundColor: selected ? palette.action : palette.ground },
              pressed && styles.pressed,
            ]}>
            <Icon
              name={mood.icon}
              size={28}
              // Sun's text-safe shade; rose and teal are already readable on the page.
              tone={selected ? 'onAction' : mood.tone === 'sun' ? 'sunInk' : mood.tone}
            />
            <Text variant="caption" tone={selected ? 'onAction' : 'muted'} numberOfLines={1}>
              {mood.label}
            </Text>
          </Pressable>
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
  pressed: { opacity: 0.6 },
});
