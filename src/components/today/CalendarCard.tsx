import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { RibbonMark, Text } from '@/components/ui';
import { darkPalette, type Palette } from '@/theme/palette';
import { elevation } from '@/theme/elevation';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// The night-violet calendar cards on Today (design refresh Phase 24 for checks, Phase 26
// for treatment): a title and line, a week strip with colored dots, and rows underneath.

const LINE = 'rgba(255, 255, 255, 0.14)';
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// The panel is dark in both themes, so its dots take the dark theme's colors (amber as ink).
const onPanel = (color: keyof Palette, palette: Palette, isDark: boolean) =>
  (isDark ? palette : darkPalette)[color === 'sun' ? 'sunInk' : color];

/** The card: the ribbon, a heading and a line, then its parts. */
export function CalendarCard({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  const { palette, isDark } = useDesign();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.panel, borderColor: palette.tintEdge },
        elevation('panel', palette, isDark),
      ]}>
      <View style={styles.ribbon}>
        <RibbonMark height={40} weight={16} color={palette.onPanelAccent} />
      </View>
      <View style={styles.header}>
        <Text variant="heading" tone="onPanel" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="supporting" tone="onPanelMuted">
          {body}
        </Text>
      </View>
      {children}
    </View>
  );
}

export type DotKind<K extends string> = { kind: K; color: keyof Palette; label: string };

/** Sunday to Saturday with a dot per kind on each day; a legend when there's more than one. */
export function WeekStrip<K extends string>({
  days,
  kinds,
  highlight,
  caption,
  accessibilityLabel,
}: {
  days: { date: Date; marks: K[] }[];
  kinds: DotKind<K>[];
  /** The day to mark (today, or the next day with something on it). */
  highlight?: Date;
  caption?: string;
  accessibilityLabel: string;
}) {
  const { palette, isDark } = useDesign();
  const color = (kind: K) =>
    onPanel(kinds.find((item) => item.kind === kind)!.color, palette, isDark);
  const shown = kinds.filter((item) => days.some((day) => day.marks.includes(item.kind)));
  return (
    <View style={styles.week}>
      {caption ? (
        <Text variant="caption" tone="onPanelMuted">
          {caption}
        </Text>
      ) : null}
      <View style={styles.days} accessible accessibilityLabel={accessibilityLabel}>
        {days.map((day) => {
          const marked = day.date.getTime() === highlight?.getTime();
          return (
            <View key={day.date.getTime()} style={styles.day}>
              <Text variant="caption" tone="onPanelMuted">
                {DAY_NAMES[day.date.getDay()]}
              </Text>
              <View style={[styles.date, marked && { backgroundColor: palette.onPanelAccent }]}>
                <Text variant="row" color={marked ? palette.panel : palette.onPanel}>
                  {day.date.getDate()}
                </Text>
              </View>
              <View style={styles.dots}>
                {[...new Set(day.marks)].map((kind) => (
                  <View key={kind} style={[styles.dot, { backgroundColor: color(kind) }]} />
                ))}
              </View>
            </View>
          );
        })}
      </View>
      {shown.length > 1 ? (
        <View style={styles.legend} {...{ accessibilityElementsHidden: true }}>
          {shown.map((item) => (
            <View key={item.kind} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: color(item.kind) }]} />
              <Text variant="caption" tone="onPanelMuted">
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** One item under the week: its dot, title and detail, opening it. */
export function CalendarRow({
  color,
  title,
  detail,
  highlighted = false,
  accessibilityLabel,
  onPress,
}: {
  color: keyof Palette;
  title: string;
  detail: string;
  /** Due now or soon: the detail in the accent color. */
  highlighted?: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const { palette, isDark } = useDesign();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.dot, { backgroundColor: onPanel(color, palette, isDark) }]} />
      <View style={styles.rowMain}>
        <Text variant="row" tone="onPanel">
          {title}
        </Text>
        <Text variant="caption" tone={highlighted ? 'onPanelAccent' : 'onPanelMuted'}>
          {detail}
        </Text>
      </View>
      <Text variant="supporting" tone="onPanelAccent">
        Open
      </Text>
    </Pressable>
  );
}

export const calendarStyles = StyleSheet.create({
  // A text link under the content, lined up with it (the pill's padding sits outside).
  link: { alignSelf: 'flex-start', marginLeft: -space.lg },
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.panel,
    borderWidth: 1,
    padding: space.xxl,
    gap: space.md,
  },
  ribbon: { position: 'absolute', right: space.xl, top: space.xl },
  // Clear of the ribbon.
  header: { gap: space.xs, paddingRight: space.xxl + space.sm },
  week: {
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: space.md,
  },
  days: { flexDirection: 'row' },
  day: { flex: 1, alignItems: 'center', gap: space.xs },
  date: {
    width: 36,
    height: 36,
    borderRadius: radii.tile - 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 3, height: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: LINE,
    minHeight: sizes.touch,
  },
  rowMain: { flex: 1, gap: 2, paddingVertical: space.md },
  pressed: { opacity: 0.6 },
});
