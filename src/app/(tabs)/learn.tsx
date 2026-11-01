import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { ProfileButton } from '@/components/account/ProfileButton';
import {
  AboutHabits,
  CancerTypes,
  ForYou,
  GuideResults,
  HabitResults,
  HowToCheck,
} from '@/components/learn/LearnSections';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Arrive,
  useArrival,
  Screen,
  SearchField,
  SegmentedControl,
} from '@/components/ui';
import { userAge, userGender } from '@/api/auth';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { HABITS } from '@/constants/habits';
import { useFocus, useMyCancerId } from '@/hooks/useFocus';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { asksWhichCancer, forYouCancers } from '@/lib/forYou';
import { searchLearn } from '@/lib/learn';
import { useUser } from '@/stores/authStore';
import { useHabitsStore } from '@/stores/habitsStore';

// The Learn tab (redesign Phase 3; reading only since design refresh Phase 19): cancer
// types, how to do each self-check, and why each habit helps, with one search over all
// three. Due checks and habit ticks live on Today; their history is in Journey.
// `?section=cancers`, `?section=checks` or `?section=risk` opens a part directly.

type Part = 'cancers' | 'checks' | 'habits';
const PART_FOR_SECTION: Record<string, Part> = {
  cancers: 'cancers',
  checks: 'checks',
  risk: 'habits',
};

export default function LearnTab() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const [search, setSearch] = useState('');
  const cancers = useCancerTypes();
  const checks = useSelfChecks();
  const [part, setPart] = useState<Part>('cancers');
  const user = useUser();
  const focus = useFocus();
  const myCancerId = useMyCancerId();
  const smoker = useHabitsStore((state) => state.smoker);

  // On every visit with a `section` link (the tab stays mounted), show that part.
  useFocusEffect(
    useCallback(() => {
      if (!section || !PART_FOR_SECTION[section]) return;
      setPart(PART_FOR_SECTION[section]);
      // Used once, so coming back through the tab bar keeps the part the person picked.
      router.setParams({ section: undefined });
    }, [section]),
  );

  const queries = [cancers, checks.query];
  const failed = queries.find((query) => query.isError);
  const refetch = () => Promise.all(queries.map((query) => query.refetch()));
  const refreshing = queries.some((query) => query.isRefetching);

  const lists = {
    cancers: cancers.data ?? [],
    guides: checks.all.map((status) => status.guide),
    tips: HABITS,
  };
  const myCancer = lists.cancers.find((cancer) => cancer.id === myCancerId) ?? null;
  const picks = forYouCancers(lists.cancers, {
    gender: userGender(user),
    age: userAge(user),
    smoker,
    myCancerId,
  });
  const query = search.trim();
  const results = searchLearn(lists, query);
  const noResults =
    query && !results.cancers.length && !results.guides.length && !results.tips.length;

  const arrived = useArrival(queries.some((q) => q.isPending));
  return (
    <Screen
      inTabs
      tab="learn"
      title="Learn"
      titleAside={<ProfileButton />}
      onRefresh={refetch}
      refreshing={refreshing}>
      <SearchField
        accessibilityLabel="Search Learn"
        placeholder="Search Learn"
        value={search}
        onChangeText={setSearch}
      />
      {query ? null : (
        <SegmentedControl<Part>
          accessibilityLabel="Learn section"
          value={part}
          onChange={setPart}
          options={[
            { value: 'cancers', label: 'Cancers' },
            { value: 'checks', label: 'Checks' },
            { value: 'habits', label: 'Habits' },
          ]}
        />
      )}

      {queries.some((q) => q.isPending) ? (
        <LoadingState variant="learn" message="Loading Learn" />
      ) : (
        <Arrive animate={arrived}>
          {failed ? (
            <ErrorState
              message={failed.error?.message ?? 'Something went wrong'}
              onRetry={refetch}
            />
          ) : noResults ? (
            <EmptyState
              icon="search"
              title={`No results for "${query}"`}
              message="Try a cancer type, a symptom or a self-check."
            />
          ) : query ? (
            <>
              {results.guides.length ? (
                <GuideResults
                  statuses={checks.all.filter((s) => results.guides.includes(s.guide))}
                />
              ) : null}
              {results.cancers.length ? <CancerTypes cancers={results.cancers} /> : null}
              {results.tips.length ? (
                <HabitResults habits={HABITS.filter((habit) => results.tips.includes(habit))} />
              ) : null}
            </>
          ) : (
            {
              checks: <HowToCheck guides={lists.guides} />,
              cancers: (
                <>
                  <ForYou
                    picks={picks}
                    myCancer={myCancer}
                    askCancer={asksWhichCancer(focus) && !myCancerId}
                    caring={focus === 'caring'}
                  />
                  <CancerTypes cancers={lists.cancers} title="All cancers" />
                </>
              ),
              habits: <AboutHabits />,
            }[part]
          )}
        </Arrive>
      )}
    </Screen>
  );
}
