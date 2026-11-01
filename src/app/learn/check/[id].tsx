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
  Icon,
  IconButton,
  ListRow,
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
import { formatShortDate, parseDbTimestamp } from '@/lib/dates';
import { callPhone, openWebPage } from '@/lib/links';
import { formatMonthDay } from '@/lib/selfCheck';
import { useIsSignedIn } from '@/stores/authStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

// The guided self-check (redesign Phase 3): one step at a time with the rest as a list,
// read aloud on request. It ends by asking how it went (design refresh Phase 22): a
// normal check sets the next due date; a noticed change says to see a doctor soon.
// Illustrations are not part of v1.

const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));
const findCenter = () => router.navigate({ pathname: '/help', params: { section: 'screening' } });
const DOH_HOTLINE = '1555';

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
  const [asking, setAsking] = useState(false);
  const [changed, setChanged] = useState<boolean | null>(null);
  const signedIn = useIsSignedIn();
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

  const ask = () => {
    stopReading();
    setAsking(true);
  };
  const finish = () => {
    if (changed === null) return;
    setNextCheck(markSelfCheckDone(guide, changed));
  };

  const bottomBar = nextCheck ? (
    <BottomActionBar>
      <Button title="Done" onPress={back} />
    </BottomActionBar>
  ) : asking ? (
    <BottomActionBar>
      <Button
        title="Back"
        variant="secondary"
        onPress={() => setAsking(false)}
        style={styles.flex1}
      />
      <Button title="Continue" disabled={changed === null} onPress={finish} style={styles.flex2} />
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
        title={last ? 'Finish' : 'Next step'}
        onPress={last ? ask : () => goTo(current + 1)}
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
          {steps.length && !nextCheck && !asking ? (
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
      {nextCheck && changed ? (
        <View style={styles.change} accessibilityLiveRegion="polite">
          <Text variant="heading" accessibilityRole="header">
            See a doctor soon
          </Text>
          <Text variant="body" tone="muted">
            You noted a change today. Most changes turn out to be harmless, but only a doctor can
            tell. Book a check-up this week, and bring a note of what you noticed and when.
          </Text>
          <Button
            title="Find a screening center"
            icon="hospital"
            variant="help"
            onPress={findCenter}
          />
          <Button
            title={`Call the DOH hotline, ${DOH_HOTLINE}`}
            icon="phone"
            variant="secondary"
            onPress={() => callPhone(DOH_HOTLINE)}
          />
          {signedIn ? (
            <Section>
              <ListRow
                icon="calendar"
                title="Add an appointment"
                subtitle="We'll remind you the evening before"
                onPress={() => router.push('/journey/appointment')}
              />
            </Section>
          ) : null}
          <Text variant="supporting" tone="muted">
            OncoSense doesn&apos;t send this to anyone. If you&apos;re worried right now, call your
            doctor.
          </Text>
        </View>
      ) : nextCheck ? (
        <View style={styles.done} accessibilityLiveRegion="polite">
          <RibbonMark height={96} weight={18} color={palette.action} draw />
          <Text variant="heading" accessibilityRole="header">
            Done
          </Text>
          <Text variant="body" tone="muted" style={styles.centered}>
            {`Your next check is on ${formatMonthDay(nextCheck)}. We'll remind you.`}
          </Text>
        </View>
      ) : asking ? (
        <View style={styles.change}>
          <Text variant="heading" accessibilityRole="header">
            How did it go?
          </Text>
          <Section>
            <ListRow
              icon="check"
              title="Everything looked normal"
              subtitle="The same as last time"
              accessory={
                changed === false ? <Icon name="check" size={22} tone="action" bold /> : <></>
              }
              accessibilityLabel={`Everything looked normal${changed === false ? ', selected' : ''}`}
              onPress={() => setChanged(false)}
            />
            <ListRow
              icon="circle-alert"
              title="I noticed a change"
              subtitle="A lump, a new spot, pain or anything different"
              accessory={changed ? <Icon name="check" size={22} tone="action" bold /> : <></>}
              accessibilityLabel={`I noticed a change${changed ? ', selected' : ''}`}
              onPress={() => setChanged(true)}
            />
          </Section>
          <Text variant="supporting" tone="muted">
            Most changes aren&apos;t cancer, but a doctor should look.
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

      {status.history.length ? (
        <Section title="Your checks">
          {status.history.slice(0, 6).map((entry) => (
            <ListRow
              key={entry.date}
              title={formatShortDate(parseDbTimestamp(entry.date))}
              subtitle={entry.changed ? 'Noticed a change' : 'Everything normal'}
              subtitleTone={entry.changed ? 'sunInk' : 'muted'}
            />
          ))}
        </Section>
      ) : null}

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
  change: { gap: space.md, paddingTop: space.md },
  centered: { textAlign: 'center', maxWidth: 320 },
  flex2: { flex: 2 },
  progress: { gap: space.sm },
  progressLine: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  sign: { flexDirection: 'row', gap: space.sm, paddingVertical: space.xs },
  // Links line up with the text above them; the pill's padding sits outside the text.
  link: { alignSelf: 'flex-start', marginLeft: -space.lg },
});
