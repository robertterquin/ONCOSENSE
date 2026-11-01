import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { newJourneyId } from '@/api/journey';
import { MoodPicker } from '@/components/journey/MoodPicker';
import { Button, Icon, ListRow, Section, Text } from '@/components/ui';
import { ProgressRing } from '@/components/learn/LearnSections';
import { useJourneyEntries, useSaveJourneyEntry } from '@/hooks/useJourney';
import type { FollowStatus } from '@/hooks/useSelfChecks';
import { useHabitPlan } from '@/hooks/useHabits';
import { formatShortDate, formatTime, isSameDay } from '@/lib/dates';
import { checkInDetails, MOODS } from '@/lib/journeyLabels';
import { toDayKey, useHabitsStore } from '@/stores/habitsStore';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';
import type { Appointment } from '@/types/appointment';
import type { JourneyEntry } from '@/types/journeyEntry';

// Pieces of the redesigned Today tab (docs/redesign/03-phase-3-today-and-learn.md).

/** Quick mood for today's check-in; the full check-in adds pain, energy and symptoms. */
export function MoodCard({ now }: { now: Date }) {
  const entries = useJourneyEntries();
  const save = useSaveJourneyEntry();
  const today = entries.data?.find((entry) => isSameDay(entry.date, now));
  const saved = today ? MOODS.find((mood) => mood.value === today.moodLevel) : undefined;

  const saveMood = (moodLevel: number) => {
    const entry: JourneyEntry = today
      ? { ...today, moodLevel }
      : {
          id: newJourneyId(),
          date: now,
          moodLevel,
          painLevel: 0,
          energyLevel: 5,
          sleepQuality: 3,
          symptoms: [],
          notes: null,
          appointmentNotes: null,
          hasAppointment: false,
        };
    save.mutate(entry, {
      onError: () => showToast("Couldn't save your check-in. Try again.", 'error'),
    });
  };

  const openCheckIn = () =>
    router.push(
      today ? { pathname: '/journey/check-in', params: { id: today.id } } : '/journey/check-in',
    );

  // Once saved, one row opens the full check-in, where the mood can be changed too.
  if (today && saved) {
    return (
      <Section title="How are you feeling today?">
        <ListRow
          icon={saved.icon}
          title={`${saved.label}, saved for today`}
          subtitle={checkInDetails(today) ?? 'Add pain, energy and symptoms'}
          accessibilityHint="Opens today's check-in"
          onPress={openCheckIn}
        />
      </Section>
    );
  }

  return (
    <Section title="How are you feeling today?" divided={false}>
      <View style={styles.moodPicker}>
        <MoodPicker
          value={today?.moodLevel ?? null}
          onChange={saveMood}
          disabled={save.isPending}
        />
      </View>
      <Button title="Add pain, energy and symptoms" variant="quiet" onPress={openCheckIn} />
    </Section>
  );
}

/** The next two appointments; hidden when there are none. */
export function ComingUpToday({ appointments }: { appointments: Appointment[] }) {
  if (!appointments.length) return null;
  return (
    <Section title="Coming up">
      {appointments.map((appointment) => (
        <ListRow
          key={appointment.id}
          icon="calendar"
          title={appointment.title}
          subtitle={`${formatShortDate(appointment.startsAt)}, ${formatTime(appointment.startsAt)}`}
          onPress={() =>
            router.push({ pathname: '/journey/appointment', params: { id: appointment.id } })
          }
        />
      ))}
    </Section>
  );
}

/** Today's habits as one row: the ring and what's left, opening the Habits screen. */
export function HabitsRow() {
  const { tracked } = useHabitPlan();
  const today = useHabitsStore((state) => state.completedByDate[toDayKey()]);
  const undone = tracked.filter((habit) => !today?.includes(habit.id));
  const done = tracked.length - undone.length;
  if (!tracked.length) return null;
  return (
    <Section>
      <ListRow
        leading={<ProgressRing done={done} total={tracked.length} />}
        title="Today's habits"
        subtitle={
          undone.length === 0
            ? 'All done today'
            : undone.length === 1
              ? `1 left: ${undone[0].title.toLowerCase()}`
              : `${undone.length} left today`
        }
        onPress={() => router.push('/habits')}
      />
    </Section>
  );
}

/** Shown at the top only after a Rough or Low check-in, so it stands out when it matters. */
export function SupportCard() {
  return (
    <Section look="tinted" tint="helpTint">
      <View style={styles.support}>
        <Icon name="life-buoy" tone="help" />
        <Text variant="strong" tone="onHelpTint" accessibilityRole="header" style={styles.flex}>
          Rough day? You don&apos;t have to carry it alone.
        </Text>
      </View>
      <Text variant="body" tone="onHelpTint">
        Free, confidential hotlines and support groups are in Help.
      </Text>
      <Button title="Talk to someone" variant="help" onPress={() => router.navigate('/help')} />
    </Section>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  moodPicker: { paddingTop: space.lg },
  support: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});

/**
 * Screening tests and warning-sign questions that are due (design refresh Phase 23), under
 * the self-checks. Hidden when nothing is due.
 */
export function DueToday({
  screenings,
  signs,
}: {
  screenings: FollowStatus[];
  signs: FollowStatus[];
}) {
  const tests = screenings.filter((item) => item.isDue && item.test);
  const prompts = signs.filter((item) => item.isDue && item.cancer);
  if (!tests.length && !prompts.length) return null;
  return (
    <Section title="Also due">
      {tests.map(({ test, lastDone }) => (
        <ListRow
          key={test!.id}
          icon="hospital"
          iconTone="help"
          title={test!.title}
          subtitle={lastDone ? 'Due now' : 'Due now: not recorded yet'}
          onPress={() => router.push({ pathname: '/screening/[id]', params: { id: test!.id } })}
        />
      ))}
      {prompts.map(({ cancer, cancerKey }) => (
        <ListRow
          key={cancerKey}
          icon="info"
          title={`${cancer!.name}: warning signs`}
          subtitle="A quick question, every 3 months"
          onPress={() => router.push({ pathname: '/signs/[id]', params: { id: cancerKey } })}
        />
      ))}
    </Section>
  );
}
