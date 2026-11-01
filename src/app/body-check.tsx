import { router } from 'expo-router';

import {
  BottomActionBar,
  Button,
  EmptyState,
  ListRow,
  ProgressSegments,
  Screen,
  Section,
  Text,
} from '@/components/ui';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { formatShortMonthDay } from '@/lib/dates';
import { iconForCancer } from '@/lib/learn';

// The monthly body check (design refresh Phase 24): the self-checks for the cancers the
// person follows, one after another, each with its own guide and result. Guidelines
// favour knowing what's normal for your body over strict exam schedules, so it's one
// gentle monthly check rather than a calendar of separate ones.

const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));
const openGuide = (id: string) => router.push({ pathname: '/learn/check/[id]', params: { id } });

export default function BodyCheckScreen() {
  const { mine } = useSelfChecks();
  const waiting = mine.filter((status) => status.isDue);
  const next = waiting[0];

  return (
    <Screen
      back={{ label: 'Back', onPress: back }}
      title="Monthly body check"
      subtitle="Knowing what's normal for you makes changes easier to spot."
      bottomBar={
        mine.length ? (
          <BottomActionBar>
            {next ? (
              <Button
                title={`Start ${next.guide.cancerType.toLowerCase()} check`}
                onPress={() => openGuide(next.guide.id)}
              />
            ) : (
              <Button title="Done" onPress={back} />
            )}
          </BottomActionBar>
        ) : undefined
      }>
      {mine.length ? (
        <>
          <ProgressSegments
            total={mine.length}
            done={mine.length - waiting.length}
            accessibilityLabel={`${mine.length - waiting.length} of ${mine.length} done this month`}
          />
          <Section>
            {mine.map((status) => (
              <ListRow
                key={status.guide.id}
                icon={iconForCancer(status.guide.cancerType)}
                title={status.guide.cancerType}
                subtitle={
                  status.isDue
                    ? status === next
                      ? 'Next, about 10 minutes'
                      : 'Still to do'
                    : status.changeNoted
                      ? `Change noted ${formatShortMonthDay(status.changeNoted)}, see a doctor`
                      : `Nothing new, ${formatShortMonthDay(status.lastDone!)}. Next ${formatShortMonthDay(status.due)}`
                }
                subtitleTone={status.changeNoted ? 'sunInk' : status.isDue ? 'action' : 'muted'}
                onPress={() => openGuide(status.guide.id)}
              />
            ))}
          </Section>
          <Text variant="supporting" tone="muted">
            Noticed a change? Each check ends by asking, and shows what to do next.
          </Text>
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
