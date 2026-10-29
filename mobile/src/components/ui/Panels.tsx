import {
  Children,
  cloneElement,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { Palette } from '@/theme/palette';
import { elevation } from '@/theme/elevation';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { decorative } from './a11y';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { RibbonMark } from './RibbonMark';
import { Tag } from './Tag';
import { Text } from './Text';

// Panels: the next-step panel (the design's one bold element), banners and the
// sticky bottom action bar.

type Action = { label: string; onPress: () => void };

/** The ribbon's violet-to-rose fade, and the quiet segments of the step bar. */
const RIBBON_GRADIENT: [string, string] = ['#6A55D6', '#B2579A'];
const STEP_REST = 'rgba(255, 255, 255, 0.18)';

type NextStepPanelProps = {
  /** Short status line above the title ("Due today"). */
  status: string;
  statusIcon?: IconName;
  /** Shows the status as a rose "due" tag instead of an icon and text. */
  due?: boolean;
  /** Number of steps, drawn as segments under the body (a guided self-check). */
  steps?: number;
  title: string;
  body: string;
  primary: Action;
  secondary?: Action;
};

/** Night-violet panel with a soft violet fade and the ribbon line: the one thing to do next. */
export function NextStepPanel({
  status,
  statusIcon = 'calendar',
  due = false,
  steps,
  title,
  body,
  primary,
  secondary,
}: NextStepPanelProps) {
  const { palette } = useDesign();
  return (
    <PanelSurface>
      {due ? (
        <Tag tone="due" label={status} />
      ) : (
        <View style={styles.status}>
          <Icon name={statusIcon} size={18} color="#D9CFF5" />
          <Text variant="caption" color="#D9CFF5">
            {status}
          </Text>
        </View>
      )}
      <Text variant="panel" tone="onPanel" accessibilityRole="header" style={styles.panelTitle}>
        {title}
      </Text>
      <Text variant="body" tone="onPanelMuted" style={styles.panelBody}>
        {body}
      </Text>
      {steps ? (
        <View accessible accessibilityLabel={`${steps} steps`} style={styles.steps}>
          {Array.from({ length: steps }, (_, index) => (
            <View
              key={index}
              style={[
                styles.step,
                { backgroundColor: index === 0 ? palette.onPanelAccent : STEP_REST },
              ]}
            />
          ))}
        </View>
      ) : null}
      <View style={styles.panelActions}>
        <Button title={primary.label} onPress={primary.onPress} variant="onPanel" />
        {secondary ? (
          <Button title={secondary.label} onPress={secondary.onPress} variant="onPanelAccent" />
        ) : null}
      </View>
    </PanelSurface>
  );
}

/** The panel's night-violet surface and fade, with the ribbon line in the top-right corner. */
function PanelSurface({ children }: { children: ReactNode }) {
  const { palette, isDark } = useDesign();
  // The fade is drawn at the panel's measured size: a percent-sized gradient renders in
  // mismatched tiles on iOS (a visible seam).
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View style={[styles.panelShadow, elevation('panel', palette, isDark)]}>
      <View
        style={[styles.panel, { backgroundColor: palette.panel }]}
        onLayout={({ nativeEvent: { layout } }) =>
          setSize({ width: layout.width, height: layout.height })
        }>
        {size.width > 0 ? (
          <Svg
            width={size.width}
            height={size.height}
            style={StyleSheet.absoluteFill}
            {...decorative}>
            <Defs>
              <LinearGradient
                id="panelFade"
                gradientUnits="userSpaceOnUse"
                x1={size.width * 0.25}
                y1={0}
                x2={size.width * 0.75}
                y2={size.height}>
                <Stop offset="0" stopColor={palette.panelTop} />
                <Stop offset="1" stopColor={palette.panel} />
              </LinearGradient>
            </Defs>
            <Rect width={size.width} height={size.height} fill="url(#panelFade)" />
          </Svg>
        ) : null}
        <View style={styles.ribbon}>
          <RibbonMark height={229} color={palette.panelTop} gradient={RIBBON_GRADIENT} />
        </View>
        <View style={styles.panelContent}>{children}</View>
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
    <View
      style={[
        styles.banner,
        { backgroundColor: palette[look.background], borderColor: palette.border },
      ]}>
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
  panelShadow: {
    borderRadius: radii.panel,
  },
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
  steps: { flexDirection: 'row', gap: space.xs, marginTop: space.xs },
  step: { flex: 1, height: 6, borderRadius: radii.round },
  banner: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.control,
    borderWidth: 1,
  },
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
