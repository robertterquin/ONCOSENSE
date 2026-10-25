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
  IconButton,
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
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
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
      <Screen back={{ label: 'Journey', onPress: close }}>
        <LoadingState message="Loading the treatment" />
      </Screen>
    );
  }
  return <TreatmentForm existing={existing} />;
}

function TreatmentForm({ existing }: { existing?: Treatment }) {
  const { palette } = useDesign();
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
      back={{ label: 'Journey', onPress: close }}
      title={existing ? 'Edit treatment' : 'New treatment'}
      bottomBar={
        <BottomActionBar>
          <Button title="Save" loading={save.isPending} onPress={submit} />
        </BottomActionBar>
      }>
      <Section title="Type" look="plain">
        <View style={styles.chips} accessibilityRole="radiogroup">
          {TREATMENT_TYPES.map((option) => (
            <Chip
              key={option}
              kind="radio"
              label={treatmentTypeLabel(option)}
              selected={type === option}
              onPress={() => setType(option)}
            />
          ))}
        </View>
      </Section>

      <TextField
        label="Name"
        placeholder="Chemotherapy, AC regimen"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (nameError) setNameError(null);
        }}
        error={nameError}
      />

      <View style={styles.field}>
        <Text variant="row">Start date</Text>
        <DateField
          value={startDate}
          onChange={setStartDate}
          maximumDate={new Date()}
          accessibilityLabel={`Start date, ${formatLongDate(startDate)}`}>
          <View
            style={[styles.box, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Icon name="calendar" size={20} tone="action" />
            <Text variant="body">{formatLongDate(startDate)}</Text>
          </View>
        </DateField>
      </View>

      {sessions ? (
        <Section look="card" divided={false}>
          <ListRow
            title="Number of sessions"
            subtitle={
              existing ? `${existing.completedSessions} done so far` : 'You can change this later'
            }
            accessory={
              <View style={styles.stepper}>
                <IconButton
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
                  icon="plus"
                  accessibilityLabel="One more session"
                  onPress={() => setTotalSessions((n) => Math.min(60, n + 1))}
                />
              </View>
            }
          />
        </Section>
      ) : null}

      <Section title="Side effects (optional)" look="plain">
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

      <TextField
        label="Notes (optional)"
        placeholder="Doctor, hospital, anything to remember"
        multiline
        value={notes}
        onChangeText={setNotes}
      />

      {existing ? (
        <>
          <Section look="card" divided={false}>
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
          </Section>
          <Button
            title="Delete treatment"
            variant="destructive"
            loading={remove.isPending}
            onPress={onDelete}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  field: { gap: space.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 54,
    paddingHorizontal: space.lg,
    borderRadius: radii.control,
    borderWidth: 1.5,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  count: { minWidth: 28, textAlign: 'center' },
});
