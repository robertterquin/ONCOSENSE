import type { UseQueryResult } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useBookmarkedArticles } from '@/hooks/useBookmarks';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { useAnswers, useQuestions } from '@/hooks/useForum';
import { useCancerArticles, useDailyHealthTip, useHealthReminders } from '@/hooks/useHome';
import { useJourneyEntries } from '@/hooks/useJourney';
import { usePreventionTips, useSelfCheckGuides } from '@/hooks/usePrevention';
import { useAllResources } from '@/hooks/useResources';
import { useIsSignedIn } from '@/stores/authStore';
import { brand } from '@/theme/colors';

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
      label: 'Health reminders',
      query: useHealthReminders(),
      describe: (d: { title: string }[]) => d.map((r) => r.title).join(' · '),
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
      label: 'News (needs the news Edge Function)',
      query: useCancerArticles(),
      describe: (d: unknown[]) => `${d.length} articles`,
    },
    {
      label: `Saved articles (${signedIn ? 'signed in' : 'signed out → empty'})`,
      query: useBookmarkedArticles(),
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
    <Screen header={<AppHeader title="Data Check" subtitle="Phase 2 hooks" showBackButton />}>
      <Card>
        <AppText variant="label">Tip of the day</AppText>
        <AppText>{tip.tip}</AppText>
      </Card>
      {checks.map(({ label, query, describe }) => (
        <Card key={label}>
          <AppText variant="label">{label}</AppText>
          <View accessibilityLabel={`${label} result`}>
            {query.isPending && !query.isError ? (
              <AppText secondary>Loading…</AppText>
            ) : query.isError ? (
              <AppText color={brand.error}>✗ {query.error.message}</AppText>
            ) : (
              <AppText color={brand.success}>✓ {describe(query.data as never)}</AppText>
            )}
          </View>
        </Card>
      ))}
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  spacer: {
    height: 16,
  },
});
