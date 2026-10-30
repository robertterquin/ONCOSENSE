import { useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToastStore, type ToastType } from '@/stores/toastStore';
import { darkPalette, type Palette } from '@/theme/palette';
import { elevation } from '@/theme/elevation';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Icon, type IconName } from './Icon';
import { TAB_BAR_HEIGHT } from './TabBar';
import { Text } from './Text';

// Short messages at the bottom of the screen. Every toast is the night-violet panel
// (dark in both themes); only the icon changes with the type, so the words and the
// icon carry the meaning, never the color alone.

const LOOK: Record<ToastType, { iconColor: (palette: Palette) => string; icon: IconName }> = {
  // The light theme's teal is too dark on the panel, so success borrows the dark one.
  success: { iconColor: () => darkPalette.help, icon: 'circle-check' },
  // The panel is dark in both themes, so error borrows the dark theme's red too.
  error: { iconColor: () => darkPalette.danger, icon: 'circle-alert' },
  info: { iconColor: (palette) => palette.onPanelMuted, icon: 'info' },
};

const DURATION_MS = 3000;

/** Renders the current toast. Mount once, at the root. */
export function ToastHost() {
  const toast = useToastStore((state) => state.toast);
  const hide = useToastStore((state) => state.hide);
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useDesign();
  // On the tab screens, sit above the tab bar instead of covering it.
  const onTabs = useSegments()[0] === '(tabs)';
  const bottom = onTabs
    ? TAB_BAR_HEIGHT + Math.max(insets.bottom, space.md) + space.md
    : insets.bottom + space.xxl;

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
      style={[styles.container, { bottom }]}
      pointerEvents="box-none">
      <Pressable
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        onPress={hide}
        style={[
          styles.toast,
          { backgroundColor: palette.panel },
          elevation('panel', palette, isDark),
        ]}>
        <Icon name={LOOK[toast.type].icon} size={20} color={LOOK[toast.type].iconColor(palette)} />
        <Text variant="body" color={palette.onPanel} style={styles.message}>
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
    // Above screen chrome such as the bottom action bar.
    zIndex: 100,
  },
  toast: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radii.control,
    paddingHorizontal: space.lg,
    paddingVertical: space.md + 2,
  },
  message: { flex: 1 },
});
