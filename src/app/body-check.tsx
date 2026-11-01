import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HowDidItGo, StepProgress } from '@/components/learn/CheckSteps';
import { SeeADoctor } from '@/components/learn/SeeADoctor';
import {
  BottomActionBar,
  Button,
  EmptyState,
  Icon,
  ListRow,
  LoadingState,
  RibbonMark,
  Screen,
  Section,
  StepList,
  Text,
} from '@/components/ui';
import { markSelfCheckDone, useSelfChecks } from '@/hooks/useSelfChecks';
import { formatShortMonthDay } from '@/lib/dates';
import { iconForCancer } from '@/lib/learn';
import { formatMonthDay } from '@/lib/selfCheck';
import { space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// The monthly body check (design refresh Phase 24; one flow since Phase 25): the
// self-check guides for the cancers the person follows, one after another, in the same
// step layout as a single guide. Each guide ends with "How did it go?"; a finished one
// folds into a line. Guidelines favour knowing what's normal for your body over strict
// exam schedules, so it's one gentle monthly check.

const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));
const openGuide = (id: string) => router.push({ pathname: '/learn/check/[id]', params: { id } });

export default function BodyCheckScreen() {
  const { mine, query } = useSelfChecks();
  const { palette } = useDesign();
  // The guides due when the check started (once they've loaded); finishing one doesn't
  // drop it from the flow.
  const [queue, setQueue] = useState<string[] | null>(null);
  if (queue === null && !query.isPending) {
    setQueue(mine.filter((status) => status.isDue).map((status) => status.guide.id));
  }
  const guides = (queue ?? []).flatMap(
    (id) => mine.find((status) => status.guide.id === id)?.guide ?? [],
  );
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [asking, setAsking] = useState(false);
  const [changed, setChanged] = useState<boolean | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [nextDue, setNextDue] = useState<Date | null>(null);

  const guide = guides[index];
  const finished = guides.length > 0 && results.length === guides.length;
  const total = guides.reduce((sum, item) => sum + item.steps.length, 0);
  const before = guides.slice(0, index).reduce((sum, item) => sum + item.steps.length, 0);
  const lastStep = guide ? step === guide.steps.length - 1 : false;

  const record = () => {
    if (!guide || changed === null) return;
    const next = markSelfCheckDone(guide, changed);
    setResults((list) => [...list, changed]);
    setNextDue((current) => (current && current < next ? current : next));
    setAsking(false);
    setChanged(null);
    setStep(0);
    setIndex((value) => value + 1);
  };

  const subtitle = ['Monthly', mine.map((status) => status.guide.cancerType).join(', ')]
    .filter(Boolean)
    .join(' · ');

  if (queue === null) {
    return (
      <Screen back={{ label: 'Back', onPress: back }} title="Monthly body check">
        <LoadingState message="Loading your checks" />
      </Screen>
    );
  }

  // Nothing due: what's been done this month, and when the next one is.
  if (!guides.length) {
    return (
      <Screen
        back={{ label: 'Back', onPress: back }}
        title="Monthly body check"
        subtitle={subtitle}>
        {mine.length ? (
          <>
            <Text variant="reading">Nothing is due. Here&apos;s this month&apos;s check.</Text>
            <Section>
              {mine.map((status) => (
                <ListRow
                  key={status.guide.id}
                  icon={iconForCancer(status.guide.cancerType)}
                  title={status.guide.title}
                  subtitle={
                    status.changeNoted
                      ? `Change noted ${formatShortMonthDay(status.changeNoted)}, see a doctor`
                      : `Next ${formatShortMonthDay(status.due)}`
                  }
                  subtitleTone={status.changeNoted ? 'sunInk' : 'muted'}
                  onPress={() => openGuide(status.guide.id)}
                />
              ))}
            </Section>
          </>
        ) : (
          <EmptyState
            icon="target"
            title="No body check yet"
            message="Follow skin, breast or testicular cancer to add their self-checks here."
            action={{ label: 'Your cancers', onPress: () => router.push('/checks') }}
          />
        )}
      </Screen>
    );
  }

  const bottomBar = finished ? (
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
      <Button title="Continue" disabled={changed === null} onPress={record} style={styles.flex2} />
    </BottomActionBar>
  ) : (
    <BottomActionBar>
      {step > 0 ? (
        <Button
          title="Back"
          variant="secondary"
          onPress={() => setStep(step - 1)}
          style={styles.flex1}
        />
      ) : null}
      <Button
        title={lastStep ? `Finish ${guide.cancerType.toLowerCase()} check` : 'Next step'}
        onPress={lastStep ? () => setAsking(true) : () => setStep(step + 1)}
        style={styles.flex2}
      />
    </BottomActionBar>
  );

  return (
    <Screen
      back={{ label: 'Back', onPress: back }}
      title="Monthly body check"
      subtitle={subtitle}
      bottomBar={bottomBar}>
      {finished ? (
        results.some(Boolean) ? (
          <SeeADoctor />
        ) : (
          <View style={styles.done} accessibilityLiveRegion="polite">
            <RibbonMark height={96} weight={18} color={palette.action} draw />
            <Text variant="heading" accessibilityRole="header">
              Done
            </Text>
            <Text variant="body" tone="muted" style={styles.centered}>
              {nextDue
                ? `Your next body check is on ${formatMonthDay(nextDue)}. We'll remind you.`
                : "We'll remind you next month."}
            </Text>
          </View>
        )
      ) : (
        <>
          <StepProgress
            current={asking ? before + guide.steps.length - 1 : before + step}
            total={total}
            label={guide.cancerType}
            tag={{ tone: 'due', label: 'Due today' }}
          />
          {guides.slice(0, index).map((item, done) => (
            <View key={item.id} style={styles.folded}>
              <Icon name="circle-check" size={22} tone={results[done] ? 'sunInk' : 'help'} />
              <Text variant="supporting" tone="muted" style={styles.flex1}>
                {`${item.title}: ${results[done] ? 'change noted' : 'nothing new'}`}
              </Text>
            </View>
          ))}
          {asking ? (
            <HowDidItGo changed={changed} onChange={setChanged} />
          ) : (
            <>
              <Text variant="section">{guide.title}</Text>
              <StepList
                steps={guide.steps.map((item) => ({ title: item.instruction }))}
                current={step}>
                <Text variant="reading">{guide.steps[step]?.detail}</Text>
              </StepList>
            </>
          )}
          {guides.slice(index + 1).map((item) => (
            <Text key={item.id} variant="supporting" tone="muted">
              {`Then: ${item.title}`}
            </Text>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  folded: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  done: { alignItems: 'center', gap: space.sm, paddingVertical: space.xxl },
  centered: { textAlign: 'center', maxWidth: 320 },
});
