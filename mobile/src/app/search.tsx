import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { QuestionRow } from '@/components/community/QuestionRow';
import { ResourceRow } from '@/components/help/ResourceRow';
import { GuideRow, HabitRow, PreventionDetailSheet } from '@/components/learn/LearnSections';
import {
  Chip,
  EmptyState,
  ListRow,
  Screen,
  SearchField,
  Section,
  SkeletonList,
} from '@/components/ui';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { useQuestions } from '@/hooks/useCommunity';
import { useNow } from '@/hooks/useNow';
import { usePreventionTips } from '@/hooks/usePrevention';
import { useAllResources } from '@/hooks/useResources';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { haptics } from '@/lib/haptics';
import { iconForCancer } from '@/lib/learn';
import { searchUniversal, SUGGESTED_SEARCHES } from '@/lib/search';
import { space } from '@/theme/tokens';
import type { CancerType } from '@/types/cancerType';
import type { PreventionTip } from '@/types/preventionTip';
import type { Resource } from '@/types/resource';

type DomainFilter = 'all' | 'guides' | 'cancers' | 'habits' | 'help' | 'community';

const FILTERS: { id: DomainFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'guides', label: 'Checks' },
  { id: 'cancers', label: 'Cancers' },
  { id: 'habits', label: 'Habits' },
  { id: 'help', label: 'Help' },
  { id: 'community', label: 'Community' },
];

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [userQuery, setUserQuery] = useState<string | null>(null);
  const query = userQuery !== null ? userQuery : (q ?? '');
  const [filter, setFilter] = useState<DomainFilter>('all');
  const [selectedTip, setSelectedTip] = useState<PreventionTip | null>(null);

  const now = useNow(30_000);
  const cancersQuery = useCancerTypes();
  const tipsQuery = usePreventionTips();
  const checks = useSelfChecks(now);
  const resourcesQuery = useAllResources();
  const questionsQuery = useQuestions({ sortBy: 'recent' });

  const isDataLoading =
    cancersQuery.isLoading ||
    tipsQuery.isLoading ||
    checks.query.isLoading ||
    resourcesQuery.isLoading ||
    questionsQuery.isLoading;

  const flattenedResources = useMemo<Resource[]>(() => {
    const data = resourcesQuery.data;
    if (!data) return [];
    return [
      ...data.hotlines,
      ...data.screeningCenters,
      ...data.financialSupport,
      ...data.supportGroups,
    ];
  }, [resourcesQuery.data]);

  const searchableData = useMemo(
    () => ({
      cancers: cancersQuery.data ?? [],
      guides: checks.all.map((s) => s.guide),
      tips: tipsQuery.data ?? [],
      resources: flattenedResources,
      questions: questionsQuery.data ?? [],
    }),
    [cancersQuery.data, checks.all, tipsQuery.data, flattenedResources, questionsQuery.data],
  );

  const trimmedQuery = query.trim();
  const results = useMemo(
    () => searchUniversal(searchableData, trimmedQuery),
    [searchableData, trimmedQuery],
  );

  const handleSelectSuggestion = (suggestion: string) => {
    haptics.selection();
    setUserQuery(suggestion);
  };

  const openCancer = (id: string) =>
    router.push({ pathname: '/learn/cancer/[id]', params: { id } });

  const backAction = () => (router.canGoBack() ? router.back() : router.replace('/today'));

  const countForFilter = (id: DomainFilter): number => {
    switch (id) {
      case 'all':
        return results.totalCount;
      case 'guides':
        return results.guides.length;
      case 'cancers':
        return results.cancers.length;
      case 'habits':
        return results.tips.length;
      case 'help':
        return results.resources.length;
      case 'community':
        return results.questions.length;
    }
  };

  const showGuides = (filter === 'all' || filter === 'guides') && results.guides.length > 0;
  const showCancers = (filter === 'all' || filter === 'cancers') && results.cancers.length > 0;
  const showHabits = (filter === 'all' || filter === 'habits') && results.tips.length > 0;
  const showHelp = (filter === 'all' || filter === 'help') && results.resources.length > 0;
  const showCommunity =
    (filter === 'all' || filter === 'community') && results.questions.length > 0;

  const filteredCount = filter === 'all' ? results.totalCount : countForFilter(filter);

  return (
    <Screen back={{ label: 'Back', onPress: backAction }} title="Search">
      <SearchField
        accessibilityLabel="Search OncoSense"
        placeholder="Search OncoSense"
        value={query}
        onChangeText={setUserQuery}
        autoFocus
      />

      {/* Like an iOS scope bar: the filters appear once there's something to filter. */}
      {trimmedQuery ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          accessibilityRole="radiogroup"
          accessibilityLabel="Filter by category">
          {FILTERS.map((f) => (
            <Chip
              key={f.id}
              kind="radio"
              label={`${f.label} (${countForFilter(f.id)})`}
              selected={filter === f.id}
              onPress={() => setFilter(f.id)}
            />
          ))}
        </ScrollView>
      ) : null}

      {trimmedQuery ? (
        isDataLoading ? (
          <SkeletonList count={4} />
        ) : filteredCount === 0 ? (
          <EmptyState
            icon="search"
            title={`No results for "${trimmedQuery}"`}
            message={
              filter !== 'all'
                ? `No results in ${filter}. Try switching to "All" or searching for a different keyword.`
                : 'Try searching for symptoms, early detection steps, screening centers, or community questions.'
            }
          />
        ) : (
          <View style={styles.resultsContainer}>
            {showGuides ? (
              <Section title="Self-checks">
                {results.guides.map((guide) => (
                  <GuideRow key={guide.id} status={checks.status(guide)} />
                ))}
              </Section>
            ) : null}

            {showCancers ? (
              <Section title="Cancer types">
                {results.cancers.map((cancer: CancerType) => (
                  <ListRow
                    key={cancer.id}
                    icon={iconForCancer(cancer.name)}
                    iconTone="action"
                    title={cancer.name}
                    subtitle={
                      cancer.symptoms.length
                        ? cancer.symptoms.slice(0, 3).join(' · ')
                        : cancer.description
                    }
                    onPress={() => openCancer(cancer.id)}
                  />
                ))}
              </Section>
            ) : null}

            {showHabits ? (
              <Section title="Habits">
                {results.tips.map((tip) => (
                  <HabitRow key={tip.id} tip={tip} onPress={() => setSelectedTip(tip)} />
                ))}
              </Section>
            ) : null}

            {showHelp ? (
              <Section title="Hotlines and centers">
                {results.resources.map((resource: Resource) => (
                  <ResourceRow key={resource.id} resource={resource} />
                ))}
              </Section>
            ) : null}

            {showCommunity ? (
              <Section title="Community">
                {results.questions.map((question) => (
                  <QuestionRow key={question.id} question={question} now={now} />
                ))}
              </Section>
            ) : null}
          </View>
        )
      ) : (
        <Section title="Suggestions">
          {SUGGESTED_SEARCHES.map((item) => (
            <ListRow
              key={item}
              icon="search"
              title={item}
              accessibilityLabel={`Search for ${item}`}
              onPress={() => handleSelectSuggestion(item)}
            />
          ))}
        </Section>
      )}

      <PreventionDetailSheet tip={selectedTip} onClose={() => setSelectedTip(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    gap: space.sm,
    paddingVertical: space.xs,
  },
  resultsContainer: {
    gap: space.lg,
    paddingTop: space.sm,
  },
});
