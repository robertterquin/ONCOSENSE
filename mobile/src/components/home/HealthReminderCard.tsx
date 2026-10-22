import { Pressable, StyleSheet, View } from 'react-native';

import { markReminderAsShown } from '@/api/healthReminders';
import { showToast } from '@/stores/toastStore';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { HealthReminder } from '@/types/healthReminder';

import { AppText } from '../AppText';
import { MaterialIcon } from '../MaterialIcon';

/** Adds an alpha channel to a 6-digit hex color (`2196F3` → `#2196F31A`). */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const value = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${clean}${value}`;
}

export function HealthReminderCard({ reminder }: { reminder: HealthReminder }) {
  const { isDark } = useTheme();
  const color = `#${reminder.color.replace('#', '')}`;

  const onPress = () => {
    markReminderAsShown(reminder.id);
    if (reminder.source) showToast(`Source: ${reminder.source}`);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${reminder.title}. ${reminder.message}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: withAlpha(color, isDark ? 0.15 : 0.08),
          borderColor: withAlpha(color, 0.3),
        },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.icon, { backgroundColor: withAlpha(color, 0.2) }]}>
        <MaterialIcon
          name={reminder.icon}
          fallback="notifications-active"
          size={24}
          color={color}
        />
      </View>
      <View style={styles.text}>
        <AppText variant="label">{reminder.title}</AppText>
        <AppText variant="bodySmall" secondary>
          {reminder.message}
        </AppText>
        {reminder.source ? (
          <AppText style={[styles.source, { color }]}>📚 {reminder.source}</AppText>
        ) : null}
      </View>
      <MaterialIcon name="check_circle_outline" size={20} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.medium,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    padding: 10,
    borderRadius: 10,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  source: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
  },
});
