import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { QuestionRow } from '@/components/community/QuestionRow';
import { ResourceRow } from '@/components/help/ResourceRow';
import {
  GuideRow,
  PreventionDetailSheet,
  PreventionTipCard,
} from '@/components/learn/LearnSections';
import {
  Chip,
  EmptyState,
  Icon,
  ListRow,
  Screen,
  SearchField,
  Section,
  SkeletonList,
  Text,
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
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { CancerType } from '@/types/cancerType';
import type { PreventionTip } from '@/types/preventionTip';
import type { Resource } from '@/types/resource';

type DomainFilter = 'all' | 'guides' | 'cancers' | 'habits' | 'help' | 'community';

const FILTERS: { id: DomainFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'guides', label: 'Guides' },
  { id: 'cancers', label: 'Cancers' },
  { id: 'habits', label: 'Habits' },
  { id: 'help', label: 'Help' },
  { id: 'community', label: 'Community' },
];

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { palette } = useDesign();
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
    <Screen
      back={{ label: 'Back', onPress: backAction }}
      title="Search"
      subtitle="Find cancer info, self-checks, habits, centers and discussions">
      <SearchField
        accessibilityLabel="Search OncoSense"
        placeholder="Search anything in OncoSense..."
        value={query}
        onChangeText={setUserQuery}
        autoFocus
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        accessibilityRole="radiogroup"
        accessibilityLabel="Filter by category">
        {FILTERS.map((f) => {
          const count = trimmedQuery ? countForFilter(f.id) : null;
          const label = count !== null ? `${f.label} (${count})` : f.label;
          return (
            <Chip
              key={f.id}
              kind="radio"
              label={label}
              selected={filter === f.id}
              onPress={() => setFilter(f.id)}
            />
          );
        })}
      </ScrollView>

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
              <Section
                title={`Self-Check Guides (${results.guides.length})`}
                subtitle="Guided, step-by-step checks you can do at home"
                look="card">
                {results.guides.map((guide) => (
                  <GuideRow key={guide.id} status={checks.status(guide)} />
                ))}
              </Section>
            ) : null}

            {showCancers ? (
              <Section
                title={`Cancer Types (${results.cancers.length})`}
                subtitle="Symptoms, risks, and early detection pathways"
                look="card">
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
              <Section
                title={`Everyday Prevention Habits (${results.tips.length})`}
                subtitle="Evidence-backed habits to lower lifetime cancer risk"
                look="plain">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.habitsScroll}
                  decelerationRate="fast"
                  snapToAlignment="start">
                  {results.tips.map((tip) => (
                    <PreventionTipCard key={tip.id} tip={tip} onPress={() => setSelectedTip(tip)} />
                  ))}
                </ScrollView>
              </Section>
            ) : null}

            {showHelp ? (
              <Section
                title={`Hotlines & Screening Centers (${results.resources.length})`}
                subtitle="Medical centers and counseling resources across the Philippines"
                look="card">
                {results.resources.map((resource: Resource) => (
                  <ResourceRow key={resource.id} resource={resource} />
                ))}
              </Section>
            ) : null}

            {showCommunity ? (
              <Section
                title={`Community Discussions (${results.questions.length})`}
                subtitle="Real questions and shared experiences from survivors and caregivers"
                look="card">
                {results.questions.map((question) => (
                  <QuestionRow key={question.id} question={question} now={now} />
                ))}
              </Section>
            ) : null}
          </View>
        )
      ) : (
        <View style={styles.suggestionsContainer}>
          <Section
            title="Suggested searches"
            subtitle="Popular topics and questions searched by others"
            look="plain">
            <View style={styles.pillWrap}>
              {SUGGESTED_SEARCHES.map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityLabel={`Search for ${item}`}
                  onPress={() => handleSelectSuggestion(item)}
                  style={({ pressed }) => [
                    styles.suggestionPill,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <Icon name="search" size={14} tone="muted" />
                  <Text variant="caption">{item}</Text>
                </Pressable>
              ))}
            </View>
          </Section>

          <Section
            title="What you can search"
            subtitle="Search across the entire OncoSense ecosystem"
            look="card">
            <ListRow
              icon="stethoscope"
              iconTone="action"
              title="Cancer types and signs"
              subtitle="Symptoms, stages, screening methods, and statistics"
              onPress={() => handleSelectSuggestion('symptoms')}
            />
            <ListRow
              icon="check"
              iconTone="rose"
              title="Self-check guides"
              subtitle="Step-by-step guides for breast, skin, oral and testicular checks"
              onPress={() => handleSelectSuggestion('Self-Exam')}
            />
            <ListRow
              icon="activity"
              iconTone="action"
              title="Everyday prevention habits"
              subtitle="Nutrition, physical activity, UV protection, and tobacco cessation"
              onPress={() => handleSelectSuggestion('nutrition')}
            />
            <ListRow
              icon="phone"
              iconTone="help"
              title="Screening centers and hotlines"
              subtitle="Verified clinics, oncology hotlines, and financial assistance"
              onPress={() => handleSelectSuggestion('Screening')}
            />
            <ListRow
              icon="message"
              iconTone="action"
              title="Questions from survivors and caregivers"
              subtitle="Community questions on treatments, side effects, and hope"
              onPress={() => handleSelectSuggestion('fatigue')}
            />
          </Section>
        </View>
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
  habitsScroll: {
    gap: space.md,
    paddingTop: space.xs,
    paddingBottom: space.xs,
  },
  suggestionsContainer: {
    gap: space.lg,
    paddingTop: space.sm,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radii.round,
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.7,
  },
});
