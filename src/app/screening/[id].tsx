import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import {
  BottomActionBar,
  Button,
  DateRow,
  ErrorState,
  ListRow,
  Screen,
  Section,
  Sheet,
  Text,
} from '@/components/ui';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { formatLongDate, formatShortDate, parseDbTimestamp } from '@/lib/dates';
import { SCREENING_TESTS, screeningId } from '@/lib/screening';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';
import { userAge } from '@/api/auth';
import { useUser } from '@/stores/authStore';

// A screening test (design refresh Phase 23): what it finds, who it's for, when it's next
// due, where to get it, and "I've had it" with the date, which sets the next one.

const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));
const findCenter = () => router.navigate({ pathname: '/help', params: { section: 'screening' } });

export default function ScreeningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const test = SCREENING_TESTS.find((item) => item.id === id);
  const age = userAge(useUser());
  const status = useSelfChecks().screenings.find((item) => item.test?.id === id);
  const markDone = useSelfCheckStore((state) => state.markDone);
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

  return (
    <Screen
      back={{ label: 'Back', onPress: back }}
      title={test.title}
      subtitle={test.who}
      bottomBar={
        <BottomActionBar>
          <Button title={doneLabel} variant="secondary" onPress={() => setRecording(true)} />
        </BottomActionBar>
      }>
      <Text variant="reading">{test.about}</Text>
      <Section>
        <ListRow
          title="Next"
          subtitle={
            !status
              ? 'Follow this cancer in Your cancers to keep track'
              : status.due === null
                ? 'Done'
                : status.isDue
                  ? status.lastDone
                    ? 'Due now'
                    : 'Due now: not recorded yet'
                  : formatLongDate(status.due)
          }
        />
        <ListRow title="How often" subtitle={test.howOften(age)} />
      </Section>
      <Button title="Find a screening center" icon="hospital" variant="help" onPress={findCenter} />
      {status?.history.length ? (
        <Section title="Your tests">
          {status.history.slice(0, 6).map((entry) => (
            <ListRow key={entry.date} title={formatShortDate(parseDbTimestamp(entry.date))} />
          ))}
        </Section>
      ) : null}
      <Text variant="supporting" tone="muted">
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
