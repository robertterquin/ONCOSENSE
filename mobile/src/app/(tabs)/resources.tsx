import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { AllResources } from '@/api/resources';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { BookmarkButton } from '@/components/BookmarkButton';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import { ErrorState, LoadingState } from '@/components/StateViews';
import { useResourceBookmarks } from '@/hooks/useBookmarkToggle';
import { useAllResources } from '@/hooks/useResources';
import { callPhone } from '@/lib/links';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { Resource } from '@/types/resource';

// Port of lib/screens/resources/resources_screen.dart

const VERIFIED_GREEN = '#4CAF50';

type Variant = 'hotline' | 'center' | 'support' | 'group';

const SECTIONS: { key: keyof AllResources; title: string; empty: string; variant: Variant }[] = [
  { key: 'hotlines', title: 'Hotlines', empty: 'No hotlines available', variant: 'hotline' },
  {
    key: 'screeningCenters',
    title: 'Screening Centers',
    empty: 'No screening centers available',
    variant: 'center',
  },
  {
    key: 'financialSupport',
    title: 'Financial Support',
    empty: 'No financial support resources available',
    variant: 'support',
  },
  {
    key: 'supportGroups',
    title: 'Support Groups',
    empty: 'No support groups available',
    variant: 'group',
  },
];

export default function ResourcesTab() {
  const query = useAllResources();

  return (
    <Screen
      inTabs
      background="surface"
      onRefresh={() => query.refetch()}
      refreshing={query.isRefetching}
      header={<AppHeader title="Resources" subtitle="Find support, hotlines, and centers" />}>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={`Failed to load resources: ${query.error.message}`}
          onRetry={() => query.refetch()}
        />
      ) : (
        SECTIONS.map((section) => (
          <View key={section.key} style={styles.section}>
            <AppText variant="titleLarge">{section.title}</AppText>
            {query.data[section.key].length === 0 ? (
              <AppText secondary>{section.empty}</AppText>
            ) : (
              query.data[section.key].map((resource) => (
                <ResourceCard key={resource.id} resource={resource} variant={section.variant} />
              ))
            )}
          </View>
        ))
      )}
    </Screen>
  );
}

function ResourceCard({ resource, variant }: { resource: Resource; variant: Variant }) {
  const { colors, isDark } = useTheme();
  const bookmarks = useResourceBookmarks();
  const bookmark = (
    <BookmarkButton
      saved={bookmarks.isSaved(resource)}
      onPress={() => bookmarks.toggle(resource)}
      itemLabel="resource"
    />
  );
  const cardStyle = [
    styles.card,
    { backgroundColor: colors.card, borderColor: colors.divider },
    !isDark && styles.shadow,
  ];
  const name = (
    <AppText variant="label" style={styles.name}>
      {resource.name}
    </AppText>
  );
  const verifiedIcon = resource.isVerified ? (
    <MaterialIcon name="verified" size={variant === 'group' ? 18 : 20} color={VERIFIED_GREEN} />
  ) : null;

  if (variant === 'hotline') {
    // Tapping the card starts a call. The bookmark button sits beside the tappable
    // area rather than inside it (buttons can't contain buttons on the web).
    const call = () => resource.phone && callPhone(resource.phone);
    return (
      <View style={cardStyle}>
        <Row>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={resource.phone ? `Call ${resource.name}` : resource.name}
            disabled={!resource.phone}
            onPress={call}
            style={styles.flex}>
            {name}
          </Pressable>
          {resource.isVerified ? (
            <View style={styles.verifiedBadge}>
              <MaterialIcon name="verified" size={12} color={VERIFIED_GREEN} />
              <AppText style={styles.verifiedText}>Verified</AppText>
            </View>
          ) : null}
          {bookmark}
        </Row>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={resource.phone ? `Call ${resource.phone}` : undefined}
          disabled={!resource.phone}
          onPress={call}
          style={({ pressed }) => [styles.callArea, pressed && styles.pressed]}>
          <AppText variant="bodySmall" secondary>
            {resource.description}
          </AppText>
          {resource.phone ? (
            <Row style={styles.phoneRow}>
              <MaterialIcon name="phone" size={16} color={brand.headerPink} />
              <AppText variant="label" color={brand.headerPink} style={styles.flex}>
                {resource.phone}
              </AppText>
              <View style={styles.callChip}>
                <MaterialIcon name="call" size={14} color={brand.headerPink} />
              </View>
            </Row>
          ) : null}
        </Pressable>
      </View>
    );
  }

  if (variant === 'group') {
    return (
      <View style={cardStyle}>
        <Row>
          <View style={styles.groupIcon}>
            <MaterialIcon name="group" size={20} color={VERIFIED_GREEN} />
          </View>
          <View style={styles.flex}>
            {name}
            <AppText variant="bodySmall" secondary numberOfLines={1}>
              {resource.location ?? resource.description}
            </AppText>
          </View>
          {verifiedIcon}
          {bookmark}
        </Row>
      </View>
    );
  }

  // Screening centers and financial support.
  return (
    <View style={cardStyle}>
      <Row>
        <View style={styles.flex}>
          {name}
          {variant === 'center' ? (
            <AppText variant="bodySmall" secondary style={styles.description}>
              {resource.description}
            </AppText>
          ) : null}
        </View>
        {verifiedIcon}
        {bookmark}
      </Row>
      {variant === 'support' ? (
        <AppText variant="bodySmall" secondary>
          {resource.description}
        </AppText>
      ) : null}
      {variant === 'center' && resource.location ? (
        <Row style={styles.detailRow}>
          <MaterialIcon name="location_on" size={16} color="#2196F3" />
          <AppText variant="bodySmall" color="#2196F3" style={styles.flex}>
            {resource.location}
          </AppText>
        </Row>
      ) : null}
      {resource.phone ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Call ${resource.name}`}
          onPress={() => callPhone(resource.phone!)}>
          <Row style={styles.detailRow}>
            <MaterialIcon
              name="phone"
              size={variant === 'support' ? 14 : 16}
              color={variant === 'support' ? brand.headerPink : colors.textSecondary}
            />
            <AppText
              variant="bodySmall"
              color={variant === 'support' ? brand.headerPink : colors.textSecondary}>
              {resource.phone}
            </AppText>
          </Row>
        </Pressable>
      ) : null}
    </View>
  );
}

function Row({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    marginBottom: 8,
  },
  card: {
    padding: 16,
    borderRadius: radius.medium,
    borderWidth: 1,
    gap: 4,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  name: {
    fontSize: 14,
  },
  description: {
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: VERIFIED_GREEN,
  },
  callArea: {
    gap: 4,
  },
  phoneRow: {
    marginTop: 8,
  },
  callChip: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: brand.lightPink,
  },
  detailRow: {
    marginTop: 8,
  },
  groupIcon: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
});
