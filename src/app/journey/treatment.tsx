import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { newJourneyId } from '@/api/journey';
import {
  Chip,
  DateRow,
  IconButton,
  LoadingState,
  PickerRow,
  ListRow,
  Screen,
  Section,
  Switch,
  Text,
  TextField,
} from '@/components/ui';
import { useDeleteTreatment, useSaveTreatment, useTreatments } from '@/hooks/useJourney';
import { confirm } from '@/lib/confirm';
import { formatLongDate } from '@/lib/dates';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';
import {
  TREATMENT_TYPES,
  treatmentTypeLabel,
  type Treatment,
  type TreatmentType,
} from '@/types/treatment';

// Add or edit a treatment (redesign Phase 4). Opened with `?id=` to edit. Started as a
// port of lib/screens/journey/add_treatment_screen.dart.

const close = () => (router.canGoBack() ? router.back() : router.replace('/journey'));

const SIDE_EFFECTS = [
  'Fatigue',
  'Nausea',
  'Hair Loss',
  'Appetite Changes',
  'Pain',
  'Numbness',
  'Skin Changes',
  'Memory Issues',
  'Mouth Sores',
  'Weight Changes',
  'Insomnia',
  'Anxiety',
];

/** Surgery and "other" are usually one event, not a course of sessions. */
const hasSessions = (type: TreatmentType) => type !== 'surgery' && type !== 'other';

export default function TreatmentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const treatments = useTreatments();
  const existing = treatments.data?.find((treatment) => treatment.id === id);
  if (id && !existing) {
    return (
      <Screen sheet={{ title: 'Treatment', onCancel: close }}>
        <LoadingState message="Loading the treatment" />
      </Screen>
    );
  }
  return <TreatmentForm existing={existing} />;
}

function TreatmentForm({ existing }: { existing?: Treatment }) {
  const save = useSaveTreatment();
  const remove = useDeleteTreatment();
  const [type, setType] = useState<TreatmentType>(existing?.type ?? 'chemotherapy');
  const [name, setName] = useState(existing?.name ?? '');
  const [startDate, setStartDate] = useState(() => existing?.startDate ?? new Date());
  const [totalSessions, setTotalSessions] = useState(existing?.totalSessions ?? 6);
  const [sideEffects, setSideEffects] = useState<string[]>(existing?.sideEffects ?? []);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [nameError, setNameError] = useState<string | null>(null);
  const sessions = hasSessions(type);

  const toggleEffect = (effect: string) =>
    setSideEffects((list) =>
      list.includes(effect) ? list.filter((item) => item !== effect) : [...list, effect],
    );

  const submit = () => {
    if (!name.trim()) {
      setNameError('Add a name, like "Chemotherapy, AC regimen"');
      return;
    }
    const total = sessions ? totalSessions : 0;
    save.mutate(
      {
        id: existing?.id ?? newJourneyId(),
        name: name.trim(),
        type,
        startDate,
        endDate: null,
        doctorName: null,
        hospitalName: null,
        notes: notes.trim() || null,
        totalSessions: total,
        completedSessions: Math.min(existing?.completedSessions ?? 0, total),
        sideEffects,
        isActive,
      },
      {
        onSuccess: () => {
          showToast(existing ? 'Treatment updated' : 'Treatment added', 'success');
          close();
        },
        onError: (error) => showToast(`Couldn't save: ${error.message}`, 'error'),
      },
    );
  };

  const onDelete = async () => {
    if (!existing) return;
    const ok = await confirm({
      title: 'Delete this treatment?',
      message: `${existing.name} and its session count will be removed. Milestones stay.`,
      confirmText: 'Delete',
      cancelText: 'Keep',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(existing.id, {
      onSuccess: () => {
        showToast('Treatment deleted');
        close();
      },
      onError: (error) => showToast(error.message, 'error'),
    });
  };

  return (
    <Screen
      sheet={{
        title: existing ? 'Edit treatment' : 'New treatment',
        onCancel: close,
        done: { label: 'Save', onPress: submit, loading: save.isPending },
      }}>
      <Section>
        <PickerRow
          label="Type"
          value={type}
          onChange={setType}
          options={TREATMENT_TYPES.map((option) => ({
            value: option,
            label: treatmentTypeLabel(option),
          }))}
        />
        <TextField
          grouped
          label="Name"
          placeholder="Chemotherapy, AC regimen"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError) setNameError(null);
          }}
          error={nameError}
        />
      </Section>

      <Section>
        <DateRow
          label="Started"
          text={formatLongDate(startDate)}
          value={startDate}
          onChange={setStartDate}
          maximumDate={new Date()}
        />
        {sessions ? (
          <ListRow
            title="Sessions"
            subtitle={
              existing
                ? `${existing.completedSessions} done so far`
                : 'How many in total. You can change this later.'
            }
            accessory={
              <View style={styles.stepper}>
                <IconButton
                  size={44}
                  icon="minus"
                  accessibilityLabel="One session fewer"
                  onPress={() => setTotalSessions((n) => Math.max(1, n - 1))}
                />
                <Text
                  variant="strong"
                  style={styles.count}
                  accessibilityLabel={`${totalSessions} sessions`}>
                  {totalSessions}
                </Text>
                <IconButton
                  size={44}
                  icon="plus"
                  accessibilityLabel="One more session"
                  onPress={() => setTotalSessions((n) => Math.min(60, n + 1))}
                />
              </View>
            }
          />
        ) : null}
        {existing ? (
          <ListRow
            title="Still ongoing"
            subtitle={isActive ? 'Shown as in progress' : 'Shown as finished'}
            accessory={
              <Switch
                accessibilityLabel="Still ongoing"
                value={isActive}
                onValueChange={setIsActive}
              />
            }
          />
        ) : null}
      </Section>

      <Section title="Side effects" subtitle="Optional. Choose all that apply." look="plain">
        <View style={styles.chips}>
          {SIDE_EFFECTS.map((effect) => (
            <Chip
              key={effect}
              label={effect}
              selected={sideEffects.includes(effect)}
              onPress={() => toggleEffect(effect)}
            />
          ))}
        </View>
      </Section>

      <Section>
        <TextField
          grouped
          label="Notes (optional)"
          placeholder="Doctor, hospital, anything to remember"
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
            title={remove.isPending ? 'Deleting' : 'Delete treatment'}
            titleTone="danger"
            onPress={remove.isPending ? undefined : onDelete}
          />
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  count: { minWidth: 28, textAlign: 'center' },
});
