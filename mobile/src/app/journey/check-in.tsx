import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { newJourneyId } from '@/api/journey';
import { AppHeader } from '@/components/AppHeader';
import { PinkSwitch } from '@/components/PinkSwitch';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import {
  ChipSelect,
  EmojiScale,
  FormBox,
  FormSection,
  LevelSlider,
} from '@/components/journey/FormSection';
import { Screen } from '@/components/Screen';
import { useJourneyEntries, useSaveJourneyEntry } from '@/hooks/useJourney';
import { energyColor, energyLabel, MOODS, painColor, painLabel } from '@/lib/journeyLabels';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { COMMON_SYMPTOMS, type JourneyEntry } from '@/types/journeyEntry';

// Port of lib/screens/journey/add_entry_screen.dart. Opened with `?id=` to edit.

const SLEEP = [
  { emoji: '😫', label: 'Terrible', value: 1 },
  { emoji: '😴', label: 'Poor', value: 2 },
  { emoji: '😑', label: 'Fair', value: 3 },
  { emoji: '😊', label: 'Good', value: 4 },
  { emoji: '🌟', label: 'Excellent', value: 5 },
];

export default function AddEntryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useJourneyEntries().data?.find((entry) => entry.id === id);
  // Mount the form once the entry being edited is available.
  if (id && !existing) return <Screen header={<Header editing />}>{null}</Screen>;
  return <EntryForm existing={existing} />;
}

function Header({ editing }: { editing: boolean }) {
  return (
    <AppHeader
      title={editing ? 'Edit Entry' : 'Daily Check-in'}
      subtitle={editing ? 'Update your health status' : 'Track your daily wellness'}
      showBackButton
    />
  );
}

function EntryForm({ existing }: { existing?: JourneyEntry }) {
  const { colors, isDark } = useTheme();
  const save = useSaveJourneyEntry();
  const [mood, setMood] = useState(existing?.moodLevel ?? 3);
  const [pain, setPain] = useState(existing?.painLevel ?? 0);
  // The database requires energy 1–10 (Flutter's slider allowed 0, which failed to save).
  const [energy, setEnergy] = useState(Math.max(1, existing?.energyLevel ?? 5));
  const [sleep, setSleep] = useState(existing?.sleepQuality ?? 3);
  const [symptoms, setSymptoms] = useState<string[]>(existing?.symptoms ?? []);
  const [hasAppointment, setHasAppointment] = useState(existing?.hasAppointment ?? false);
  const [appointmentNotes, setAppointmentNotes] = useState(existing?.appointmentNotes ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const submit = () =>
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
        hasAppointment,
        appointmentNotes: appointmentNotes.trim() || null,
      },
      {
        onSuccess: () => {
          router.back();
          showToast(
            existing ? 'Entry updated!' : 'Entry added! Keep up the great work! 💪',
            'success',
          );
        },
        onError: (error) => showToast(`Error saving entry: ${error.message}`, 'error'),
      },
    );

  const muted = isDark ? 'rgba(255,255,255,0.6)' : '#757575';
  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.divider }];

  return (
    <Screen header={<Header editing={!!existing} />}>
      <FormSection title="How are you feeling today?" icon="sentiment_satisfied_alt">
        <EmojiScale options={MOODS} value={mood} onChange={setMood} color={brand.headerPink} />
      </FormSection>
      <FormSection title="Pain Level" icon="healing">
        <LevelSlider
          value={pain}
          min={0}
          max={10}
          color={painColor(pain)}
          label={painLabel(pain)}
          onChange={setPain}
          accessibilityLabel="Pain level"
        />
      </FormSection>
      <FormSection title="Energy Level" icon="battery_charging_full">
        <LevelSlider
          value={energy}
          min={1}
          max={10}
          color={energyColor(energy)}
          label={energyLabel(energy)}
          onChange={setEnergy}
          accessibilityLabel="Energy level"
        />
      </FormSection>
      <FormSection title="Sleep Quality Last Night" icon="bedtime">
        <EmojiScale
          options={SLEEP}
          value={sleep}
          onChange={setSleep}
          color="#9C27B0"
          showEmoji={false}
        />
      </FormSection>
      <FormSection title="Any symptoms today?" icon="medical_information">
        <ChipSelect options={COMMON_SYMPTOMS} selected={symptoms} onChange={setSymptoms} />
      </FormSection>
      <FormSection title="Doctor's Appointment" icon="event">
        <FormBox style={styles.gap}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <AppText variant="label">Had a doctor&apos;s appointment today?</AppText>
              <AppText variant="bodySmall" color={muted}>
                Add notes from your visit
              </AppText>
            </View>
            <PinkSwitch
              accessibilityLabel="Had a doctor's appointment today"
              value={hasAppointment}
              onValueChange={setHasAppointment}
            />
          </View>
          {hasAppointment ? (
            <TextInput
              accessibilityLabel="Appointment notes"
              placeholder="What did the doctor say?"
              placeholderTextColor={colors.inputPlaceholder}
              value={appointmentNotes}
              onChangeText={setAppointmentNotes}
              multiline
              style={inputStyle}
            />
          ) : null}
        </FormBox>
      </FormSection>
      <FormSection title="Additional Notes" icon="notes">
        <FormBox>
          <TextInput
            accessibilityLabel="Additional notes"
            placeholder="How was your day? Any thoughts or feelings you want to record?"
            placeholderTextColor={colors.inputPlaceholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            style={[...inputStyle, styles.notes]}
          />
        </FormBox>
      </FormSection>
      <Button
        title={existing ? 'Update Entry' : 'Save Entry'}
        onPress={submit}
        loading={save.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: {
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: 12,
    minHeight: 70,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  notes: { minHeight: 100 },
});
