import { Pressable, StyleSheet } from 'react-native';

import { brand } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';

import { MaterialIcon } from './MaterialIcon';

type BookmarkButtonProps = {
  saved: boolean;
  onPress: () => void;
  /** What is being saved, for screen readers ("resource", "article"…). */
  itemLabel: string;
  size?: number;
};

export function BookmarkButton({ saved, onPress, itemLabel, size = 22 }: BookmarkButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={saved ? `Remove saved ${itemLabel}` : `Save ${itemLabel}`}
      accessibilityState={{ selected: saved }}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <MaterialIcon
        name={saved ? 'bookmark' : 'bookmark_border'}
        size={size}
        color={saved ? brand.headerPink : colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.6,
  },
});
