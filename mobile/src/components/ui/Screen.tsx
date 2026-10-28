import { router } from 'expo-router';
import type { ReactNode, RefObject } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Icon } from './Icon';
import { Text } from './Text';

type ScreenProps = {
  /** Large plain title at the top of the content (no gradient header). */
  title?: string;
  subtitle?: string;
  /** Detail screens use the larger display title. */
  titleSize?: 'title' | 'display';
  /** Next to the title (Today's profile button). */
  titleAside?: ReactNode;
  /** Back link above the title; `label` names where it goes ("Learn"). */
  back?: { label: string; onPress?: () => void };
  /** Buttons at the top right (save, more, listen). */
  actions?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** `ground` (lavender-white) or `surface` (white, for reading screens). */
  background?: 'ground' | 'surface';
  /** Tab screens: the tab bar below already covers the home indicator. */
  inTabs?: boolean;
  /** Sticky actions under the content (a `BottomActionBar`). */
  bottomBar?: ReactNode;
  /** For scrolling to a section ("On this page"). */
  scrollRef?: RefObject<ScrollViewInstance | null>;
};

/** Redesign screen layout: safe areas, top bar, large title and scrolling content. */
export function Screen({
  title,
  subtitle,
  titleSize = 'title',
  titleAside,
  back,
  actions,
  children,
  scroll = true,
  onRefresh,
  refreshing = false,
  background = 'ground',
  inTabs = false,
  bottomBar,
  scrollRef,
}: ScreenProps) {
  const { palette } = useDesign();
  const insets = useSafeAreaInsets();
  const hasTopBar = Boolean(back || actions);
  const bottomSpace = inTabs || bottomBar ? space.xxl : insets.bottom + space.xxxl;

  const header = title ? (
    <View style={styles.titleRow}>
      <View style={styles.titleText}>
        <Text variant={titleSize} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="supporting" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {titleAside}
    </View>
  ) : null;

  const content = (
    <>
      {header}
      {children}
    </>
  );
  const contentStyle = [
    styles.content,
    { paddingBottom: bottomSpace },
    !hasTopBar && { paddingTop: insets.top + space.xxl },
  ];

  return (
    <View style={[styles.root, { backgroundColor: palette[background] }]}>
      {hasTopBar ? (
        <View style={[styles.topBar, { paddingTop: insets.top + space.xs }]}>
          {back ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Back to ${back.label}`}
              onPress={back.onPress ?? (() => router.back())}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
              <Icon name="chevron-left" size={24} tone="action" />
              <Text variant="row" tone="action">
                {back.label}
              </Text>
            </Pressable>
          ) : (
            <View />
          )}
          <View style={styles.actions}>{actions}</View>
        </View>
      ) : null}
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.action}
                colors={[palette.action]}
              />
            ) : undefined
          }>
          {content}
        </ScrollView>
      ) : (
        <View style={[contentStyle, styles.fill]}>{content}</View>
      )}
      {bottomBar}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: sizes.touch + 4,
    paddingHorizontal: space.xs,
  },
  pressed: { opacity: 0.6 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, gap: space.lg },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingBottom: space.xs,
  },
  titleText: { flex: 1, gap: space.xs },
});
