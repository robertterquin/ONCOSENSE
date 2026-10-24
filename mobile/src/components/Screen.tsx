import type { ReactNode } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brand } from '@/theme/colors';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

/** Space above the tab bar (redesign Phase 3: the bar no longer floats over screens). */
export const TAB_BAR_CLEARANCE = 16;

type ScreenProps = {
  children: ReactNode;
  /** Rendered above the content, outside the scroll view (e.g. `AppHeader`). */
  header?: ReactNode;
  /** Wraps the content in a ScrollView. Defaults to true. */
  scroll?: boolean;
  /** Pull-to-refresh handler (scrolling screens only). */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** `surface` (white in light mode) or the default light-gray `background`. */
  background?: 'background' | 'surface';
  /** Set on tab screens to keep content clear of the floating tab bar. */
  inTabs?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Screen background, safe-area padding and optional scrolling/pull-to-refresh. */
export function Screen({
  children,
  header,
  scroll = true,
  onRefresh,
  refreshing = false,
  background = 'background',
  inTabs = false,
  contentStyle,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = header ? 0 : insets.top;
  const bottom = inTabs ? TAB_BAR_CLEARANCE : spacing.large + insets.bottom;
  const padding = [styles.content, { paddingTop: spacing.medium + topInset }, contentStyle];

  return (
    <View style={[styles.root, { backgroundColor: colors[background] }]}>
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[padding, { paddingBottom: bottom }]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={brand.primaryPink}
                colors={[brand.primaryPink]}
              />
            ) : undefined
          }>
          {children}
        </ScrollView>
      ) : (
        <View style={[padding, styles.fill, { paddingBottom: bottom }]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.medium,
    gap: spacing.medium,
  },
  fill: {
    flex: 1,
  },
});
