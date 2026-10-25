import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { newJourneyId } from '@/api/journey';
import { MoodPicker } from '@/components/journey/MoodPicker';
import {
  LoadingState,
  BottomActionBar,
  Button,
  Chip,
  Screen,
  Section,
  SliderRow,
  Text,
  TextField,
} from '@/components/ui';
import { useFocus } from '@/hooks/useFocus';
import { useDeleteJourneyEntry, useJourneyEntries, useSaveJourneyEntry } from '@/hooks/useJourney';
import { confirm } from '@/lib/confirm';
import { formatLongDate, isSameDay } from '@/lib/dates';
import { forFocus } from '@/lib/focus';
import { energyValueText, painValueText, SLEEP } from '@/lib/journeyLabels';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';
import { COMMON_SYMPTOMS, type JourneyEntry } from '@/types/journeyEntry';

// The daily check-in (redesign Phase 4). Opened with `?id=` to edit an older entry;
// without it, today's entry is edited if there is one. Voice notes use the keyboard's
// dictation key.

const close = () => (router.canGoBack() ? router.back() : router.replace('/journey'));

/** Shown before "More symptoms". */
const FIRST_SYMPTOMS = 10;

export default function CheckInScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const entries = useJourneyEntries();
  if (entries.isPending) {
    return (
      <Screen back={{ label: 'Journey', onPress: close }}>
        <LoadingState message="Loading your check-ins" />
      </Screen>
    );
  }
  const list = entries.data ?? [];
  const existing = id
    ? list.find((entry) => entry.id === id)
    : list.find((entry) => isSameDay(entry.date, new Date()));
  // Mount the form once the entry being edited is known, so it starts with its values.
  return <CheckInForm key={existing?.id ?? 'new'} existing={existing} />;
}

function CheckInForm({ existing }: { existing?: JourneyEntry }) {
  const focus = useFocus();
  const save = useSaveJourneyEntry();
  const remove = useDeleteJourneyEntry();
  const [mood, setMood] = useState<number | null>(existing?.moodLevel ?? null);
  const [pain, setPain] = useState(existing?.painLevel ?? 0);
  // The database requires energy 1–10.
  const [energy, setEnergy] = useState(Math.max(1, existing?.energyLevel ?? 5));
  const [sleep, setSleep] = useState(existing?.sleepQuality ?? 3);
  const [symptoms, setSymptoms] = useState<string[]>(existing?.symptoms ?? []);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [allSymptoms, setAllSymptoms] = useState(
    () =>
      existing?.symptoms.some((s) => !COMMON_SYMPTOMS.slice(0, FIRST_SYMPTOMS).includes(s)) ??
      false,
  );
  const isToday = !existing || isSameDay(existing.date, new Date());
  const they = (self: string, caregiver: string) => forFocus(focus, self, caregiver);

  const toggleSymptom = (name: string) =>
    setSymptoms((list) =>
      list.includes(name) ? list.filter((item) => item !== name) : [...list, name],
    );

  const submit = () => {
    if (mood === null) {
      showToast(they('Choose how you feel first', 'Choose how they feel first'), 'error');
      return;
    }
    save.mutate(
      {
        id: existing?.id ?? newJourneyId(),
        date: existing?.date ?? new Date(),
        moodLevel: mood,
        painLevel: pain,
        energyLevel: energy,
        sleepQuality: sleep,
        symptoms,
        notes: notes.trim() || null,
        // Kept from older entries; the redesign tracks appointments separately.
        hasAppointment: existing?.hasAppointment ?? false,
        appointmentNotes: existing?.appointmentNotes ?? null,
      },
      {
        onSuccess: () => {
          showToast('Check-in saved', 'success');
          close();
        },
        onError: (error) => showToast(`Couldn't save: ${error.message}`, 'error'),
      },
    );
  };

  const onDelete = async () => {
    if (!existing) return;
    const ok = await confirm({
      title: 'Delete this check-in?',
      message: `The check-in from ${formatLongDate(existing.date)} will be removed.`,
      confirmText: 'Delete',
      cancelText: 'Keep',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(existing.id, {
      onSuccess: () => {
        showToast('Check-in deleted');
        close();
      },
      onError: (error) => showToast(error.message, 'error'),
    });
  };

  const shownSymptoms = allSymptoms ? COMMON_SYMPTOMS : COMMON_SYMPTOMS.slice(0, FIRST_SYMPTOMS);

  return (
    <Screen
      back={{ label: 'Journey', onPress: close }}
      title={isToday ? 'Daily check-in' : 'Edit check-in'}
      subtitle={formatLongDate(existing?.date ?? new Date())}
      bottomBar={
        <BottomActionBar>
          <Button title="Save check-in" loading={save.isPending} onPress={submit} />
        </BottomActionBar>
      }>
      <Section title={they('How are you feeling?', 'How are they feeling?')} divided={false}>
        <View style={styles.padded}>
          <MoodPicker value={mood} onChange={setMood} />
        </View>
      </Section>

      <Section title="Pain and energy" divided={false}>
        <View style={styles.padded}>
          <SliderRow
            label="Pain"
            value={pain}
            min={0}
            max={10}
            onChange={setPain}
            valueText={painValueText(pain)}
            minLabel="No pain"
            maxLabel="Worst pain"
          />
          <SliderRow
            label="Energy"
            value={energy}
            min={1}
            max={10}
            onChange={setEnergy}
            valueText={energyValueText(energy)}
            minLabel="Exhausted"
            maxLabel="Full of energy"
          />
        </View>
      </Section>

      <Section title={they('How did you sleep?', 'How did they sleep?')} look="plain">
        <View style={styles.chips} accessibilityRole="radiogroup">
          {SLEEP.map((option) => (
            <Chip
              key={option.value}
              kind="radio"
              label={option.label}
              selected={sleep === option.value}
              onPress={() => setSleep(option.value)}
            />
          ))}
        </View>
      </Section>

      <Section title="Any symptoms?" subtitle="Choose all that apply" look="plain">
        <View style={styles.chips}>
          {shownSymptoms.map((name) => (
            <Chip
              key={name}
              label={name}
              selected={symptoms.includes(name)}
              onPress={() => toggleSymptom(name)}
            />
          ))}
        </View>
        {allSymptoms ? null : (
          <Button
            title="More symptoms"
            variant="quiet"
            fullWidth={false}
            onPress={() => setAllSymptoms(true)}
          />
        )}
      </Section>

      <TextField
        label="Notes (optional)"
        placeholder="Anything you want to remember or tell your doctor"
        multiline
        value={notes}
        onChangeText={setNotes}
      />
      <Text variant="caption" tone="muted">
        Tip: use the microphone on your keyboard to speak your notes.
      </Text>

      {existing ? (
        <Button
          title="Delete check-in"
          variant="destructive"
          loading={remove.isPending}
          onPress={onDelete}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: { paddingVertical: space.lg, gap: space.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
