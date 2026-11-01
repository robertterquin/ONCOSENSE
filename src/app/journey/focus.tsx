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
  Sheet,
  Text,
  type IconName,
} from '@/components/ui';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { useFocus, useMyCancerId, useSaveFocus } from '@/hooks/useFocus';
import { useJourneySetup, useStartJourney } from '@/hooks/useJourney';
import { addDays, formatLongDate } from '@/lib/dates';
import { FOCUS_OPTIONS, forFocus, type JourneyFocus } from '@/lib/focus';
import { iconForCancer } from '@/lib/learn';
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
  const myCancerId = useMyCancerId();
  const cancers = useCancerTypes();
  const [focus, setFocus] = useState<JourneyFocus | null>(current);
  const [step, setStep] = useState<'focus' | 'dates'>('focus');
  const [cancerId, setCancerId] = useState<string | null>(myCancerId);
  const [pickingCancer, setPickingCancer] = useState(false);
  const [startDate, setStartDate] = useState(() => setup.diagnosisDate ?? new Date());
  const [finishedDate, setFinishedDate] = useState(() => setup.cancerFreeDate ?? new Date());
  const saving = saveFocus.isPending || startJourney.isPending;

  const done = (message: string) => {
    showToast(message, 'success');
    // The daily check-in reminder is only for Journey focuses.
    void rescheduleCheckInReminder();
    router.replace('/today');
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
        cancerTypeId: cancerId,
      },
      {
        onSuccess: () => done('Your journey is set up.'),
        onError: (error) => showToast(`Couldn't save: ${error.message}`, 'error'),
      },
    );
  };

  if (step === 'dates' && focus) {
    const sortedCancers = [...(cancers.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));
    const selectedCancer = sortedCancers.find((c) => c.id === cancerId) ?? null;
    const cancerTitle = selectedCancer
      ? selectedCancer.name
      : cancerId === 'none'
        ? "Not listed, or I'd rather not say"
        : forFocus(focus, 'Select your cancer', 'Select the cancer they have');
    return (
      <Screen
        back={{ label: 'Back', onPress: () => setStep('focus') }}
        title={forFocus(focus, 'About your treatment', 'About their treatment')}
        subtitle="This tailors Today, Journey and Learn to your cancer. You can change it later."
        bottomBar={
          <BottomActionBar>
            <Button title="Finish" loading={saving} onPress={finish} />
          </BottomActionBar>
        }>
        <ProgressSegments total={2} done={2} accessibilityLabel="Setup steps" />
        <Section title={forFocus(focus, 'Which cancer?', 'Which cancer do they have?')}>
          <ListRow
            icon={selectedCancer ? iconForCancer(selectedCancer.name) : 'ribbon'}
            iconTone="action"
            title={cancerTitle}
            subtitle={
              selectedCancer
                ? 'Tap to change'
                : "We'll show its guide on Today and Learn"
            }
            onPress={() => setPickingCancer(true)}
          />
        </Section>
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
                  cancerId === cancer.id ? <Icon name="check" size={22} tone="action" bold /> : <></>
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
            icon={FOCUS_ICONS[option.value]}
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

const FOCUS_ICONS: Record<JourneyFocus, IconName> = {
  learning: 'book',
  treatment: 'pill',
  finished: 'flag',
  caring: 'heart',
};

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
