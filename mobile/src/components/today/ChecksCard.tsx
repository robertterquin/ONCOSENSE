import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, RibbonMark, Text } from '@/components/ui';
import type { GuideStatus } from '@/hooks/useSelfChecks';
import { addDays } from '@/lib/dates';
import {
  checkStatusLabel,
  formatMonth,
  formatMonthDay,
  formatWeekdayDate,
  startOfDay,
} from '@/lib/selfCheck';
import { radii, shadows, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// Today's checks card: flat night violet, a small outline ribbon, and words doing the
// work. While a check is waiting it lists every check with Start on the one that has
// waited longest; when all are done it shows the week the next check falls in.

const LINE = 'rgba(255, 255, 255, 0.14)';
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type ChecksCardProps = {
  checks: GuideStatus[];
  snoozed: boolean;
  onSnooze: () => void;
  now: Date;
};

export function ChecksCard({ checks, snoozed, onSnooze, now }: ChecksCardProps) {
  const { palette } = useDesign();
  const byDue = [...checks].sort((a, b) => a.due.getTime() - b.due.getTime());
  const waiting = byDue.filter((check) => check.isDue);
  const allDone = waiting.length === 0;
  const startId = waiting[0]?.guide.id;
  const open = (id: string) => router.push({ pathname: '/learn/check/[id]', params: { id } });
  const next = byDue[0];

  const title = allDone ? `Done for ${formatMonth(now)}` : 'Your checks';
  const done =
    checks.length === 1 ? 'Your check is done.' : `All ${checks.length} checks are done.`;
  const body = allDone
    ? `${done} The next one is your ${next.guide.cancerType.toLowerCase()} check on ${formatWeekdayDate(next.due)}.`
    : snoozed
      ? "We'll remind you tomorrow."
      : `${checks.length - waiting.length} of ${checks.length} done. About 10 minutes each.`;

  return (
    <View style={[styles.card, { backgroundColor: palette.panel }]}>
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

      {allDone ? (
        <Week checks={byDue} />
      ) : (
        <View>
          {checks.map((check) => {
            const label = checkStatusLabel(check.lastDone, check.due, now);
            return (
              <View key={check.guide.id} style={styles.row}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${check.guide.title}, ${label}`}
                  onPress={() => open(check.guide.id)}
                  style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}>
                  <Text variant="row" tone="onPanel">
                    {check.guide.cancerType}
                  </Text>
                  <Text variant="caption" tone={check.isDue ? 'onPanelAccent' : 'onPanelMuted'}>
                    {label}
                  </Text>
                </Pressable>
                {check.guide.id === startId ? (
                  <Button
                    title="Start"
                    variant="onPanel"
                    small
                    accessibilityHint={`Starts the ${check.guide.title}`}
                    onPress={() => open(check.guide.id)}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {allDone ? (
        <Button
          title="Learn the early signs"
          variant="onPanelAccent"
          small
          style={styles.link}
          onPress={() => router.navigate('/learn')}
        />
      ) : snoozed ? null : (
        <Button
          title="Remind me tomorrow"
          variant="onPanelAccent"
          small
          style={styles.link}
          onPress={onSnooze}
        />
      )}
    </View>
  );
}

/**
 * The week (Sunday to Saturday) the next check falls in: its day filled, other checks
 * that week outlined, and the checks named underneath.
 */
function Week({ checks }: { checks: GuideStatus[] }) {
  const { palette } = useDesign();
  const next = startOfDay(checks[0].due);
  const sunday = addDays(next, -next.getDay());
  const days = Array.from({ length: 7 }, (_, index) => addDays(sunday, index));
  const thisWeek = checks.filter((check) => {
    const due = startOfDay(check.due).getTime();
    return due >= sunday.getTime() && due <= days[6].getTime();
  });
  const isCheckDay = (day: Date) =>
    thisWeek.some((check) => startOfDay(check.due).getTime() === day.getTime());
  return (
    <View
      accessible
      accessibilityLabel={`Coming up: ${thisWeek
        .map((check) => `${check.guide.cancerType}, ${formatMonthDay(check.due)}`)
        .join('; ')}`}
      style={styles.week}>
      <View style={styles.days}>
        {days.map((day) => {
          const isNext = day.getTime() === next.getTime();
          return (
            <View key={day.getTime()} style={styles.day}>
              <Text variant="caption" tone="onPanelMuted">
                {DAY_NAMES[day.getDay()]}
              </Text>
              <View
                style={[
                  styles.date,
                  isNext && { backgroundColor: palette.onPanelAccent },
                  !isNext && isCheckDay(day) && styles.outlined,
                  !isNext && isCheckDay(day) && { borderColor: palette.onPanelAccent },
                ]}>
                <Text variant="row" color={isNext ? palette.panel : palette.onPanel}>
                  {day.getDate()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text variant="supporting" tone="onPanelAccent">
        {thisWeek.map((check) => `${check.guide.cancerType} ${check.due.getDate()}`).join(', ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.panel,
    padding: space.xxl,
    gap: space.md,
    ...shadows.floating,
  },
  ribbon: { position: 'absolute', right: space.xl, top: space.xl },
  // Clear of the ribbon.
  header: { gap: space.xs, paddingRight: space.xxl + space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LINE,
  },
  rowMain: { flex: 1, gap: 2, minHeight: sizes.touch, paddingVertical: space.md },
  pressed: { opacity: 0.6 },
  week: {
    gap: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
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
  outlined: { borderWidth: 1.5 },
  // A text link under the content, lined up with it (the pill's padding sits outside).
  link: { alignSelf: 'flex-start', marginLeft: -space.lg },
});
