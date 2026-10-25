import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { newJourneyId } from '@/api/journey';
import {
  DateField,
  LoadingState,
  BottomActionBar,
  Button,
  Chip,
  Icon,
  Screen,
  Section,
  Text,
  TextField,
} from '@/components/ui';
import {
  useAppointments,
  useDeleteAppointment,
  useSaveAppointment,
  useTreatments,
} from '@/hooks/useJourney';
import { confirm } from '@/lib/confirm';
import { formatLongDate, formatTime } from '@/lib/dates';
import { showToast } from '@/stores/toastStore';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
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
      <Screen back={{ label: 'Journey', onPress: close }}>
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

  return (
    <Screen
      back={{ label: 'Journey', onPress: close }}
      title={existing ? 'Edit appointment' : 'New appointment'}
      subtitle="We'll remind you the evening before."
      bottomBar={
        <BottomActionBar>
          <Button title="Save" loading={save.isPending} onPress={submit} />
        </BottomActionBar>
      }>
      <TextField
        label="What is it for?"
        placeholder="Check-up, blood test, chemo"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (titleError) setTitleError(null);
        }}
        error={titleError}
      />

      <View style={styles.row}>
        <PickerBox
          label="Date"
          value={formatLongDate(startsAt)}
          icon="calendar"
          style={styles.flex1}>
          {(children) => (
            <DateField
              value={startsAt}
              onChange={keepTime}
              minimumDate={existing ? undefined : new Date()}
              accessibilityLabel={`Date, ${formatLongDate(startsAt)}`}>
              {children}
            </DateField>
          )}
        </PickerBox>
        <PickerBox label="Time" value={formatTime(startsAt)} icon="clock" style={styles.flex1}>
          {(children) => (
            <DateField
              mode="time"
              value={startsAt}
              onChange={setStartsAt}
              accessibilityLabel={`Time, ${formatTime(startsAt)}`}>
              {children}
            </DateField>
          )}
        </PickerBox>
      </View>

      <TextField
        label="Place (optional)"
        placeholder="Hospital, clinic or room"
        value={location}
        onChangeText={setLocation}
      />

      {treatments.data?.length ? (
        <Section title="Part of a treatment? (optional)" look="plain">
          <View style={styles.chips}>
            <Chip
              kind="radio"
              label="None"
              selected={treatmentId === null}
              onPress={() => setTreatmentId(null)}
            />
            {treatments.data.map((treatment) => (
              <Chip
                key={treatment.id}
                kind="radio"
                label={treatment.name}
                selected={treatmentId === treatment.id}
                onPress={() => setTreatmentId(treatment.id)}
              />
            ))}
          </View>
        </Section>
      ) : null}

      <TextField
        label="Notes (optional)"
        placeholder="Questions to ask, what to bring"
        multiline
        value={notes}
        onChangeText={setNotes}
      />

      {existing ? (
        <Button
          title="Delete appointment"
          variant="destructive"
          loading={remove.isPending}
          onPress={onDelete}
        />
      ) : null}
    </Screen>
  );
}

/** A labelled box showing a date or time; `children` wraps it in the picker. */
function PickerBox({
  label,
  value,
  icon,
  style,
  children,
}: {
  label: string;
  value: string;
  icon: 'calendar' | 'clock';
  style?: object;
  children: (box: React.ReactNode) => React.ReactNode;
}) {
  const { palette } = useDesign();
  return (
    <View style={[styles.picker, style]}>
      <Text variant="row">{label}</Text>
      {children(
        <View
          style={[styles.box, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Icon name={icon} size={20} tone="action" />
          <Text variant="body" numberOfLines={1} style={styles.flex1}>
            {value}
          </Text>
        </View>,
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  row: { gap: space.md },
  picker: { gap: space.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 54,
    paddingHorizontal: space.lg,
    borderRadius: radii.control,
    borderWidth: 1.5,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
