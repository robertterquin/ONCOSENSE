import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { CancerTypeCard, GuideCard, SectionHeading, TipCard } from '@/components/learn/LearnParts';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { useFilteredCancerTypes } from '@/hooks/useCancerInfo';
import { usePreventionTips, useSelfCheckGuides } from '@/hooks/usePrevention';

// The Learn tab joins the old Info and Prevention tabs (redesign Phase 1): self-check
// guides, cancer types and ways to lower your risk. Phase 3 gives it the new look.

export default function LearnTab() {
  const [search, setSearch] = useState('');
  const types = useFilteredCancerTypes(search);
  const guides = useSelfCheckGuides();
  const tips = usePreventionTips();
  const refetch = () => Promise.all([types.refetch(), guides.refetch(), tips.refetch()]);
  const refreshing = types.isRefetching || guides.isRefetching || tips.isRefetching;

  return (
    <Screen
      inTabs
      onRefresh={refetch}
      refreshing={refreshing}
      header={
        <AppHeader title="Learn" subtitle="Signs, self-checks and ways to lower your risk" />
      }>
      <SectionHeading title="Check yourself" subtitle="Short, guided checks you can do at home" />
      {guides.isPending ? (
        <LoadingState />
      ) : guides.isError ? (
        <ErrorState message={guides.error.message} onRetry={() => guides.refetch()} />
      ) : guides.data.length === 0 ? (
        <AppText secondary style={styles.empty}>
          No self-check guides available right now.
        </AppText>
      ) : (
        guides.data.map((guide) => <GuideCard key={guide.id} guide={guide} />)
      )}

      <SectionHeading title="Cancer types" subtitle="What it is, early signs, and how it's found" />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search cancer types..." />
      {types.isPending ? (
        <LoadingState />
      ) : types.isError ? (
        <ErrorState message={types.error.message} onRetry={() => types.refetch()} />
      ) : types.data.length === 0 ? (
        <EmptyState
          icon="search_off"
          title={search ? `No results for "${search.trim()}"` : 'No cancer types available'}
        />
      ) : (
        <View style={styles.grid}>
          {types.data.map((cancer) => (
            <CancerTypeCard key={cancer.id} cancer={cancer} />
          ))}
        </View>
      )}

      <SectionHeading
        title="Lower your risk"
        subtitle="Everyday habits backed by health agencies"
      />
      {tips.isPending ? (
        <LoadingState />
      ) : tips.isError ? (
        <ErrorState message={tips.error.message} onRetry={() => tips.refetch()} />
      ) : tips.data.length === 0 ? (
        <AppText secondary style={styles.empty}>
          No tips available right now.
        </AppText>
      ) : (
        tips.data.map((tip) => <TipCard key={tip.id} tip={tip} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', paddingVertical: 24 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
});
