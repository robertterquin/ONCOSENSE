import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ProfileButton } from '@/components/account/ProfileButton';
import { HabitWeekStrip } from '@/components/learn/LearnSections';
import { ListRow, Screen, Section, Text } from '@/components/ui';
import { useHabitPlan } from '@/hooks/useHabits';
import { useSelfChecks, type FollowStatus, type GuideStatus } from '@/hooks/useSelfChecks';
import { formatShortDate, formatShortMonthDay, parseDbTimestamp } from '@/lib/dates';
import { habitStreak } from '@/lib/habits';
import { iconForCancer } from '@/lib/learn';
import { useHabitsStore } from '@/stores/habitsStore';
import { space } from '@/theme/tokens';

// Journey for people who are learning and checking themselves (design refresh Phase 19):
// their habits over the week and each self-check's history, where the dashboard is for
// people with cancer. People who finished treatment see the same sections in their
// dashboard. Ticking things off stays on Today.

const openGuide = (id: string) => router.push({ pathname: '/learn/check/[id]', params: { id } });

export function MyHealth() {
  return (
    <Screen
      inTabs
      tab="journey"
      title="My health"
      subtitle="Your checks and habits over time"
      titleAside={<ProfileButton />}>
      <MyHealthSections />
      <Section title="Have or had cancer?">
        <ListRow
          icon="calendar"
          title="Set up Journey"
          subtitle="Check-ins, treatments, follow-ups and a summary for your doctor"
          onPress={() => router.push('/journey/focus')}
        />
      </Section>
      <Text variant="supporting" tone="muted" style={styles.footnote}>
        Due checks and today&apos;s habits are on Today.
      </Text>
    </Screen>
  );
}

/**
 * Habits this week and each followed check, test and warning sign with its history. Also
 * in Journey for people who finished treatment.
 */
export function MyHealthSections() {
  const { tracked } = useHabitPlan();
  const trackedIds = tracked.map((habit) => habit.id);
  const streak = useHabitsStore((state) => habitStreak(state.completedByDate, trackedIds));
  const { mine, screenings, signs } = useSelfChecks();

  return (
    <>
      <Section>
        <ListRow
          icon="target"
          title="Habits this week"
          subtitle={
            streak === 0 ? 'Finish all your habits today to start a streak' : `${streak}-day streak`
          }
          onPress={() => router.push('/habits')}
        />
        <View style={styles.week}>
          <HabitWeekStrip trackedIds={trackedIds} />
        </View>
      </Section>

      {mine.length ? (
        <Section title="Monthly body check">
          {mine.map((status) => (
            <ListRow
              key={status.guide.id}
              icon={iconForCancer(status.guide.cancerType)}
              title={status.guide.title}
              subtitle={checkHistory(status)}
              subtitleTone={status.changeNoted ? 'sunInk' : 'muted'}
              onPress={() => openGuide(status.guide.id)}
            />
          ))}
        </Section>
      ) : null}

      {screenings.length ? (
        <Section title="Screening tests">
          {screenings.map((item) => (
            <ListRow
              key={item.historyId}
              icon="hospital"
              iconTone="help"
              title={item.test!.title}
              subtitle={followHistory(item)}
              onPress={() =>
                router.push({ pathname: '/screening/[id]', params: { id: item.test!.id } })
              }
            />
          ))}
        </Section>
      ) : null}

      {signs.length ? (
        <Section title="Signs check" subtitle="Every 3 months">
          {signs.map((item) => (
            <ListRow
              key={item.historyId}
              icon="info"
              title={item.cancer?.name ?? item.cancerKey}
              subtitle={
                item.changeNoted
                  ? `Sign noted ${formatShortMonthDay(item.changeNoted)}, see a doctor`
                  : followHistory(item)
              }
              subtitleTone={item.changeNoted ? 'sunInk' : 'muted'}
              onPress={() => router.push('/signs')}
            />
          ))}
        </Section>
      ) : null}

      <Section>
        <ListRow
          icon="target"
          title="Your cancers"
          subtitle="Choose which cancers you follow"
          onPress={() => router.push('/checks')}
        />
      </Section>
    </>
  );
}

/** "Done Mar 15, 2026, next Mar 15, 2027", "Due now", or "Done" for a one-off talk. */
function followHistory({ lastDone, due, isDue }: FollowStatus): string {
  if (!lastDone) return 'Due now';
  if (due === null) return `Done ${formatShortDate(lastDone)}`;
  return isDue
    ? `Done ${formatShortDate(lastDone)}, due now`
    : `Done ${formatShortDate(lastDone)}, next ${formatShortDate(due)}`;
}

/**
 * "Change noted Nov 1, see a doctor", "6 times this year, next Nov 28", "Done Oct 28,
 * next Nov 28", or "Not done yet, due today".
 */
function checkHistory({ lastDone, due, label, history, changeNoted }: GuideStatus): string {
  if (changeNoted) return `Change noted ${formatShortMonthDay(changeNoted)}, see a doctor`;
  if (!lastDone) return `Not done yet, ${label.toLowerCase()}`;
  const year = new Date().getFullYear();
  const thisYear = history.filter((entry) => parseDbTimestamp(entry.date).getFullYear() === year);
  return thisYear.length > 1
    ? `${thisYear.length} times this year, next ${formatShortMonthDay(due)}`
    : `Done ${formatShortDate(lastDone)}, next ${formatShortMonthDay(due)}`;
}

const styles = StyleSheet.create({
  week: { paddingHorizontal: space.xs },
  footnote: { paddingHorizontal: space.xs },
});
