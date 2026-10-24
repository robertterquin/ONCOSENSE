import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
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
            onPress={() => onChange(mood.value)}
            style={({ pressed }) => [
              styles.mood,
              { backgroundColor: selected ? palette.raised : palette.ground },
              selected && { borderColor: palette.action },
              pressed && styles.pressed,
            ]}>
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <Text variant="caption" tone={selected ? 'action' : 'muted'} numberOfLines={1}>
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
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: sizes.touch,
  },
  pressed: { opacity: 0.6 },
  emoji: { fontSize: 26, lineHeight: 32 },
});
