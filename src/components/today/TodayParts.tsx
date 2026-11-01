import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { newJourneyId } from '@/api/journey';
import { MoodPicker } from '@/components/journey/MoodPicker';
import { Button, Icon, ListRow, Section, Text } from '@/components/ui';
import { ProgressRing } from '@/components/learn/LearnSections';
import { useJourneyEntries, useSaveJourneyEntry } from '@/hooks/useJourney';
import { useSaveFocus } from '@/hooks/useFocus';
import { useHabitPlan } from '@/hooks/useHabits';
import { addDays, formatShortDate, formatTime, isSameDay } from '@/lib/dates';
import { startOfDay } from '@/lib/selfCheck';
import { checkInDetails, MOODS } from '@/lib/journeyLabels';
import { iconForCancer } from '@/lib/learn';
import { toDayKey, useHabitsStore } from '@/stores/habitsStore';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';
import type { Appointment } from '@/types/appointment';
import type { CancerType } from '@/types/cancerType';
import type { JourneyEntry } from '@/types/journeyEntry';

// Pieces of the redesigned Today tab (docs/redesign/03-phase-3-today-and-learn.md).

/** Quick mood for today's check-in; the full check-in adds pain, energy and symptoms. */
export function MoodCard({ now, weekly = false }: { now: Date; weekly?: boolean }) {
  const entries = useJourneyEntries();
  const save = useSaveJourneyEntry();
  const today = entries.data?.find((entry) => isSameDay(entry.date, now));
  // After treatment, once a week is enough: the card steps aside after any check-in in
  // the last 7 days (Journey shows it).
  const weekStart = addDays(startOfDay(now), -6);
  const thisWeek = weekly && entries.data?.some((entry) => entry.date >= weekStart);
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

  if (thisWeek || (weekly && entries.isPending)) return null;

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
    <Section title={weekly ? "How's this week?" : 'How are you feeling today?'} divided={false}>
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
export function ComingUpToday({
  appointments,
  title = 'Coming up',
}: {
  appointments: Appointment[];
  title?: string;
}) {
  if (!appointments.length) return null;
  return (
    <Section title={title}>
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

/**
 * Once, for accounts that chose "Caring for someone" before it was retired (November
 * 2026). "Got it" saves the new focus, which also stops this showing. Their check-ins
 * and appointments stay in the account; Journey just doesn't show them.
 */
export function CaregiverRetiredCard() {
  const saveFocus = useSaveFocus();
  return (
    <Section look="tinted">
      <Text variant="strong" tone="onActionTint" accessibilityRole="header">
        Caregiver mode has been retired
      </Text>
      <Text variant="body" tone="onActionTint">
        OncoSense now focuses on your own health. The check-ins you kept for someone else are saved,
        not deleted.
      </Text>
      <Button
        title="Got it"
        variant="tinted"
        loading={saveFocus.isPending}
        onPress={() =>
          saveFocus.mutate('learning', { onError: (error) => showToast(error.message, 'error') })
        }
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
 * Patient Mode on Today: quick access to the person's cancer guide (or adding it) and
 * the printable doctor summary, replacing the general prevention checks list.
 */
export function YourCancerTodayCard({ cancer }: { cancer: CancerType | null }) {
  return (
    <Section title="Your cancer">
      {cancer ? (
        <ListRow
          icon={iconForCancer(cancer.name)}
          iconTone="action"
          title={`${cancer.name} guide`}
          subtitle="Treatments, early signs and questions to ask"
          onPress={() => router.push({ pathname: '/learn/cancer/[id]', params: { id: cancer.id } })}
        />
      ) : (
        <ListRow
          icon="plus"
          title="Add your cancer"
          subtitle="Shows its guide and treatment tips here"
          titleTone="action"
          onPress={() => router.push('/journey/cancer')}
        />
      )}
      <ListRow
        icon="share"
        iconTone="help"
        title="Share summary with my doctor"
        subtitle="Your recent check-ins, pain and treatments"
        onPress={() => router.push('/journey/summary')}
      />
    </Section>
  );
}
