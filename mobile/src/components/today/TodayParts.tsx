import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { newJourneyId } from '@/api/journey';
import { MoodPicker } from '@/components/journey/MoodPicker';
import { Button, Icon, ListRow, Section, Text } from '@/components/ui';
import { awarenessForMonth } from '@/constants/awareness';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { useJourneyEntries, useSaveJourneyEntry } from '@/hooks/useJourney';
import { formatShortDate, formatTime, isSameDay } from '@/lib/dates';
import { MOODS } from '@/lib/journeyLabels';
import { cancerForAwareness } from '@/lib/learn';
import { showToast } from '@/stores/toastStore';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { Appointment } from '@/types/appointment';
import type { HealthTip } from '@/types/healthTip';
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

/** The tip of the day, linking to Learn's ways to lower your risk. */
export function TipCard({ tip }: { tip: HealthTip }) {
  const { palette } = useDesign();
  return (
    <Section title="Tip for today" look="tinted" tint="sun" divided>
      <View style={styles.tip}>
        <View style={[styles.tipWell, { backgroundColor: palette.surface }]}>
          <Icon name="lightbulb" tone="sunInk" />
        </View>
        <Text variant="body" style={styles.flex}>
          {tip.tip}
        </Text>
      </View>
      <ListRow
        title="More ways to lower your risk"
        titleTone="sunInk"
        onPress={() => router.navigate({ pathname: '/learn', params: { section: 'risk' } })}
      />
    </Section>
  );
}

/** This month's awareness campaign, opening its cancer type when Learn has it. */
export function AwarenessRow({ now }: { now: Date }) {
  const awareness = awarenessForMonth(now);
  const cancers = useCancerTypes();
  const cancer = cancers.data ? cancerForAwareness(cancers.data, awareness.title) : null;
  return (
    <Section>
      <ListRow
        icon="ribbon"
        title={`${awareness.title} Awareness Month`}
        subtitle={`${awareness.month}: ${awareness.subtitle.toLowerCase()}`}
        onPress={() =>
          cancer
            ? router.push({ pathname: '/learn/cancer/[id]', params: { id: cancer.id } })
            : router.navigate('/learn')
        }
      />
    </Section>
  );
}

/** Teal pointer to the Help tab. */
export function HelpRow() {
  return (
    <Section look="tinted" tint="helpTint">
      <ListRow
        icon="life-buoy"
        iconTone="help"
        title="Need someone to talk to?"
        titleTone="onHelpTint"
        subtitle="Free hotlines and support groups"
        subtitleTone="onHelpTint"
        onPress={() => router.navigate('/help')}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  moodPicker: { paddingTop: space.lg },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingTop: space.lg,
    paddingBottom: space.md,
  },
  tipWell: {
    width: 44,
    height: 44,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
