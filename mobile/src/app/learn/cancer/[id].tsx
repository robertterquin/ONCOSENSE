import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import { BulletList, SectionCard } from '@/components/SectionCard';
import { ErrorState, LoadingState } from '@/components/StateViews';
import { useCancerType } from '@/hooks/useCancerInfo';
import { queryKeys } from '@/hooks/queryKeys';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { CancerType } from '@/types/cancerType';

// Port of lib/screens/cancer_info/cancer_detail_screen.dart

export default function CancerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  // Opened from the list: show the already-loaded row instantly, then refresh.
  const fromList = queryClient
    .getQueryData<CancerType[]>(queryKeys.cancerTypes)
    ?.find((cancer) => cancer.id === id);
  const query = useCancerType(id);
  const cancer = query.data ?? fromList;

  if (!cancer) {
    return (
      <Screen header={<AppHeader title="Cancer Information" subtitle="" showBackButton />}>
        {query.isError ? (
          <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
        ) : (
          <LoadingState />
        )}
      </Screen>
    );
  }

  return (
    <Screen
      background="surface"
      header={
        <AppHeader
          title={cancer.name}
          subtitle={`Learn about ${cancer.name.toLowerCase()}`}
          showBackButton
        />
      }>
      <CancerDetails cancer={cancer} />
    </Screen>
  );
}

function CancerDetails({ cancer }: { cancer: CancerType }) {
  const { colors, isDark } = useTheme();
  return (
    <>
      <SectionCard title="About" icon="info_outline" iconColor="#2196F3">
        <AppText style={styles.body}>{cancer.description}</AppText>
      </SectionCard>
      {cancer.statistics ? (
        <SectionCard title="Statistics" icon="bar_chart" iconColor="#4CAF50">
          <AppText style={styles.body}>{cancer.statistics}</AppText>
        </SectionCard>
      ) : null}
      <SectionCard title="Symptoms & Warning Signs" icon="warning_amber" iconColor="#FF9800">
        <BulletList items={cancer.symptoms} color={brand.headerPink} />
      </SectionCard>
      <SectionCard title="Risk Factors" icon="shield" iconColor="#F44336">
        <BulletList items={cancer.riskFactors} color={brand.headerPink} />
      </SectionCard>
      <SectionCard title="Prevention Tips" icon="verified_user" iconColor="#9C27B0">
        <BulletList items={cancer.preventionTips} color={brand.headerPink} />
      </SectionCard>
      <SectionCard title="Screening Methods" icon="medical_services" iconColor="#00BCD4">
        <BulletList items={cancer.screeningMethods} color={brand.headerPink} />
      </SectionCard>
      <SectionCard title="Early Detection" icon="tips_and_updates" iconColor="#FFB300">
        <View
          style={[
            styles.highlight,
            { backgroundColor: isDark ? 'rgba(255, 179, 0, 0.15)' : '#FFF8E1' },
          ]}>
          <MaterialIcon name="lightbulb" size={20} color="#FFB300" />
          <AppText style={[styles.body, styles.flex]}>{cancer.earlyDetectionInfo}</AppText>
        </View>
      </SectionCard>

      <View
        style={[
          styles.disclaimer,
          { backgroundColor: isDark ? '#212121' : '#F5F5F5', borderColor: colors.divider },
        ]}>
        <MaterialIcon name="info_outline" size={20} color={colors.textSecondary} />
        <View style={styles.flex}>
          <AppText variant="label" style={styles.disclaimerTitle}>
            Medical Disclaimer
          </AppText>
          <AppText variant="bodySmall" secondary style={styles.disclaimerText}>
            This information is for educational purposes only. Always consult with healthcare
            professionals for medical advice, diagnosis, or treatment.
          </AppText>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    lineHeight: 22,
    opacity: 0.85,
  },
  flex: {
    flex: 1,
  },
  highlight: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  disclaimer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: radius.medium,
    borderWidth: 1,
    marginTop: 8,
  },
  disclaimerTitle: {
    fontSize: 13,
  },
  disclaimerText: {
    marginTop: 6,
    lineHeight: 18,
  },
});
