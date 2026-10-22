import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import { ErrorState, LoadingState } from '@/components/StateViews';
import { usePreventionTips, useSelfCheckGuides } from '@/hooks/usePrevention';
import { openWebPage } from '@/lib/links';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { PreventionTip } from '@/types/preventionTip';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

// Port of lib/screens/prevention/prevention_screen.dart. Guide details open in
// src/app/prevention/guide/[id].tsx (a modal, like Flutter's bottom sheet).

export default function PreventionTab() {
  const tips = usePreventionTips();
  const guides = useSelfCheckGuides();
  const isPending = tips.isPending || guides.isPending;
  const isError = tips.isError || guides.isError;
  const refetch = () => Promise.all([tips.refetch(), guides.refetch()]);

  return (
    <Screen
      inTabs
      onRefresh={refetch}
      refreshing={tips.isRefetching || guides.isRefetching}
      header={
        <AppHeader title="Prevention & Lifestyle" subtitle="Healthy tips for a cancer-free life" />
      }>
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message="Failed to load prevention data. Please try again." onRetry={refetch} />
      ) : (
        <>
          <SectionHeading
            title="Prevention Tips"
            subtitle="Evidence-based tips from trusted medical sources"
          />
          {tips.data!.length === 0 ? (
            <AppText secondary style={styles.empty}>
              No prevention tips available at this time.
            </AppText>
          ) : (
            tips.data!.map((tip) => <TipCard key={tip.id} tip={tip} />)
          )}

          <SectionHeading
            title="Self-Check Guides"
            subtitle="Learn how to perform self-examinations"
          />
          {guides.data!.length === 0 ? (
            <AppText secondary style={styles.empty}>
              No self-check guides available at this time.
            </AppText>
          ) : (
            guides.data!.map((guide) => <GuideCard key={guide.id} guide={guide} />)
          )}
        </>
      )}
    </Screen>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.heading}>
      <AppText variant="titleLarge">{title}</AppText>
      <AppText variant="bodySmall" secondary>
        {subtitle}
      </AppText>
    </View>
  );
}

function SourceLink({ name, url, size = 11 }: { name: string; url: string; size?: number }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Source: ${name}`}
      onPress={() => openWebPage(url)}
      style={styles.source}>
      <MaterialIcon name="verified" size={size + 3} color="#4CAF50" />
      <AppText style={[styles.sourceText, { fontSize: size }]}>Source: {name}</AppText>
    </Pressable>
  );
}

function TipCard({ tip }: { tip: PreventionTip }) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.divider },
        !isDark && styles.shadow,
      ]}>
      <View style={styles.row}>
        <View style={styles.tipIcon}>
          <MaterialIcon
            name={tip.iconName}
            fallback="info-outline"
            size={24}
            color={brand.headerPink}
          />
        </View>
        <View style={styles.flex}>
          <AppText variant="label">{tip.title}</AppText>
          <AppText variant="bodySmall" secondary style={styles.gapTop}>
            {tip.description}
          </AppText>
        </View>
      </View>
      {tip.detailedInfo ? (
        <AppText variant="bodySmall" style={styles.detail}>
          {tip.detailedInfo}
        </AppText>
      ) : null}
      <SourceLink name={tip.sourceName} url={tip.sourceUrl} />
    </View>
  );
}

function GuideCard({ guide }: { guide: SelfCheckGuide }) {
  const { isDark } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${guide.title}. Open guide`}
      onPress={() => router.push({ pathname: '/prevention/guide/[id]', params: { id: guide.id } })}
      style={({ pressed }) => [
        styles.card,
        styles.guideCard,
        { backgroundColor: isDark ? 'rgba(216, 27, 96, 0.15)' : brand.lightPink },
        pressed && styles.pressed,
      ]}>
      <View style={styles.row}>
        <View style={styles.guideIcon}>
          <MaterialIcon name="school" size={20} color={brand.white} />
        </View>
        <View style={styles.flex}>
          <AppText variant="label" color={isDark ? brand.white : '#212121'}>
            {guide.title}
          </AppText>
          <AppText
            variant="bodySmall"
            color={isDark ? 'rgba(255,255,255,0.7)' : '#757575'}
            style={styles.gapTop}>
            {guide.description}
          </AppText>
        </View>
        <MaterialIcon name="arrow_forward_ios" size={16} color={isDark ? brand.white : '#212121'} />
      </View>
      <View style={styles.chips}>
        <View style={styles.chip}>
          <AppText style={[styles.chipText, styles.chipPink]}>{guide.cancerType}</AppText>
        </View>
        <View style={styles.chip}>
          <AppText style={[styles.chipText, styles.chipGray]}>{guide.frequency}</AppText>
        </View>
      </View>
      <View style={styles.source}>
        <MaterialIcon name="verified" size={12} color="#4CAF50" />
        <AppText style={styles.guideSource}>Source: {guide.sourceName}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: 4,
    marginTop: 8,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 24,
  },
  card: {
    padding: 16,
    borderRadius: radius.medium,
    borderWidth: 1,
    gap: 12,
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
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  gapTop: {
    marginTop: 4,
  },
  tipIcon: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(216, 27, 96, 0.1)',
  },
  detail: {
    lineHeight: 17,
    opacity: 0.8,
  },
  source: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceText: {
    flex: 1,
    color: '#1976D2',
    textDecorationLine: 'underline',
  },
  guideCard: {
    borderColor: 'rgba(216, 27, 96, 0.2)',
    gap: 8,
  },
  guideIcon: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: brand.headerPink,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  chipText: {
    fontSize: 11,
  },
  chipPink: {
    color: brand.headerPink,
    fontFamily: 'Poppins_500Medium',
  },
  chipGray: {
    color: '#757575',
  },
  guideSource: {
    fontSize: 10,
    color: '#616161',
  },
});
