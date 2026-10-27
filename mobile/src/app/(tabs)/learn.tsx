import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { View, type ScrollViewInstance } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import {
  CancerTypes,
  CheckYourself,
  GuideResults,
  LowerYourRisk,
} from '@/components/learn/LearnSections';
import { EmptyState, ErrorState, LoadingState, Screen, SearchField } from '@/components/ui';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { usePreventionTips } from '@/hooks/usePrevention';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { searchLearn } from '@/lib/learn';

// The Learn tab (redesign Phase 3): your self-checks with when they're due, cancer types
// A to Z and ways to lower your risk, with one search over all three. Today's tip opens
// it at "Lower your risk" (`?section=risk`).

export default function LearnTab() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const [search, setSearch] = useState('');
  const cancers = useCancerTypes();
  const tips = usePreventionTips();
  const checks = useSelfChecks();
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const reduceMotion = useReducedMotion();
  const [riskY, setRiskY] = useState<number | null>(null);
  const [cancersY, setCancersY] = useState<number | null>(null);

  // On every visit with `?section=risk` or `?section=cancers` (the tab stays mounted), once it's laid out.
  useFocusEffect(
    useCallback(() => {
      if (section === 'risk' && riskY !== null)
        scrollRef.current?.scrollTo({ y: riskY, animated: !reduceMotion });
      else if (section === 'cancers' && cancersY !== null)
        scrollRef.current?.scrollTo({ y: cancersY, animated: !reduceMotion });
      else if (!section)
        scrollRef.current?.scrollTo({ y: 0, animated: !reduceMotion });
    }, [section, riskY, cancersY, reduceMotion]),
  );

  const queries = [cancers, tips, checks.query];
  const failed = queries.find((query) => query.isError);
  const refetch = () => Promise.all(queries.map((query) => query.refetch()));
  const refreshing = queries.some((query) => query.isRefetching);

  const lists = {
    cancers: cancers.data ?? [],
    guides: checks.all.map((status) => status.guide),
    tips: tips.data ?? [],
  };
  const query = search.trim();
  const results = searchLearn(lists, query);
  const noResults =
    query && !results.cancers.length && !results.guides.length && !results.tips.length;

  return (
    <Screen
      inTabs
      title="Learn"
      subtitle="Signs, self-checks and ways to lower your risk"
      onRefresh={refetch}
      refreshing={refreshing}
      scrollRef={scrollRef}>
      <SearchField
        accessibilityLabel="Search Learn"
        placeholder="Search cancers and checks"
        value={search}
        onChangeText={setSearch}
      />

      {queries.some((q) => q.isPending) ? (
        <LoadingState message="Loading Learn" />
      ) : failed ? (
        <ErrorState message={failed.error?.message ?? 'Something went wrong'} onRetry={refetch} />
      ) : noResults ? (
        <EmptyState
          icon="search"
          title={`No results for "${query}"`}
          message="Try a cancer type, a symptom or a self-check."
        />
      ) : query ? (
        <>
          {results.guides.length ? (
            <GuideResults statuses={checks.all.filter((s) => results.guides.includes(s.guide))} />
          ) : null}
          {results.cancers.length ? <CancerTypes cancers={results.cancers} /> : null}
          {results.tips.length ? <LowerYourRisk tips={results.tips} /> : null}
        </>
      ) : (
        <>
          <CheckYourself mine={checks.mine} all={checks.all} />
          <View onLayout={(event) => setCancersY(event.nativeEvent.layout.y)}>
            <CancerTypes cancers={lists.cancers} />
          </View>
          <View onLayout={(event) => setRiskY(event.nativeEvent.layout.y)}>
            <LowerYourRisk tips={lists.tips} />
          </View>
        </>
      )}
    </Screen>
  );
}
