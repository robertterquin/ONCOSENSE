import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { userAge } from '@/api/auth';
import { StepProgress } from '@/components/learn/CheckSteps';
import {
  BottomActionBar,
  Button,
  DateRow,
  ErrorState,
  ListRow,
  Screen,
  Section,
  Sheet,
  StepList,
  Text,
} from '@/components/ui';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import {
  formatLongDate,
  formatShortDate,
  formatShortMonthDay,
  parseDbTimestamp,
} from '@/lib/dates';
import { SCREENING_TESTS, screeningId } from '@/lib/screening';
import { useUser } from '@/stores/authStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';

// A screening test (design refresh Phase 23; steps since Phase 25, like a self-check
// guide): what it finds, whether it's for you, how to book it, and "I've had it" with
// the date, which sets the next one.

const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));
const findCenter = () => router.navigate({ pathname: '/help', params: { section: 'screening' } });

export default function ScreeningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const test = SCREENING_TESTS.find((item) => item.id === id);
  const age = userAge(useUser());
  const status = useSelfChecks().screenings.find((item) => item.test?.id === id);
  const markDone = useSelfCheckStore((state) => state.markDone);
  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const [date, setDate] = useState(() => new Date());

  if (!test) {
    return (
      <Screen back={{ label: 'Back', onPress: back }}>
        <ErrorState message="This test isn't in the app any more." />
      </Screen>
    );
  }
  const talk = test.months(age) === null;
  const doneLabel = talk ? "I've talked to my doctor" : "I've had it";

  const save = () => {
    markDone(screeningId(test), date);
    setRecording(false);
    showToast(talk ? 'Noted' : `${test.title} recorded`, 'success');
  };

  const next = !status
    ? 'Follow this cancer in Your cancers to keep track.'
    : status.due === null
      ? `Done ${formatShortDate(status.lastDone!)}.`
      : status.isDue
        ? status.lastDone
          ? `Last done ${formatShortDate(status.lastDone)}. Due now.`
          : 'Not recorded yet. Record it once you’ve had it.'
        : `Next on ${formatLongDate(status.due)}.`;
  const steps = [
    { title: 'What it finds', body: <Text variant="reading">{test.about}</Text> },
    {
      title: 'Is it for you',
      body: <Text variant="reading">{`${test.who}. ${test.howOften(age)}.`}</Text>,
    },
    {
      title: talk ? 'Talk to a doctor' : 'Book it',
      body: (
        <>
          <Text variant="reading">{test.howToGet}</Text>
          {talk ? null : (
            <Button
              title="Find a screening center"
              icon="hospital"
              variant="help"
              small
              fullWidth={false}
              onPress={findCenter}
            />
          )}
        </>
      ),
    },
    {
      title: talk ? 'Record the talk' : 'Record it when you’ve had it',
      body: <Text variant="reading">{next}</Text>,
    },
  ];
  const last = current === steps.length - 1;

  return (
    <Screen
      back={{ label: 'Back', onPress: back }}
      title={test.title}
      subtitle={`${test.howOften(age)} · ${test.who}`}
      bottomBar={
        <BottomActionBar>
          {current > 0 ? (
            <Button
              title="Back"
              variant="secondary"
              onPress={() => setCurrent(current - 1)}
              style={styles.flex1}
            />
          ) : null}
          <Button
            title={last ? doneLabel : 'Next step'}
            onPress={last ? () => setRecording(true) : () => setCurrent(current + 1)}
            style={styles.flex2}
          />
        </BottomActionBar>
      }>
      <StepProgress
        current={current}
        total={steps.length}
        tag={
          status?.due
            ? status.isDue
              ? { tone: 'due', label: 'Due now' }
              : { tone: 'next', label: `Next ${formatShortMonthDay(status.due)}` }
            : undefined
        }
      />
      <StepList steps={steps.map((step) => ({ title: step.title }))} current={current}>
        {steps[current].body}
      </StepList>

      {status?.history.length ? (
        <Section title="Your tests">
          {status.history.slice(0, 6).map((entry) => (
            <ListRow key={entry.date} title={formatShortDate(parseDbTimestamp(entry.date))} />
          ))}
        </Section>
      ) : null}
      <Text variant="supporting" tone="muted" style={styles.source}>
        Source: {test.source}. Ask a doctor what suits you; this is general information.
      </Text>

      <Sheet visible={recording} onClose={() => setRecording(false)} title={doneLabel}>
        <Section>
          <DateRow
            label="When"
            text={formatShortDate(date)}
            value={date}
            onChange={setDate}
            maximumDate={new Date()}
          />
        </Section>
        <Button title="Save" onPress={save} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  source: { paddingTop: space.sm },
});
