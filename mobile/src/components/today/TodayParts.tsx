import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { newJourneyId } from '@/api/journey';
import { MoodPicker } from '@/components/journey/MoodPicker';
import { Button, Icon, ListRow, Section, Text } from '@/components/ui';
import { ProgressRing } from '@/components/learn/LearnSections';
import { useJourneyEntries, useSaveJourneyEntry } from '@/hooks/useJourney';
import { usePreventionTips } from '@/hooks/usePrevention';
import { formatShortDate, formatTime, isSameDay } from '@/lib/dates';
import { MOODS } from '@/lib/journeyLabels';
import { useHabitsStore } from '@/stores/habitsStore';
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
  const [editing, setEditing] = useState(false);
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
      onSuccess: () => setEditing(false),
      onError: () => showToast("Couldn't save your check-in. Try again.", 'error'),
    });
  };

  const openCheckIn = () =>
    router.push(
      today ? { pathname: '/journey/check-in', params: { id: today.id } } : '/journey/check-in',
    );

  if (saved && !editing) {
    return (
      <Section title="How are you feeling today?">
        <ListRow
          icon={saved.icon}
          iconTone={saved.tone}
          title={saved.label}
          subtitle="Saved for today"
          accessory={<Button title="Edit" variant="quiet" small onPress={() => setEditing(true)} />}
        />
        <ListRow title="Add pain, energy and symptoms" icon="activity" onPress={openCheckIn} />
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

/** Today's habits as one row: the ring and the count, opening Learn's Habits. */
export function HabitsRow() {
  const tips = usePreventionTips();
  const list = tips.data ?? [];
  const done = useHabitsStore((state) => list.filter((tip) => state.isDone(tip.id)).length);
  if (!list.length) return null;
  return (
    <Section>
      <ListRow
        leading={<ProgressRing done={done} total={list.length} />}
        title="Today's habits"
        subtitle={done ? `${done} of ${list.length} done` : 'Small steps that lower your risk'}
        onPress={() => router.navigate({ pathname: '/learn', params: { section: 'risk' } })}
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
