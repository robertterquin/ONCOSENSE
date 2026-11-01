import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ErrorState,
  LoadingState,
  Banner,
  BottomActionBar,
  Button,
  IconButton,
  ProgressSegments,
  RibbonMark,
  Tag,
  Screen,
  Section,
  StepList,
  Text,
} from '@/components/ui';
import { useSelfCheckGuide } from '@/hooks/usePrevention';
import { markSelfCheckDone, useSelfChecks } from '@/hooks/useSelfChecks';
import { openWebPage } from '@/lib/links';
import { formatMonthDay } from '@/lib/selfCheck';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

// The guided self-check (redesign Phase 3): one step at a time with the rest as a list,
// read aloud on request, ending with "Mark as done" which sets the next due date and
// moves the reminder. Illustrations are not part of v1.

const back = () => (router.canGoBack() ? router.back() : router.replace('/learn'));

export default function SelfCheckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useSelfCheckGuide(id);

  if (!query.data) {
    return (
      <Screen back={{ label: 'Back', onPress: back }}>
        {query.isError ? (
          <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
        ) : (
          <LoadingState message="Loading the guide" />
        )}
      </Screen>
    );
  }
  return <GuidedCheck guide={query.data} />;
}

function GuidedCheck({ guide }: { guide: SelfCheckGuide }) {
  const [current, setCurrent] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [nextCheck, setNextCheck] = useState<Date | null>(null);
  const status = useSelfChecks().status(guide);
  const saved = useSelfCheckStore((state) => state.savedGuides.includes(guide.id));
  const toggleSaved = useSelfCheckStore((state) => state.toggleSavedGuide);
  const steps = guide.steps;
  const { palette } = useDesign();
  const step = steps[current];
  const last = current === steps.length - 1;

  // Stop reading when leaving the screen.
  useEffect(() => () => void Speech.stop(), []);

  const stopReading = () => {
    void Speech.stop();
    setSpeaking(false);
  };
  /** Moving to another step stops reading the last one. */
  const goTo = (index: number) => {
    stopReading();
    setCurrent(index);
  };

  const listen = () => {
    if (speaking) return stopReading();
    if (!step) return;
    setSpeaking(true);
    const done = () => setSpeaking(false);
    Speech.speak(`Step ${current + 1}. ${step.instruction}. ${step.detail}`, {
      onDone: done,
      onStopped: done,
      onError: done,
    });
  };

  const finish = () => {
    stopReading();
    setNextCheck(markSelfCheckDone(guide));
  };

  const bottomBar = nextCheck ? (
    <BottomActionBar>
      <Button title="Back to Learn" onPress={() => router.navigate('/learn')} />
    </BottomActionBar>
  ) : steps.length ? (
    <BottomActionBar>
      {current > 0 ? (
        <Button
          title="Back"
          variant="secondary"
          onPress={() => goTo(current - 1)}
          style={styles.flex1}
        />
      ) : null}
      <Button
        title={last ? 'Mark as done' : 'Next step'}
        icon={last ? 'check' : undefined}
        onPress={last ? finish : () => goTo(current + 1)}
        style={styles.flex2}
      />
    </BottomActionBar>
  ) : null;

  return (
    <Screen
      back={{ label: 'Back', onPress: back }}
      actions={
        <>
          <IconButton
            icon="bookmark"
            look={saved ? 'tinted' : 'plain'}
            accessibilityLabel={saved ? 'Saved. Remove from saved' : 'Save guide'}
            onPress={() => {
              toggleSaved(guide.id);
              showToast(saved ? 'Removed from saved' : 'Guide saved', saved ? 'info' : 'success');
            }}
          />
          {steps.length && !nextCheck ? (
            <IconButton
              icon={speaking ? 'close' : 'volume'}
              look="tinted"
              accessibilityLabel={speaking ? 'Stop reading' : 'Listen to this step'}
              onPress={listen}
            />
          ) : null}
        </>
      }
      title={guide.title}
      subtitle={[guide.frequency, guide.ageRecommendation].filter(Boolean).join(' · ')}
      bottomBar={bottomBar}>
      {nextCheck ? (
        <View style={styles.done} accessibilityLiveRegion="polite">
          <RibbonMark height={96} weight={18} color={palette.action} draw />
          <Text variant="heading" accessibilityRole="header">
            Done
          </Text>
          <Text variant="body" tone="muted" style={styles.centered}>
            {`Your next check is on ${formatMonthDay(nextCheck)}. We'll remind you.`}
          </Text>
        </View>
      ) : (
        <>
          <Text variant="reading">{guide.description}</Text>
          <View style={styles.progress}>
            <View style={styles.progressLine}>
              {steps.length ? (
                <Text variant="caption" tone="muted">
                  {`Step ${current + 1} of ${steps.length}`}
                </Text>
              ) : null}
              <Tag tone={status.isDue ? 'due' : 'next'} label={status.label} />
            </View>
            {steps.length ? (
              <ProgressSegments
                total={steps.length}
                done={current + 1}
                tone="action"
                accessibilityLabel="Self-check steps"
              />
            ) : null}
          </View>
          {step ? (
            <StepList steps={steps.map((s) => ({ title: s.instruction }))} current={current}>
              <Text variant="reading">{step.detail}</Text>
            </StepList>
          ) : null}
        </>
      )}

      {guide.warningSigns?.length ? (
        <Section
          title="Warning signs"
          subtitle="See a doctor if you notice any of these"
          divided={false}>
          {guide.warningSigns.map((sign) => (
            <View key={sign} style={styles.sign}>
              <Text variant="body" tone="action" accessibilityElementsHidden>
                •
              </Text>
              <Text variant="body" style={styles.flex1}>
                {sign}
              </Text>
            </View>
          ))}
        </Section>
      ) : null}

      <Banner
        tone="help"
        title="Noticed a change?"
        action={
          <Button
            title="Find a screening center"
            variant="quiet"
            small
            style={styles.link}
            onPress={() => router.navigate({ pathname: '/help', params: { section: 'screening' } })}
          />
        }>
        {guide.whenToSeeDoctor}
      </Banner>

      <Button
        title={`Source: ${guide.sourceName}`}
        icon="external-link"
        variant="quiet"
        small
        style={styles.link}
        onPress={() => openWebPage(guide.sourceUrl)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  done: { alignItems: 'center', gap: space.sm, paddingVertical: space.xxl },
  centered: { textAlign: 'center', maxWidth: 320 },
  flex2: { flex: 2 },
  progress: { gap: space.sm },
  progressLine: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  sign: { flexDirection: 'row', gap: space.sm, paddingVertical: space.xs },
  // Links line up with the text above them; the pill's padding sits outside the text.
  link: { alignSelf: 'flex-start', marginLeft: -space.lg },
});
