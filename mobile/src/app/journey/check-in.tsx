import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { newJourneyId } from '@/api/journey';
import { MoodPicker } from '@/components/journey/MoodPicker';
import {
  BottomActionBar,
  Button,
  Chip,
  Icon,
  ListRow,
  LoadingState,
  PressableScale,
  Screen,
  Section,
  SliderRow,
  Text,
  TextField,
  type IconName,
} from '@/components/ui';
import { useFocus } from '@/hooks/useFocus';
import { useDeleteJourneyEntry, useJourneyEntries, useSaveJourneyEntry } from '@/hooks/useJourney';
import { confirm } from '@/lib/confirm';
import { formatLongDate, isSameDay } from '@/lib/dates';
import { forFocus } from '@/lib/focus';
import { haptics } from '@/lib/haptics';
import { energyValueText, painValueText, SLEEP } from '@/lib/journeyLabels';
import { showToast } from '@/stores/toastStore';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import { COMMON_SYMPTOMS, type JourneyEntry } from '@/types/journeyEntry';

// The daily check-in (redesign Phase 4; a sheet with mood first since Phase 18). Opened
// with `?id=` to edit an older entry; without it, today's entry is edited if there is
// one. Voice notes use the keyboard's dictation key.

const close = () => (router.canGoBack() ? router.back() : router.replace('/journey'));

/** Shown before "More symptoms". */
const FIRST_SYMPTOMS = 10;

export default function CheckInScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const entries = useJourneyEntries();
  if (entries.isPending) {
    return (
      <Screen sheet={{ title: 'Check-in', onCancel: close }}>
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
  // An older entry opens with what it recorded beyond the defaults.
  const [open, setOpen] = useState<Record<Part, boolean>>({
    body: false,
    sleep: false,
    symptoms: Boolean(existing?.symptoms.length),
    note: Boolean(existing?.notes),
  });
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
  const sleepLabel = SLEEP.find((option) => option.value === sleep)?.label ?? '';
  const toggle = (part: Part) => setOpen((list) => ({ ...list, [part]: !list[part] }));

  return (
    <Screen
      sheet={{
        title: isToday ? 'Check-in' : 'Edit check-in',
        onCancel: close,
        done: { label: 'Save', onPress: submit, loading: save.isPending },
      }}
      bottomBar={
        <BottomActionBar>
          <Button title="Save check-in" loading={save.isPending} onPress={submit} />
        </BottomActionBar>
      }>
      <Section
        title={they('How are you feeling?', 'How are they feeling?')}
        subtitle={formatLongDate(existing?.date ?? new Date())}
        divided={false}>
        <View style={styles.padded}>
          <MoodPicker value={mood} onChange={setMood} />
        </View>
      </Section>

      {/* Only the mood is needed; the rest folds open in place, so a hard day is one tap. */}
      <Section title="Add more" subtitle="Optional">
        <Fold
          icon="activity"
          title="Pain and energy"
          summary={`Pain ${pain} of 10, energy ${energy} of 10`}
          open={open.body}
          onToggle={() => toggle('body')}>
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
        </Fold>
        <Fold
          icon="moon"
          title={they('Sleep', 'Their sleep')}
          summary={sleepLabel}
          open={open.sleep}
          onToggle={() => toggle('sleep')}>
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
        </Fold>
        <Fold
          icon="stethoscope"
          title="Symptoms"
          summary={symptoms.length ? symptoms.join(', ') : 'None'}
          open={open.symptoms}
          onToggle={() => toggle('symptoms')}>
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
        </Fold>
        <Fold
          icon="message"
          title="Note"
          summary={notes.trim() || 'None'}
          open={open.note}
          onToggle={() => toggle('note')}>
          <TextField
            label="Note"
            placeholder="Anything you want to remember or tell your doctor"
            multiline
            value={notes}
            onChangeText={setNotes}
          />
          <Text variant="caption" tone="muted">
            Tip: use the microphone on your keyboard to speak your notes.
          </Text>
        </Fold>
      </Section>

      {existing ? (
        <Section>
          <ListRow
            icon="trash"
            iconTone="danger"
            title={remove.isPending ? 'Deleting' : 'Delete check-in'}
            titleTone="danger"
            onPress={remove.isPending ? undefined : onDelete}
          />
        </Section>
      ) : null}
    </Screen>
  );
}

type Part = 'body' | 'sleep' | 'symptoms' | 'note';

/** A row that opens its controls underneath, showing the current answer while closed. */
function Fold({
  icon,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  icon: IconName;
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const { palette } = useDesign();
  return (
    <View>
      <PressableScale
        feedback="fade"
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${summary}`}
        accessibilityState={{ expanded: open }}
        onPress={() => {
          haptics.selection();
          onToggle();
        }}
        style={styles.foldRow}>
        <View style={[styles.tile, { backgroundColor: palette.raised }]}>
          <Icon name={icon} size={20} tone="action" />
        </View>
        <View style={styles.flex1}>
          <Text variant="row">{title}</Text>
          <Text variant="supporting" tone="muted" numberOfLines={1}>
            {summary}
          </Text>
        </View>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={22} tone="muted" />
      </PressableScale>
      {open ? <View style={styles.foldBody}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  padded: { paddingVertical: space.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  flex1: { flex: 1 },
  foldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: sizes.row - 8,
    paddingVertical: space.sm,
  },
  tile: {
    width: 36,
    height: 36,
    borderRadius: radii.tile - 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foldBody: { gap: space.lg, paddingBottom: space.lg },
});
