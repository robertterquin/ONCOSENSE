import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  DateField,
  BottomActionBar,
  Button,
  Chip,
  Icon,
  ListRow,
  ProgressSegments,
  Screen,
  Section,
  SegmentedControl,
  Sheet,
  Text,
  type IconName,
} from '@/components/ui';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { useFocus, useMyCancerId, useSaveFocus, useSaveMyCancer } from '@/hooks/useFocus';
import { useJourneySetup, useStartJourney } from '@/hooks/useJourney';
import { addDays, formatLongDate } from '@/lib/dates';
import { type JourneyFocus } from '@/lib/focus';
import { iconForCancer } from '@/lib/learn';
import { rescheduleCheckInReminder } from '@/lib/notifications/service';
import { useIsSignedIn } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// "What brings you here?" (redesign Phase 4): after sign-up, and from Journey or
// Profile to change it. Two choices: with cancer, which goes on to "About your cancer"
// (in treatment or finished, which cancer, and dates when signed in), or without.

type Kind = 'cancer' | 'learning';
type Stage = Exclude<JourneyFocus, 'learning'>;

const KINDS: { value: Kind; icon: IconName; title: string; description: string }[] = [
  {
    value: 'cancer',
    icon: 'ribbon',
    title: 'I have or had cancer',
    description: 'Track how you feel, treatments and follow-ups',
  },
  {
    value: 'learning',
    icon: 'book',
    title: "I don't have cancer",
    description: 'Early signs, checks and lowering my risk',
  },
];

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
  const saveMyCancer = useSaveMyCancer();
  const startJourney = useStartJourney();
  const myCancerId = useMyCancerId();
  const cancers = useCancerTypes();
  const [kind, setKind] = useState<Kind | null>(
    current === null ? null : current === 'learning' ? 'learning' : 'cancer',
  );
  const [stage, setStage] = useState<Stage>(current === 'finished' ? 'finished' : 'treatment');
  const [step, setStep] = useState<'focus' | 'about'>('focus');
  const [cancerId, setCancerId] = useState<string | null>(myCancerId);
  const [pickingCancer, setPickingCancer] = useState(false);
  const [startDate, setStartDate] = useState(() => setup.diagnosisDate ?? new Date());
  const [finishedDate, setFinishedDate] = useState(() => setup.cancerFreeDate ?? new Date());
  const saving = saveFocus.isPending || saveMyCancer.isPending || startJourney.isPending;

  const done = (message: string) => {
    showToast(message, 'success');
    // The daily check-in reminder is only for Journey focuses.
    void rescheduleCheckInReminder();
    router.replace('/today');
  };

  const next = () => {
    if (!kind) return;
    if (kind === 'cancer') return setStep('about');
    saveFocus.mutate('learning', {
      onSuccess: () => done('Saved. You can change this any time in Profile.'),
      onError: (error) => showToast(error.message, 'error'),
    });
  };

  const finish = () => {
    // Guests have no account to keep a journey in: just the stage and the cancer.
    if (!signedIn) {
      saveFocus.mutate(stage, {
        onSuccess: () => {
          if (cancerId) saveMyCancer.mutate(cancerId);
          done('Saved. You can change this any time in Profile.');
        },
        onError: (error) => showToast(error.message, 'error'),
      });
      return;
    }
    startJourney.mutate(
      {
        focus: stage,
        diagnosisDate: startDate,
        cancerFreeDate: stage === 'finished' ? finishedDate : null,
        cancerTypeId: cancerId,
      },
      {
        onSuccess: () => done('Your journey is set up.'),
        onError: (error) => showToast(`Couldn't save: ${error.message}`, 'error'),
      },
    );
  };

  if (step === 'about') {
    const sortedCancers = [...(cancers.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));
    const selectedCancer = sortedCancers.find((c) => c.id === cancerId) ?? null;
    const cancerTitle = selectedCancer
      ? selectedCancer.name
      : cancerId === 'none'
        ? "Not listed, or I'd rather not say"
        : 'Select your cancer';
    return (
      <Screen
        back={{ label: 'Back', onPress: () => setStep('focus') }}
        title="About your cancer"
        subtitle="This tailors your habits and checks. You can change it later."
        bottomBar={
          <BottomActionBar>
            <Button title="Finish" loading={saving} onPress={finish} />
          </BottomActionBar>
        }>
        <ProgressSegments total={2} done={2} accessibilityLabel="Setup steps" />
        <Section title="Are you in treatment now?" look="plain">
          <SegmentedControl<Stage>
            accessibilityLabel="Are you in treatment now?"
            value={stage}
            onChange={setStage}
            options={[
              { value: 'treatment', label: 'Yes' },
              { value: 'finished', label: "No, I've finished" },
            ]}
          />
        </Section>
        <Section title="Which cancer?">
          <ListRow
            icon={selectedCancer ? iconForCancer(selectedCancer.name) : 'ribbon'}
            iconTone="action"
            title={cancerTitle}
            subtitle={selectedCancer ? 'Tap to change' : "We'll show its guide on Today and Learn"}
            onPress={() => setPickingCancer(true)}
          />
        </Section>
        {signedIn ? (
          <DateQuestion
            title="When did treatment start?"
            value={startDate}
            onChange={setStartDate}
          />
        ) : (
          <Text variant="supporting" tone="muted">
            Journey keeps your check-ins in your account, so you&apos;ll need to sign in to use it.
          </Text>
        )}
        {signedIn && stage === 'finished' ? (
          <DateQuestion
            title="When did treatment finish?"
            value={finishedDate}
            onChange={setFinishedDate}
            minimumDate={startDate}
          />
        ) : null}
        <Sheet
          visible={pickingCancer}
          onClose={() => setPickingCancer(false)}
          title="Which cancer?">
          <Section>
            {sortedCancers.map((cancer) => (
              <ListRow
                key={cancer.id}
                icon={iconForCancer(cancer.name)}
                iconTone="action"
                title={cancer.name}
                accessory={
                  cancerId === cancer.id ? (
                    <Icon name="check" size={22} tone="action" bold />
                  ) : (
                    <></>
                  )
                }
                onPress={() => {
                  setCancerId(cancer.id);
                  setPickingCancer(false);
                }}
              />
            ))}
            <ListRow
              title="Not listed, or I'd rather not say"
              accessory={
                cancerId === 'none' ? <Icon name="check" size={22} tone="action" bold /> : <></>
              }
              onPress={() => {
                setCancerId('none');
                setPickingCancer(false);
              }}
            />
          </Section>
        </Sheet>
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
                setKind('learning');
                saveFocus.mutate('learning', { onSuccess: () => router.replace('/today') });
              }}
              style={styles.flex1}
            />
          )}
          <Button
            title={kind === 'learning' ? 'Save' : 'Continue'}
            disabled={!kind}
            loading={saving}
            onPress={next}
            style={styles.flex2}
          />
        </BottomActionBar>
      }>
      {kind !== 'learning' ? (
        <ProgressSegments total={2} done={1} accessibilityLabel="Setup steps" />
      ) : null}
      <View accessibilityRole="radiogroup" style={styles.options}>
        {KINDS.map((option) => (
          <FocusOption
            key={option.value}
            icon={option.icon}
            title={option.title}
            description={option.description}
            selected={kind === option.value}
            onPress={() => setKind(option.value)}
          />
        ))}
      </View>
    </Screen>
  );
}

/** An onboarding card (Headspace-style): icon tile, title and line; picked fills in. */
function FocusOption({
  icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon: IconName;
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
          borderColor: selected ? palette.action : 'transparent',
        },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.tile, { backgroundColor: selected ? palette.action : palette.raised }]}>
        <Icon name={icon} size={22} tone={selected ? 'onAction' : 'action'} />
      </View>
      <View style={styles.optionText}>
        <Text variant={selected ? 'strong' : 'row'}>{title}</Text>
        <Text variant="supporting" tone="muted">
          {description}
        </Text>
      </View>
      {selected ? <Icon name="circle-check" size={24} tone="action" /> : null}
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
    borderRadius: radii.section,
    borderWidth: 2,
  },
  optionText: { flex: 1, gap: 2 },
  tile: {
    width: 44,
    height: 44,
    borderRadius: radii.tile,
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
