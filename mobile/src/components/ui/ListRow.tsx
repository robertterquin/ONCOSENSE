import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Palette } from '@/theme/palette';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import { haptics } from '@/lib/haptics';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/** Icon tile colors by section: lavender, rose (self-checks), teal (help), sun (tips and reminders), danger. */
export type TileTone = 'action' | 'rose' | 'help' | 'sun' | 'danger';

export const TILES: Record<TileTone, { background: keyof Palette; color: keyof Palette }> = {
  action: { background: 'raised', color: 'action' },
  rose: { background: 'roseTint', color: 'rose' },
  help: { background: 'helpTint', color: 'help' },
  sun: { background: 'sun', color: 'sunInk' },
  danger: { background: 'roseTint', color: 'danger' },
};

type ListRowProps = {
  title: string;
  subtitle?: string;
  /** Color for the subtitle (`rose` for "Due today"). */
  subtitleTone?: keyof Palette;
  icon?: IconName;
  iconTone?: TileTone;
  /** A small element under the subtitle, inside the tappable area (a `Tag`). */
  badge?: ReactNode;
  /** Short text before the chevron ("6 items"). */
  trailing?: string;
  /** Replaces the chevron (a switch, a call button). Keep it outside `onPress`. */
  accessory?: ReactNode;
  onPress?: () => void;
  /** Overrides the label read for the row; defaults to title and subtitle. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  titleTone?: keyof Palette;
};

/**
 * One row in a section: optional icon tile, title, subtitle, and a chevron (when
 * tappable) or an accessory. An accessory with its own button sits beside the
 * pressable area, never inside it (nested buttons break on the web).
 */
export function ListRow({
  title,
  subtitle,
  subtitleTone = 'muted',
  icon,
  iconTone = 'action',
  badge,
  trailing,
  accessory,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  titleTone = 'ink',
}: ListRowProps) {
  const { palette } = useDesign();
  const tile = TILES[iconTone];

  const body = (
    <>
      {icon ? (
        <View style={[styles.tile, { backgroundColor: palette[tile.background] }]}>
          <Icon name={icon} size={22} tone={tile.color} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text variant="row" tone={titleTone}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="supporting" tone={subtitleTone}>
            {subtitle}
          </Text>
        ) : null}
        {badge}
      </View>
      {trailing ? (
        <Text variant="supporting" tone="muted">
          {trailing}
        </Text>
      ) : null}
      {onPress && !accessory ? <Icon name="chevron-right" size={20} tone="muted" /> : null}
    </>
  );

  return (
    <View style={styles.row}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            accessibilityLabel ?? [title, subtitle, trailing].filter(Boolean).join(', ')
          }
          accessibilityHint={accessibilityHint}
          onPress={() => {
            haptics.lightImpact();
            onPress();
          }}
          style={({ pressed }) => [styles.main, pressed && styles.pressed]}>
          {body}
        </Pressable>
      ) : (
        <View style={styles.main} accessible={!accessory} accessibilityLabel={accessibilityLabel}>
          {body}
        </View>
      )}
      {accessory}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: sizes.row },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md + 2,
    paddingVertical: space.md,
  },
  pressed: { opacity: 0.6 },
  tile: {
    width: 44,
    height: 44,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2, alignItems: 'flex-start' },
});
