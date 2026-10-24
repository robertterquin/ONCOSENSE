import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { cancerTypeIcon } from '@/lib/cancerIcons';
import { openWebPage } from '@/lib/links';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { CancerType } from '@/types/cancerType';
import type { PreventionTip } from '@/types/preventionTip';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

import { AppText } from '../AppText';
import { MaterialIcon } from '../MaterialIcon';

// Cards for the Learn tab, from cancer_info_screen.dart and prevention_screen.dart.
// Restyled in redesign Phase 3.

export function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
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

export function TipCard({ tip }: { tip: PreventionTip }) {
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

export function GuideCard({ guide }: { guide: SelfCheckGuide }) {
  const { isDark } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${guide.title}. Open guide`}
      onPress={() => router.push({ pathname: '/learn/check/[id]', params: { id: guide.id } })}
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

export function CancerTypeCard({ cancer }: { cancer: CancerType }) {
  const { colors, isDark } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={cancer.name}
      onPress={() => router.push({ pathname: '/learn/cancer/[id]', params: { id: cancer.id } })}
      style={({ pressed }) => [
        typeStyles.card,
        { backgroundColor: colors.card, borderColor: colors.divider },
        !isDark && typeStyles.shadow,
        pressed && typeStyles.pressed,
      ]}>
      <View style={typeStyles.iconChip}>
        <MaterialIcon name={cancerTypeIcon(cancer.name)} size={28} color={brand.headerPink} />
      </View>
      <AppText variant="label" numberOfLines={2} style={typeStyles.name}>
        {cancer.name}
      </AppText>
    </Pressable>
  );
}

const typeStyles = StyleSheet.create({
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
