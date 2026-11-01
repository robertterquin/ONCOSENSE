import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { newJourneyId } from '@/api/journey';
import {
  Chip,
  DateRow,
  ListRow,
  LoadingState,
  PickerRow,
  Screen,
  Section,
  TextField,
} from '@/components/ui';
import {
  useAppointments,
  useDeleteAppointment,
  useSaveAppointment,
  useTreatments,
} from '@/hooks/useJourney';
import { confirm } from '@/lib/confirm';
import { formatLongDate, formatTime, isSameDay } from '@/lib/dates';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';
import type { Appointment } from '@/types/appointment';

// Add or edit an appointment (redesign Phase 4). Opened with `?id=` to edit.

const close = () => (router.canGoBack() ? router.back() : router.replace('/journey'));

/** Tomorrow at 9:00 AM: a sensible first guess for a new appointment. */
function defaultStart(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
}

export default function AppointmentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const appointments = useAppointments();
  const existing = appointments.data?.find((appointment) => appointment.id === id);
  if (id && !existing) {
    return (
      <Screen sheet={{ title: 'Appointment', onCancel: close }}>
        <LoadingState message="Loading the appointment" />
      </Screen>
    );
  }
  return <AppointmentForm existing={existing} />;
}

function AppointmentForm({ existing }: { existing?: Appointment }) {
  const treatments = useTreatments();
  const save = useSaveAppointment();
  const remove = useDeleteAppointment();
  const [title, setTitle] = useState(existing?.title ?? '');
  const [startsAt, setStartsAt] = useState(() => existing?.startsAt ?? defaultStart());
  const [location, setLocation] = useState(existing?.location ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [treatmentId, setTreatmentId] = useState(existing?.treatmentId ?? null);
  const [titleError, setTitleError] = useState<string | null>(null);

  const keepTime = (day: Date) => {
    const next = new Date(day);
    next.setHours(startsAt.getHours(), startsAt.getMinutes(), 0, 0);
    setStartsAt(next);
  };

  const submit = () => {
    if (!title.trim()) {
      setTitleError('Add what the appointment is for');
      return;
    }
    save.mutate(
      {
        id: existing?.id ?? newJourneyId('appt'),
        title: title.trim(),
        startsAt,
        location: location.trim() || null,
        notes: notes.trim() || null,
        treatmentId,
      },
      {
        onSuccess: () => {
          showToast(existing ? 'Appointment updated' : 'Appointment added', 'success');
          close();
        },
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  };

  const onDelete = async () => {
    if (!existing) return;
    const ok = await confirm({
      title: 'Delete this appointment?',
      message: `${existing.title} on ${formatLongDate(existing.startsAt)}. Its reminder is removed too.`,
      confirmText: 'Delete',
      cancelText: 'Keep',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(existing.id, {
      onSuccess: () => {
        showToast('Appointment deleted');
        close();
      },
      onError: (error) => showToast(error.message, 'error'),
    });
  };

  const quickDays = [
    { label: 'Today', date: addDays(0) },
    { label: 'Tomorrow', date: addDays(1) },
    { label: 'Next week', date: addDays(7) },
  ];

  return (
    <Screen
      sheet={{
        title: existing ? 'Edit appointment' : 'New appointment',
        onCancel: close,
        done: { label: 'Save', onPress: submit, loading: save.isPending },
      }}>
      <Section>
        <TextField
          grouped
          label="What is it for?"
          placeholder="Check-up, blood test, chemo"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (titleError) setTitleError(null);
          }}
          error={titleError}
        />
        <TextField
          grouped
          label="Place (optional)"
          placeholder="Hospital, clinic or room"
          value={location}
          onChangeText={setLocation}
        />
      </Section>

      <Section title="When" subtitle="We'll remind you the evening before.">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          accessibilityRole="radiogroup">
          {quickDays.map((day) => (
            <Chip
              key={day.label}
              kind="radio"
              label={day.label}
              selected={isSameDay(startsAt, day.date)}
              onPress={() => keepTime(day.date)}
            />
          ))}
        </ScrollView>
        <DateRow
          label="Date"
          text={formatLongDate(startsAt)}
          value={startsAt}
          onChange={keepTime}
          minimumDate={existing ? undefined : new Date()}
        />
        <DateRow
          label="Time"
          mode="time"
          text={formatTime(startsAt)}
          value={startsAt}
          onChange={setStartsAt}
        />
      </Section>

      {treatments.data?.length ? (
        <Section>
          <PickerRow
            label="Part of a treatment"
            value={treatmentId ?? NONE}
            onChange={(value) => setTreatmentId(value === NONE ? null : value)}
            options={[
              { value: NONE, label: 'None' },
              ...treatments.data.map((treatment) => ({
                value: treatment.id,
                label: treatment.name,
              })),
            ]}
          />
        </Section>
      ) : null}

      <Section>
        <TextField
          grouped
          label="Notes (optional)"
          placeholder="Questions to ask, what to bring"
          multiline
          value={notes}
          onChangeText={setNotes}
        />
      </Section>

      {existing ? (
        <Section>
          <ListRow
            icon="trash"
            iconTone="danger"
            title={remove.isPending ? 'Deleting' : 'Delete appointment'}
            titleTone="danger"
            onPress={remove.isPending ? undefined : onDelete}
          />
        </Section>
      ) : null}
    </Screen>
  );
}

const NONE = 'none';

/** A day `days` from today (the time is kept by `keepTime`). */
function addDays(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

const styles = StyleSheet.create({
  chips: { gap: space.sm, paddingTop: space.md, paddingBottom: space.xs },
});
