import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Palette } from '@/theme/palette';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { RibbonMark } from './RibbonMark';
import { Text } from './Text';

// Panels: the next-step panel (the design's one bold element), banners and the
// sticky bottom action bar.

type Action = { label: string; onPress: () => void };

type NextStepPanelProps = {
  /** Short status line above the title ("Due today"). */
  status: string;
  statusIcon?: IconName;
  title: string;
  body: string;
  primary: Action;
  secondary?: Action;
};

/** Night-violet panel with the ribbon line: the one thing to do next. */
export function NextStepPanel({
  status,
  statusIcon = 'calendar',
  title,
  body,
  primary,
  secondary,
}: NextStepPanelProps) {
  const { palette, isDark } = useDesign();
  return (
    <View style={[styles.panel, { backgroundColor: palette.panel }]}>
      <View style={styles.ribbon}>
        <RibbonMark height={229} color={isDark ? '#4D3BA6' : '#5B45B8'} />
      </View>
      <View style={styles.panelContent}>
        <View style={styles.status}>
          <Icon name={statusIcon} size={18} color="#D9CFF5" />
          <Text variant="caption" color="#D9CFF5">
            {status}
          </Text>
        </View>
        <Text variant="panel" tone="onPanel" accessibilityRole="header" style={styles.panelTitle}>
          {title}
        </Text>
        <Text variant="body" tone="onPanelMuted" style={styles.panelBody}>
          {body}
        </Text>
        <View style={styles.panelActions}>
          <Button title={primary.label} onPress={primary.onPress} variant="onPanel" />
          {secondary ? (
            <Button title={secondary.label} onPress={secondary.onPress} variant="onPanelQuiet" />
          ) : null}
        </View>
      </View>
    </View>
  );
}

type BannerTone = 'info' | 'guard' | 'help';

const BANNERS: Record<
  BannerTone,
  { background: keyof Palette; text: keyof Palette; icon: IconName; iconTone: keyof Palette }
> = {
  info: { background: 'raised', text: 'ink', icon: 'info', iconTone: 'action' },
  guard: { background: 'raised', text: 'ink', icon: 'shield', iconTone: 'action' },
  help: { background: 'helpTint', text: 'onHelpTint', icon: 'life-buoy', iconTone: 'help' },
};

type BannerProps = {
  tone?: BannerTone;
  title?: string;
  children: string;
  /** Optional action under the text. */
  action?: ReactNode;
};

/** A short notice: community guidelines, a disclaimer, a pointer to help. */
export function Banner({ tone = 'info', title, children, action }: BannerProps) {
  const { palette } = useDesign();
  const look = BANNERS[tone];
  return (
    <View style={[styles.banner, { backgroundColor: palette[look.background] }]}>
      <Icon name={look.icon} size={22} tone={look.iconTone} />
      <View style={styles.bannerText}>
        {title ? (
          <Text variant="strong" tone={look.text}>
            {title}
          </Text>
        ) : null}
        <Text variant="supporting" tone={look.text}>
          {children}
        </Text>
        {action}
      </View>
    </View>
  );
}

/**
 * Sticky actions at the bottom of a screen (Save, Next step), above the home bar.
 * Buttons share the width equally unless they set their own `flex`.
 */
export function BottomActionBar({ children }: { children: ReactNode }) {
  const items = Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child as ReactElement<{ style?: unknown }>, {
          style: [styles.barItem, (child as ReactElement<{ style?: unknown }>).props.style],
        })
      : child,
  );
  const { palette } = useDesign();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bottomBar,
        {
          backgroundColor: palette.surface,
          borderTopColor: palette.line,
          paddingBottom: Math.max(insets.bottom, space.lg) + space.sm,
        },
      ]}>
      {items}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radii.panel,
    overflow: 'hidden',
    padding: space.xxl,
    paddingTop: space.xxl + 2,
  },
  ribbon: { position: 'absolute', right: -34, top: -26 },
  panelContent: { gap: space.sm + 2 },
  status: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
  panelTitle: { maxWidth: 250 },
  panelBody: { maxWidth: 280 },
  panelActions: { gap: space.sm, marginTop: space.sm + 2 },
  banner: { flexDirection: 'row', gap: space.md, padding: space.lg, borderRadius: radii.control },
  bannerText: { flex: 1, gap: space.xs },
  barItem: { flex: 1 },
  bottomBar: {
    flexDirection: 'row',
    gap: space.md - 2,
    paddingHorizontal: space.xl,
    paddingTop: space.md + 2,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
});
