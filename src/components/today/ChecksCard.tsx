import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, RibbonMark, Text } from '@/components/ui';
import type { CheckItem, CheckKind } from '@/lib/checks';
import { addDays, formatShortMonthDay } from '@/lib/dates';
import { formatMonth, formatWeekdayDate, startOfDay } from '@/lib/selfCheck';
import { elevation } from '@/theme/elevation';
import type { Palette } from '@/theme/palette';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// Today's checks card (design refresh Phase 24): flat night violet with a week strip.
// It covers everything the person follows, bundled (lib/checks.ts): a dot on each day
// something is due, colored by kind, and up to three items underneath. With something
// due this week it shows this week; otherwise the week of the next check.

const LINE = 'rgba(255, 255, 255, 0.14)';
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MAX_LISTED = 3;

const KIND_LABEL: Record<CheckKind, string> = {
  test: 'Test',
  body: 'Body check',
  signs: 'Signs check',
};
const kindColor = (kind: CheckKind, palette: Palette) =>
  kind === 'test' ? palette.sun : kind === 'body' ? palette.onPanelAccent : palette.help;

export const openCheck = (item: CheckItem) => {
  if (item.kind === 'body') router.push('/body-check');
  else if (item.kind === 'signs') router.push('/signs');
  else router.push({ pathname: '/screening/[id]', params: { id: item.testId! } });
};

/** "stool test", "monthly body check", but "HPV test". */
const lowerFirst = (text: string) =>
  /^[A-Z][A-Z]/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);

type ChecksCardProps = {
  items: CheckItem[];
  snoozed: boolean;
  onSnooze: () => void;
  now: Date;
};

export function ChecksCard({ items, snoozed, onSnooze, now }: ChecksCardProps) {
  const { palette, isDark } = useDesign();
  const today = startOfDay(now);
  const sunday = addDays(today, -today.getDay());
  const saturday = addDays(sunday, 6);
  const scheduled = items.filter((item): item is CheckItem & { due: Date } => item.due !== null);
  const thisWeek = scheduled.filter((item) => item.due.getTime() <= saturday.getTime());
  const anyDue = thisWeek.some((item) => item.isDue);
  // A noted change (design refresh Phase 22) matters more than any date.
  const changed = items.find((item) => item.changeNoted);

  // The week shown: this one, or the one the next check falls in.
  const next = scheduled[0] ? startOfDay(scheduled[0].due) : null;
  const weekStart = thisWeek.length || !next ? sunday : addDays(next, -next.getDay());
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  // Overdue checks sit on today.
  const dayOf = (item: CheckItem & { due: Date }) =>
    Math.max(startOfDay(item.due).getTime(), today.getTime());
  const listed = thisWeek.length
    ? thisWeek
    : scheduled.filter((item) => next && startOfDay(item.due).getTime() === next.getTime());
  const highlight = thisWeek.length ? today.getTime() : next?.getTime();

  const title = changed
    ? 'You noted a change'
    : thisWeek.length
      ? `${thisWeek.length} check${thisWeek.length === 1 ? '' : 's'} this week`
      : "You're up to date";
  const body = changed
    ? `In your ${lowerFirst(changed.title)}. See a doctor soon.`
    : thisWeek.length
      ? snoozed && anyDue
        ? "We'll remind you tomorrow."
        : thisWeek
            .slice(0, 2)
            .map(
              (item) =>
                `Your ${lowerFirst(item.title)} ${
                  item.isDue ? 'is due now' : `is on ${formatWeekdayDate(item.due).split(',')[0]}`
                }.`,
            )
            .join(' ')
      : next
        ? `Next: ${listed.map((item) => lowerFirst(item.title)).join(' and ')} on ${formatWeekdayDate(next)}.`
        : 'Nothing is due.';
  const kinds = [...new Set(listed.map((item) => item.kind))];

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

      {next || thisWeek.length ? (
        <View style={styles.week}>
          {thisWeek.length ? null : (
            <Text variant="caption" tone="onPanelMuted">
              {`Next check · ${formatMonth(next!)}`}
            </Text>
          )}
          <View
            style={styles.days}
            accessible
            accessibilityLabel={listed
              .map((item) => `${item.title}, ${formatShortMonthDay(new Date(dayOf(item)))}`)
              .join('; ')}>
            {days.map((day) => {
              const onDay = listed.filter((item) => dayOf(item) === day.getTime());
              const marked = day.getTime() === highlight;
              return (
                <View key={day.getTime()} style={styles.day}>
                  <Text variant="caption" tone="onPanelMuted">
                    {DAY_NAMES[day.getDay()]}
                  </Text>
                  <View style={[styles.date, marked && { backgroundColor: palette.onPanelAccent }]}>
                    <Text variant="row" color={marked ? palette.panel : palette.onPanel}>
                      {day.getDate()}
                    </Text>
                  </View>
                  <View style={styles.dots}>
                    {[...new Set(onDay.map((item) => item.kind))].map((kind) => (
                      <View
                        key={kind}
                        style={[styles.dot, { backgroundColor: kindColor(kind, palette) }]}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
          {kinds.length > 1 ? (
            <View style={styles.legend} {...{ accessibilityElementsHidden: true }}>
              {kinds.map((kind) => (
                <View key={kind} style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: kindColor(kind, palette) }]} />
                  <Text variant="caption" tone="onPanelMuted">
                    {KIND_LABEL[kind]}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <View>
        {listed.slice(0, MAX_LISTED).map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${item.isDue ? 'due now' : formatShortMonthDay(item.due)}`}
            onPress={() => openCheck(item)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={[styles.dot, { backgroundColor: kindColor(item.kind, palette) }]} />
            <View style={styles.rowMain}>
              <Text variant="row" tone="onPanel">
                {item.title}
              </Text>
              <Text variant="caption" tone={item.isDue ? 'onPanelAccent' : 'onPanelMuted'}>
                {item.isDue
                  ? `Due now · ${item.detail}`
                  : `${formatShortMonthDay(item.due)} · ${item.detail}`}
              </Text>
            </View>
            <Text variant="supporting" tone="onPanelAccent">
              Open
            </Text>
          </Pressable>
        ))}
        {listed.length > MAX_LISTED ? (
          <Button
            title={`${listed.length - MAX_LISTED} more`}
            variant="onPanelAccent"
            small
            style={styles.link}
            onPress={() => router.navigate('/journey')}
          />
        ) : null}
      </View>

      {changed ? (
        <Button
          title="Find a screening center"
          variant="onPanelAccent"
          small
          style={styles.link}
          onPress={() => router.navigate({ pathname: '/help', params: { section: 'screening' } })}
        />
      ) : anyDue ? (
        snoozed ? null : (
          <Button
            title="Remind me tomorrow"
            variant="onPanelAccent"
            small
            style={styles.link}
            onPress={onSnooze}
          />
        )
      ) : (
        <Button
          title="Your cancers"
          variant="onPanelAccent"
          small
          style={styles.link}
          onPress={() => router.push('/checks')}
        />
      )}
    </View>
  );
}

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
  // A text link under the content, lined up with it (the pill's padding sits outside).
  link: { alignSelf: 'flex-start', marginLeft: -space.lg },
});
