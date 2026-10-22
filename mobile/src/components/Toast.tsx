import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToastStore, type ToastType } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

const BACKGROUND: Record<ToastType, string> = {
  success: '#43A047',
  error: '#E53935',
  info: '#323232',
};

const DURATION_MS = 3000;

/** Renders the current toast. Mount once, at the root. */
export function ToastHost() {
  const toast = useToastStore((state) => state.toast);
  const hide = useToastStore((state) => state.hide);
  const insets = useSafeAreaInsets();

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
      style={[styles.container, { bottom: insets.bottom + spacing.large }]}
      pointerEvents="box-none">
      <Pressable
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        onPress={hide}
        style={[styles.toast, { backgroundColor: BACKGROUND[toast.type] }]}>
        <AppText color={brand.white}>{toast.message}</AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.medium,
    right: spacing.medium,
    alignItems: 'center',
  },
  toast: {
    alignSelf: 'stretch',
    borderRadius: radius.small,
    paddingHorizontal: spacing.medium,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
});
