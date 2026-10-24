import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { DateField } from '@/components/DateField';
import {
  BottomActionBar,
  Button,
  Chip,
  Icon,
  ProgressSegments,
  Screen,
  Section,
  Text,
} from '@/components/ui';
import { useFocus, useSaveFocus } from '@/hooks/useFocus';
import { useJourneySetup, useStartJourney } from '@/hooks/useJourney';
import { addDays, formatLongDate } from '@/lib/dates';
import { FOCUS_OPTIONS, forFocus, type JourneyFocus } from '@/lib/focus';
import { rescheduleCheckInReminder } from '@/lib/notifications/service';
import { useIsSignedIn } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// "What brings you here?" (redesign Phase 4): after sign-up, and from Journey or
// Profile to change it. Treatment, Finished and Caring go on to a few dates.

const leave = () => (router.canGoBack() ? router.back() : router.replace('/today'));

const QUICK_DATES = [
  { label: 'Today', daysAgo: 0 },
  { label: '1 month ago', daysAgo: 30 },
  { label: '3 months ago', daysAgo: 90 },
  { label: '6 months ago', daysAgo: 180 },
  { label: '1 year ago', daysAgo: 365 },
];

export default function FocusScreen() {
  const current = useFocus();
  const signedIn = useIsSignedIn();
  const setup = useJourneySetup();
  const saveFocus = useSaveFocus();
  const startJourney = useStartJourney();
  const [focus, setFocus] = useState<JourneyFocus | null>(current);
  const [step, setStep] = useState<'focus' | 'dates'>('focus');
  const [startDate, setStartDate] = useState(() => setup.diagnosisDate ?? new Date());
  const [finishedDate, setFinishedDate] = useState(() => setup.cancerFreeDate ?? new Date());
  const saving = saveFocus.isPending || startJourney.isPending;

  const done = (message: string) => {
    showToast(message, 'success');
    // The daily check-in reminder is only for Journey focuses.
    void rescheduleCheckInReminder();
    router.replace(focus === 'learning' ? '/today' : '/journey');
  };

  const next = () => {
    if (!focus) return;
    // Learning needs no dates; guests have no account to keep a journey in.
    if (focus === 'learning' || !signedIn) {
      saveFocus.mutate(focus, {
        onSuccess: () => done('Saved. You can change this any time in Profile.'),
        onError: (error) => showToast(error.message, 'error'),
      });
      return;
    }
    setStep('dates');
  };

  const finish = () => {
    if (!focus) return;
    startJourney.mutate(
      {
        focus,
        diagnosisDate: startDate,
        cancerFreeDate: focus === 'finished' ? finishedDate : null,
      },
      {
        onSuccess: () => done('Your journey is set up.'),
        onError: (error) => showToast(`Couldn't save: ${error.message}`, 'error'),
      },
    );
  };

  if (step === 'dates' && focus) {
    return (
      <Screen
        back={{ label: 'Back', onPress: () => setStep('focus') }}
        title={forFocus(focus, 'A few dates', 'A few dates about them')}
        subtitle="They help Journey show how things change over time. You can change them later."
        bottomBar={
          <BottomActionBar>
            <Button title="Finish" loading={saving} onPress={finish} />
          </BottomActionBar>
        }>
        <ProgressSegments total={2} done={2} accessibilityLabel="Setup steps" />
        <DateQuestion
          title={forFocus(focus, 'When did treatment start?', 'When did their treatment start?')}
          value={startDate}
          onChange={setStartDate}
        />
        {focus === 'finished' ? (
          <DateQuestion
            title="When did treatment finish?"
            value={finishedDate}
            onChange={setFinishedDate}
            minimumDate={startDate}
          />
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen
      back={current || router.canGoBack() ? { label: 'Back', onPress: leave } : undefined}
      title="What brings you here?"
      subtitle="We'll show what matters to you. You can change this any time."
      bottomBar={
        <BottomActionBar>
          {current ? null : (
            <Button
              title="Skip"
              variant="secondary"
              onPress={() => {
                setFocus('learning');
                saveFocus.mutate('learning', { onSuccess: () => router.replace('/today') });
              }}
              style={styles.flex1}
            />
          )}
          <Button
            title={focus === 'learning' || !signedIn ? 'Save' : 'Continue'}
            disabled={!focus}
            loading={saving}
            onPress={next}
            style={styles.flex2}
          />
        </BottomActionBar>
      }>
      {signedIn ? <ProgressSegments total={2} done={1} accessibilityLabel="Setup steps" /> : null}
      <View accessibilityRole="radiogroup" style={styles.options}>
        {FOCUS_OPTIONS.map((option) => (
          <FocusOption
            key={option.value}
            title={option.title}
            description={option.description}
            selected={focus === option.value}
            onPress={() => setFocus(option.value)}
          />
        ))}
      </View>
      {!signedIn && focus && focus !== 'learning' ? (
        <Text variant="supporting" tone="muted">
          Journey keeps your check-ins in your account, so you&apos;ll need to sign in to use it.
        </Text>
      ) : null}
    </Screen>
  );
}

function FocusOption({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { palette } = useDesign();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? palette.raised : palette.surface,
          borderColor: selected ? palette.action : palette.border,
          borderWidth: selected ? 2 : 1.5,
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.optionText}>
        <Text variant="row" tone={selected ? 'action' : 'ink'}>
          {title}
        </Text>
        <Text variant="supporting" tone="muted">
          {description}
        </Text>
      </View>
      <View
        style={[
          styles.radio,
          { borderColor: selected ? palette.action : palette.border },
          selected && { backgroundColor: palette.action },
        ]}>
        {selected ? <Icon name="check" size={16} tone="onAction" strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}

function DateQuestion({
  title,
  value,
  onChange,
  minimumDate,
}: {
  title: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
}) {
  const { palette } = useDesign();
  const today = new Date();
  return (
    <Section title={title} look="plain">
      <DateField
        value={value}
        onChange={onChange}
        maximumDate={today}
        minimumDate={minimumDate}
        accessibilityLabel={`${title} ${formatLongDate(value)}`}>
        <View
          style={[
            styles.dateBox,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}>
          <Icon name="calendar" tone="action" />
          <Text variant="row" style={styles.flex1}>
            {formatLongDate(value)}
          </Text>
          <Text variant="supporting" tone="action">
            Change
          </Text>
        </View>
      </DateField>
      <View style={styles.chips}>
        {QUICK_DATES.map((quick) => {
          const date = addDays(today, -quick.daysAgo);
          return (
            <Chip
              key={quick.label}
              kind="radio"
              label={quick.label}
              selected={value.toDateString() === date.toDateString()}
              onPress={() => onChange(date)}
            />
          );
        })}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  pressed: { opacity: 0.7 },
  options: { gap: space.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.control,
  },
  optionText: { flex: 1, gap: 2 },
  radio: {
    width: 26,
    height: 26,
    borderRadius: radii.round,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.control,
    borderWidth: 1.5,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
