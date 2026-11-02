import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/ui';
import type { CheckItem, CheckKind } from '@/lib/checks';
import { addDays, formatShortMonthDay } from '@/lib/dates';
import { formatMonth, formatWeekdayDate, startOfDay } from '@/lib/selfCheck';

import { CalendarCard, CalendarRow, calendarStyles, WeekStrip, type DotKind } from './CalendarCard';

// Today's checks card (design refresh Phase 24): flat night violet with a week strip.
// It covers everything the person follows, bundled (lib/checks.ts): a dot on each day
// something is due, colored by kind, and up to three items underneath. With something
// due this week it shows this week; otherwise the week of the next check.

const MAX_LISTED = 3;

const KINDS: DotKind<CheckKind>[] = [
  { kind: 'test', color: 'sun', label: 'Test' },
  { kind: 'body', color: 'onPanelAccent', label: 'Body check' },
  { kind: 'signs', color: 'help', label: 'Signs check' },
];

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
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const marks = listed.filter((item) => dayOf(item) === date.getTime()).map((item) => item.kind);
    return { date, marks };
  });

  return (
    <CalendarCard title={title} body={body}>
      {next || thisWeek.length ? (
        <WeekStrip
          days={days}
          kinds={KINDS}
          highlight={highlight === undefined ? undefined : new Date(highlight)}
          caption={thisWeek.length ? undefined : `Next check · ${formatMonth(next!)}`}
          accessibilityLabel={listed
            .map((item) => `${item.title}, ${formatShortMonthDay(new Date(dayOf(item)))}`)
            .join('; ')}
        />
      ) : null}

      <View>
        {listed.slice(0, MAX_LISTED).map((item) => (
          <CalendarRow
            key={item.id}
            color={KINDS.find((kind) => kind.kind === item.kind)!.color}
            title={item.title}
            detail={
              item.isDue
                ? `Due now · ${item.detail}`
                : `${formatShortMonthDay(item.due)} · ${item.detail}`
            }
            highlighted={item.isDue}
            accessibilityLabel={`${item.title}, ${item.isDue ? 'due now' : formatShortMonthDay(item.due)}`}
            onPress={() => openCheck(item)}
          />
        ))}
        {listed.length > MAX_LISTED ? (
          <Button
            title={`${listed.length - MAX_LISTED} more`}
            variant="onPanelAccent"
            small
            style={calendarStyles.link}
            onPress={() => router.navigate('/journey')}
          />
        ) : null}
      </View>

      {changed ? (
        <Button
          title="Find a screening center"
          variant="onPanelAccent"
          small
          style={calendarStyles.link}
          onPress={() => router.navigate({ pathname: '/help', params: { section: 'screening' } })}
        />
      ) : anyDue ? (
        snoozed ? null : (
          <Button
            title="Remind me tomorrow"
            variant="onPanelAccent"
            small
            style={calendarStyles.link}
            onPress={onSnooze}
          />
        )
      ) : (
        <Button
          title="Your cancers"
          variant="onPanelAccent"
          small
          style={calendarStyles.link}
          onPress={() => router.push('/checks')}
        />
      )}
    </CalendarCard>
  );
}
