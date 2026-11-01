import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ProfileButton } from '@/components/account/ProfileButton';
import { HabitWeekStrip } from '@/components/learn/LearnSections';
import { ListRow, Screen, Section, Text } from '@/components/ui';
import { useHabitPlan } from '@/hooks/useHabits';
import { useSelfChecks, type GuideStatus } from '@/hooks/useSelfChecks';
import { formatShortDate, formatShortMonthDay } from '@/lib/dates';
import { habitStreak } from '@/lib/habits';
import { iconForCancer } from '@/lib/learn';
import { useHabitsStore } from '@/stores/habitsStore';
import { space } from '@/theme/tokens';

// Journey for people who are learning and checking themselves (design refresh Phase 19):
// their habits over the week and each self-check's history, where the dashboard is for
// people in treatment. Ticking things off stays on Today.

const openGuide = (id: string) => router.push({ pathname: '/learn/check/[id]', params: { id } });

export function MyHealth() {
  const { tracked } = useHabitPlan();
  const trackedIds = tracked.map((habit) => habit.id);
  const streak = useHabitsStore((state) => habitStreak(state.completedByDate, trackedIds));
  const { mine } = useSelfChecks();

  return (
    <Screen
      inTabs
      tab="journey"
      title="My health"
      subtitle="Your checks and habits over time"
      titleAside={<ProfileButton />}>
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

      <Section title="Self-checks">
        {mine.map((status) => (
          <ListRow
            key={status.guide.id}
            icon={iconForCancer(status.guide.cancerType)}
            title={status.guide.title}
            subtitle={checkHistory(status)}
            onPress={() => openGuide(status.guide.id)}
          />
        ))}
        <ListRow
          title={mine.length ? 'Choose your checks' : 'Choose the checks to follow'}
          titleTone="action"
          onPress={() => router.push('/profile/settings')}
        />
      </Section>

      <Section title="Going through treatment?">
        <ListRow
          icon="calendar"
          title="Set up Journey"
          subtitle="Daily check-ins, treatments, appointments and a summary for your doctor"
          onPress={() => router.push('/journey/focus')}
        />
      </Section>
      <Text variant="supporting" tone="muted" style={styles.footnote}>
        Due checks and today&apos;s habits are on Today.
      </Text>
    </Screen>
  );
}

/** "Done Oct 28, next Nov 28", or "Not done yet, due today". */
function checkHistory({ lastDone, due, label }: GuideStatus): string {
  if (!lastDone) return `Not done yet, ${label.toLowerCase()}`;
  return `Done ${formatShortDate(lastDone)}, next ${formatShortMonthDay(due)}`;
}

const styles = StyleSheet.create({
  week: { paddingHorizontal: space.xs },
  footnote: { paddingHorizontal: space.xs },
});
