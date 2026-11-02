import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AnswerButtons, SignList, StepProgress } from '@/components/learn/CheckSteps';
import { SeeADoctor } from '@/components/learn/SeeADoctor';
import {
  BottomActionBar,
  Button,
  EmptyState,
  LoadingState,
  Screen,
  StepList,
  Text,
} from '@/components/ui';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { cancerKeyword } from '@/lib/help';
import { signsId, SIGNS_EVERY_MONTHS, type CancerKey } from '@/lib/screening';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';
import type { CancerType } from '@/types/cancerType';

// The signs check (design refresh Phase 24; steps since Phase 25, like a self-check
// guide): one step per followed cancer with no self-check or test for this person, each
// asking "any of these lasting 2 weeks or more?". After the last, all fine, or the same
// next steps as a self-check that noted a change. `?cancer=ovarian` asks about just that
// one (from its page in Learn).

const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));

export default function SignsCheckScreen() {
  const { cancer: only } = useLocalSearchParams<{ cancer?: string }>();
  const { signs } = useSelfChecks();
  const cancers = useCancerTypes();
  const markDone = useSelfCheckStore((state) => state.markDone);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const list: { key: CancerKey; cancer: CancerType | null }[] = only
    ? [
        {
          key: only,
          cancer: cancers.data?.find((item) => cancerKeyword(item.name) === only) ?? null,
        },
      ]
    : signs.map((item) => ({ key: item.cancerKey, cancer: item.cancer }));
  const current = answers.length;
  const item = finished ? undefined : list[current];
  const name = (entry: (typeof list)[number]) => entry.cancer?.name ?? entry.key;
  const short = (entry: (typeof list)[number]) => name(entry).replace(/ cancer$/, '');

  const answer = (yes: boolean) => {
    const all = [...answers, yes];
    setAnswers(all);
    if (all.length < list.length) return;
    const now = new Date();
    list.forEach((entry, index) => markDone(signsId(entry.key), now, all[index]));
    if (all.some(Boolean)) return setFinished(true);
    showToast(`Thanks. We'll ask again in ${SIGNS_EVERY_MONTHS} months.`, 'success');
    back();
  };
  const noticed = list.filter((_, index) => answers[index]);

  if (cancers.isPending) {
    return (
      <Screen back={{ label: 'Back', onPress: back }} title="Signs check">
        <LoadingState message="Loading the signs" />
      </Screen>
    );
  }

  return (
    <Screen
      back={{ label: 'Back', onPress: back }}
      title="Signs check"
      subtitle={[`Every ${SIGNS_EVERY_MONTHS} months`, list.map(short).join(', ')]
        .filter(Boolean)
        .join(' · ')}
      bottomBar={
        finished ? (
          <BottomActionBar>
            <Button title="Done" onPress={back} />
          </BottomActionBar>
        ) : item ? (
          <AnswerButtons
            noHint={
              current < list.length - 1
                ? `Next: ${short(list[current + 1])}`
                : `We'll ask again in ${SIGNS_EVERY_MONTHS} months`
            }
            onAnswer={answer}
          />
        ) : undefined
      }>
      {finished ? (
        <>
          <Text variant="supporting" tone="muted">
            {`You noticed signs of ${noticed.map((entry) => name(entry).toLowerCase()).join(' and ')}.`}
          </Text>
          <SeeADoctor />
        </>
      ) : !item ? (
        <EmptyState
          icon="info"
          title="No signs check"
          message="Each cancer you follow has a self-check or a test, so there's nothing to ask here."
          action={{ label: 'Your cancers', onPress: () => router.push('/checks') }}
        />
      ) : (
        <>
          <StepProgress current={current} total={list.length} label={short(item)} />
          <StepList
            steps={list.map((entry, index) => ({
              title:
                index === current
                  ? `${name(entry)}: any of these lasting 2 weeks or more?`
                  : name(entry),
            }))}
            current={current}>
            <SignList signs={item.cancer?.symptoms ?? []} />
          </StepList>
          <Text variant="supporting" tone="muted">
            {list.length === 1
              ? 'There’s no screening test for you for this cancer, so knowing its signs is how it’s found early.'
              : 'These cancers have no screening test for you, so knowing their signs is how they’re found early.'}
          </Text>
        </>
      )}
    </Screen>
  );
}
