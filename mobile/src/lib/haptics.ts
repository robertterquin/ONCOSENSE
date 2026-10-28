import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Safe, platform-guarded haptic feedback triggers.
 * Automatically no-ops on web or unsupported environments without throwing.
 */
export const haptics = {
  /** Subtle tick for choosing an option, picking a mood, or switching a tab. */
  selection() {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync().catch(() => {});
  },

  /** Gentle tactile bump for tapping an action button or card. */
  lightImpact() {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  /** Distinct bump for toggling states or opening detail sheets. */
  mediumImpact() {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  /** Celebratory pulse for completing a check-in or self-check step. */
  success() {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  /** Subtle warning vibration for destructive actions or errors. */
  warning() {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
};
