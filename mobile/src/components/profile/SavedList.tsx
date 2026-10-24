import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AppHeader } from '../AppHeader';
import { AppText } from '../AppText';
import { MaterialIcon } from '../MaterialIcon';
import { Screen } from '../Screen';
import { ErrorState, LoadingState } from '../StateViews';

// Layout for the Saved screen (from the Flutter saved_*_screen.dart screens).

type SavedListProps<T> = {
  title: string;
  subtitle: string;
  query: {
    data?: T[];
    isPending: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    isRefetching: boolean;
  };
  errorPrefix: string;
  empty: { icon: string; title: string; message: string; action: string; href: Href };
  renderItem: (item: T) => ReactNode;
  /** Shown above the list (the Saved screen's Questions / Help contacts switch). */
  top?: ReactNode;
};

export function SavedList<T>({
  title,
  subtitle,
  query,
  errorPrefix,
  empty,
  renderItem,
  top,
}: SavedListProps<T>) {
  const { colors } = useTheme();
  return (
    <Screen
      onRefresh={() => query.refetch()}
      refreshing={query.isRefetching}
      header={<AppHeader title={title} subtitle={subtitle} showBackButton />}>
      {top}
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={`${errorPrefix}: ${query.error?.message}`}
          onRetry={() => query.refetch()}
        />
      ) : !query.data?.length ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <MaterialIcon name={empty.icon} size={56} color={brand.headerPink} />
          </View>
          <AppText variant="titleLarge">{empty.title}</AppText>
          <AppText color={colors.textSecondary} style={styles.centered}>
            {empty.message}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate(empty.href)}
            style={styles.emptyButton}>
            <MaterialIcon name="explore" size={20} color={brand.white} />
            <AppText variant="label" color={brand.white}>
              {empty.action}
            </AppText>
          </Pressable>
        </View>
      ) : (
        query.data.map(renderItem)
      )}
    </Screen>
  );
}

/** Pink bookmark that removes the item from saved. */
export function RemoveBookmarkButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Remove bookmark"
      hitSlop={8}
      onPress={onPress}
      style={styles.remove}>
      <MaterialIcon name="bookmark" size={22} color={brand.headerPink} />
    </Pressable>
  );
}

/** Card container for a saved item. */
export function SavedCard({
  children,
  onPress,
  label,
}: {
  children: ReactNode;
  onPress?: () => void;
  label?: string;
}) {
  const { colors, isDark } = useTheme();
  const style = [
    styles.card,
    { backgroundColor: colors.card, borderColor: colors.divider },
    !isDark && styles.shadow,
  ];
  if (!onPress) return <View style={style}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [style, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: { textAlign: 'center' },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 48, paddingHorizontal: 16 },
  emptyIcon: { padding: 24, borderRadius: 60, backgroundColor: brand.lightPink, marginBottom: 8 },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: brand.headerPink,
  },
  remove: { padding: 4 },
  card: { borderRadius: radius.large, borderWidth: 1, padding: 16, gap: 10 },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: { opacity: 0.85 },
});
