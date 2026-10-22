import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { useFilteredCancerTypes } from '@/hooks/useCancerInfo';
import { cancerTypeIcon } from '@/lib/cancerIcons';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { CancerType } from '@/types/cancerType';

// Port of lib/screens/cancer_info/cancer_info_screen.dart

export default function InfoTab() {
  const [search, setSearch] = useState('');
  const query = useFilteredCancerTypes(search);

  return (
    <Screen
      inTabs
      background="surface"
      onRefresh={() => query.refetch()}
      refreshing={query.isRefetching}
      header={
        <AppHeader
          title="Cancer Information"
          subtitle="Learn about types, symptoms, and prevention"
        />
      }>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search cancer types..." />
      <AppText variant="titleLarge">Cancer Types</AppText>

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : query.data.length === 0 ? (
        <EmptyState
          icon="search_off"
          title={search ? `No results found for "${search.trim()}"` : 'No cancer types available'}
        />
      ) : (
        <View style={styles.grid}>
          {query.data.map((cancer) => (
            <CancerTypeCard key={cancer.id} cancer={cancer} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function CancerTypeCard({ cancer }: { cancer: CancerType }) {
  const { colors, isDark } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={cancer.name}
      onPress={() => router.push({ pathname: '/cancer/[id]', params: { id: cancer.id } })}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.divider },
        !isDark && styles.shadow,
        pressed && styles.pressed,
      ]}>
      <View style={styles.iconChip}>
        <MaterialIcon name={cancerTypeIcon(cancer.name)} size={28} color={brand.headerPink} />
      </View>
      <AppText variant="label" numberOfLines={2} style={styles.name}>
        {cancer.name}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    // Two columns.
    width: '48.3%',
    aspectRatio: 1.2,
    borderRadius: radius.medium,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    backgroundColor: 'rgba(216, 27, 96, 0.1)',
  },
  iconChip: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(216, 27, 96, 0.1)',
  },
  name: {
    fontSize: 13,
    textAlign: 'center',
  },
});
