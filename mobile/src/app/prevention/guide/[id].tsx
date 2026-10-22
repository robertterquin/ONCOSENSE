import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { MaterialIcon } from '@/components/MaterialIcon';
import { ErrorState, LoadingState } from '@/components/StateViews';
import { useSelfCheckGuide } from '@/hooks/usePrevention';
import { openWebPage } from '@/lib/links';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

// Guide details: the Flutter Prevention screen's bottom sheet, as a modal screen.

const close = () => (router.canGoBack() ? router.back() : router.replace('/prevention'));

export default function GuideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useSelfCheckGuide(id);
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.sheet, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
      <View style={[styles.handle, { backgroundColor: isDark ? '#616161' : '#E0E0E0' }]} />
      {query.data ? (
        <GuideDetails guide={query.data} bottomInset={insets.bottom} />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : (
        <LoadingState />
      )}
    </View>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <View style={styles.chip}>
      <AppText style={styles.chipText}>{text}</AppText>
    </View>
  );
}

function GuideDetails({ guide, bottomInset }: { guide: SelfCheckGuide; bottomInset: number }) {
  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + bottomInset }]}>
      <AppText variant="headlineMedium" color={brand.headerPink} style={styles.bold}>
        {guide.title}
      </AppText>
      <AppText variant="bodyLarge" secondary>
        {guide.description}
      </AppText>
      <View style={styles.chips}>
        <Chip text={`Type: ${guide.cancerType}`} />
        <Chip text={`Frequency: ${guide.frequency}`} />
        {guide.ageRecommendation ? (
          <Chip text={`Recommended for: ${guide.ageRecommendation}`} />
        ) : null}
      </View>

      <AppText variant="titleLarge" style={[styles.bold, styles.sectionTitle]}>
        Steps to Follow
      </AppText>
      {guide.steps.map((step) => (
        <View key={step.step} style={styles.step}>
          <View style={styles.row}>
            <View style={styles.stepNumber}>
              <AppText variant="titleMedium" color={brand.white} style={styles.bold}>
                {step.step}
              </AppText>
            </View>
            <AppText variant="label" color="#424242" style={styles.flex}>
              {step.instruction}
            </AppText>
          </View>
          <AppText color="#616161" style={styles.stepDetail}>
            {step.detail}
          </AppText>
        </View>
      ))}

      {guide.warningSigns?.length ? (
        <>
          <AppText variant="titleLarge" color="#F57C00" style={[styles.bold, styles.sectionTitle]}>
            ⚠️ Warning Signs
          </AppText>
          {guide.warningSigns.map((sign) => (
            <View key={sign} style={styles.warning}>
              <MaterialIcon name="warning_amber" size={20} color="#F57C00" />
              <AppText style={styles.flex}>{sign}</AppText>
            </View>
          ))}
        </>
      ) : null}

      <View style={styles.doctor}>
        <View style={styles.row}>
          <MaterialIcon name="medical_services" size={22} color={brand.headerPink} />
          <AppText variant="titleMedium" color={brand.headerPink} style={styles.bold}>
            When to See a Doctor
          </AppText>
        </View>
        <AppText color="#424242" style={styles.doctorText}>
          {guide.whenToSeeDoctor}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="link"
        onPress={() => openWebPage(guide.sourceUrl)}
        style={styles.row}>
        <MaterialIcon name="verified" size={16} color="#4CAF50" />
        <AppText variant="bodySmall" style={styles.sourceText}>
          Source: {guide.sourceName}
        </AppText>
      </Pressable>

      <Button title="Close" onPress={close} style={styles.close} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  content: {
    padding: 24,
    gap: 12,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  bold: {
    fontFamily: 'Poppins_700Bold',
  },
  sectionTitle: {
    marginTop: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E1BEE7',
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#6A1B9A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  step: {
    padding: 16,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: '#CE93D8',
    backgroundColor: '#F3E5F5',
    gap: 8,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: brand.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  stepDetail: {
    fontSize: 13,
    lineHeight: 18,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  doctor: {
    marginTop: 12,
    padding: 16,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: brand.headerPink,
    backgroundColor: '#FFEBEE',
    gap: 8,
  },
  doctorText: {
    lineHeight: 21,
  },
  sourceText: {
    flex: 1,
    color: '#1976D2',
    textDecorationLine: 'underline',
  },
  close: {
    marginTop: 12,
  },
});
