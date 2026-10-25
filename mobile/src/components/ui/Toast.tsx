import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToastStore, type ToastType } from '@/stores/toastStore';
import type { Palette } from '@/theme/palette';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

// Short messages at the bottom of the screen, in the redesign style: dark night-violet
// for information, teal for success, rose for errors (each with an icon, so the color
// is never the only signal).

const LOOK: Record<ToastType, { background: keyof Palette; icon: IconName }> = {
  success: { background: 'help', icon: 'circle-check' },
  error: { background: 'danger', icon: 'circle-alert' },
  info: { background: 'panel', icon: 'info' },
};

const DURATION_MS = 3000;

/** Renders the current toast. Mount once, at the root. */
export function ToastHost() {
  const toast = useToastStore((state) => state.toast);
  const hide = useToastStore((state) => state.hide);
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useDesign();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(hide, DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast, hide]);

  if (!toast) return null;

  return (
    <Animated.View
      key={toast.id}
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={[styles.container, { bottom: insets.bottom + space.xxl }]}
      pointerEvents="box-none">
      <Pressable
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        onPress={hide}
        style={[styles.toast, { backgroundColor: palette[LOOK[toast.type].background] }]}>
        <Icon name={LOOK[toast.type].icon} size={20} color={textColor(toast.type, isDark)} />
        <Text variant="body" color={textColor(toast.type, isDark)} style={styles.message}>
          {toast.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    alignItems: 'center',
  },
  toast: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radii.control,
    paddingHorizontal: space.lg,
    paddingVertical: space.md + 2,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  message: { flex: 1 },
});

/** Dark mode uses light toast colors, so the text turns dark. */
function textColor(type: ToastType, isDark: boolean): string {
  if (!isDark) return '#FFFFFF';
  return type === 'info' ? '#FFFFFF' : '#15111F';
}
