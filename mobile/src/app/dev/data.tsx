import type { UseQueryResult } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { Screen, Section, Text } from '@/components/ui';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { useAnswers, useQuestions } from '@/hooks/useCommunity';
import { useDailyHealthTip } from '@/hooks/useHome';
import { useJourneyEntries } from '@/hooks/useJourney';
import { usePreventionTips, useSelfCheckGuides } from '@/hooks/usePrevention';
import { useAllResources } from '@/hooks/useResources';
import { useIsSignedIn } from '@/stores/authStore';

type Check = {
  label: string;
  query: UseQueryResult<unknown>;
  describe: (data: never) => string;
};

/** Development-only screen that calls the read-only hooks against Supabase. */
export default function DataCheckScreen() {
  const signedIn = useIsSignedIn();
  const questions = useQuestions();
  const firstQuestionId = questions.data?.[0]?.id ?? '';
  const answers = useAnswers(firstQuestionId);
  const tip = useDailyHealthTip();

  const checks: Check[] = [
    {
      label: 'Cancer types',
      query: useCancerTypes(),
      describe: (d: { name: string }[]) => `${d.length} — ${d[0]?.name ?? ''}`,
    },
    {
      label: 'Prevention tips',
      query: usePreventionTips(),
      describe: (d: { title: string }[]) => `${d.length} — ${d[0]?.title ?? ''}`,
    },
    {
      label: 'Self-check guides',
      query: useSelfCheckGuides(),
      describe: (d: { title: string; steps: unknown[] }[]) =>
        `${d.length} — ${d[0]?.title ?? ''} (${d[0]?.steps.length ?? 0} steps)`,
    },
    {
      label: 'Resources',
      query: useAllResources(),
      describe: (d: Record<string, unknown[]>) =>
        Object.entries(d)
          .map(([key, list]) => `${key}: ${list.length}`)
          .join(', '),
    },
    {
      label: 'Forum questions',
      query: questions,
      describe: (d: { title: string }[]) => `${d.length} — ${d[0]?.title ?? ''}`,
    },
    {
      label: 'Answers to first question',
      query: answers,
      describe: (d: unknown[]) => `${d.length}`,
    },
    {
      label: `Journal entries (${signedIn ? 'signed in' : 'signed out → empty'})`,
      query: useJourneyEntries(),
      describe: (d: unknown[]) => `${d.length}`,
    },
  ];

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <Screen back={{ label: 'Back' }} title="Data check" subtitle="Read-only hooks">
      <Section look="tinted" tint="raised">
        <Text variant="row">Tip of the day</Text>
        <Text>{tip.tip}</Text>
      </Section>
      {checks.map(({ label, query, describe }) => (
        <Section key={label} look="tinted" tint="raised">
          <Text variant="row">{label}</Text>
          <View accessibilityLabel={`${label} result`}>
            {query.isPending && !query.isError ? (
              <Text tone="muted">Loading…</Text>
            ) : query.isError ? (
              <Text tone="danger">✗ {query.error.message}</Text>
            ) : (
              <Text>✓ {describe(query.data as never)}</Text>
            )}
          </View>
        </Section>
      ))}
    </Screen>
  );
}
