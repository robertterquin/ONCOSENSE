import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import type { HealthTip } from '@/types/healthTip';

import { AppText } from '../AppText';
import { MaterialIcon } from '../MaterialIcon';

// Daily tip card and the cancer-awareness-month banner from home_screen.dart.

export function DailyTipCard({ tip }: { tip: HealthTip }) {
  return (
    <LinearGradient
      colors={['#F48FB1', '#F06292']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.tipCard, styles.tipShadow]}>
      <View style={styles.tipIcon}>
        <MaterialIcon name="lightbulb_outline" size={32} color={brand.white} />
      </View>
      <View style={styles.flex}>
        <View style={styles.tipLabelRow}>
          <AppText variant="bodySmall" color="rgba(255,255,255,0.7)" style={styles.medium}>
            Daily Health Tip
          </AppText>
          <View style={styles.tipCategory}>
            <AppText style={styles.tipCategoryText}>{tip.category}</AppText>
          </View>
        </View>
        <AppText color={brand.white} style={styles.tipText}>
          {tip.tip}
        </AppText>
      </View>
    </LinearGradient>
  );
}

const AWARENESS_MONTHS = [
  {
    emoji: '🎗️',
    month: 'January',
    title: 'Cervical Cancer',
    subtitle: 'Know the signs and prevention methods',
  },
  {
    emoji: '🛡️',
    month: 'February',
    title: 'Cancer Prevention',
    subtitle: 'Healthy habits reduce your risk',
  },
  {
    emoji: '🎗️',
    month: 'March',
    title: 'Colorectal Cancer',
    subtitle: 'Early screening saves lives',
  },
  {
    emoji: '💪',
    month: 'April',
    title: 'Testicular Cancer',
    subtitle: 'Self-checks are important',
  },
  { emoji: '☀️', month: 'May', title: 'Skin Cancer', subtitle: 'Protect yourself from UV rays' },
  { emoji: '🧠', month: 'June', title: 'Brain Tumor', subtitle: 'Awareness and early detection' },
  { emoji: '👩', month: 'July', title: 'Ovarian Cancer', subtitle: 'Know the symptoms' },
  {
    emoji: '🗣️',
    month: 'August',
    title: 'Head & Neck Cancer',
    subtitle: 'Screening and prevention',
  },
  { emoji: '👩', month: 'September', title: 'Ovarian Cancer', subtitle: 'Support and awareness' },
  { emoji: '💗', month: 'October', title: 'Breast Cancer', subtitle: 'Early detection matters' },
  { emoji: '💨', month: 'November', title: 'Lung Cancer', subtitle: 'Learn about prevention' },
  {
    emoji: '🎗️',
    month: 'December',
    title: 'National Cancer',
    subtitle: 'Learn about early detection & prevention',
  },
];

export function awarenessForMonth(date: Date = new Date()) {
  return AWARENESS_MONTHS[date.getMonth()];
}

/** Always light pink, so the text stays dark in both themes. */
export function AwarenessBanner() {
  const awareness = awarenessForMonth();
  return (
    <LinearGradient
      colors={['#FCE4EC', '#F8BBD0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}>
      <View style={[styles.bubble, styles.bubbleTop]} />
      <View style={[styles.bubble, styles.bubbleBottom]} />
      <View style={styles.monthPill}>
        <AppText variant="bodySmall" color={brand.white} style={styles.semiBold}>
          {awareness.emoji} {awareness.month}
        </AppText>
      </View>
      <AppText variant="titleLarge" color="#212121" style={styles.bannerTitle}>
        {awareness.title}
        {'\n'}Awareness Month
      </AppText>
      <AppText variant="bodySmall" color="#757575">
        {awareness.subtitle}
      </AppText>
      {/* Flutter's button did nothing yet; it opens the Info tab here. */}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.navigate('/learn')}
        style={({ pressed }) => [styles.learnMore, pressed && styles.pressed]}>
        <AppText variant="bodySmall" color={brand.white} style={styles.semiBold}>
          Learn More
        </AppText>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  medium: {
    fontFamily: 'Poppins_500Medium',
  },
  semiBold: {
    fontFamily: 'Poppins_600SemiBold',
  },
  pressed: {
    opacity: 0.8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: radius.large,
  },
  tipShadow: {
    shadowColor: '#F48FB1',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tipIcon: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipCategory: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipCategoryText: {
    fontSize: 10,
    color: brand.white,
    fontFamily: 'Poppins_600SemiBold',
  },
  tipText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  banner: {
    height: 240,
    borderRadius: radius.large,
    padding: 16,
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
  },
  bubbleTop: {
    width: 80,
    height: 80,
    right: -20,
    top: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  bubbleBottom: {
    width: 100,
    height: 100,
    right: 40,
    bottom: -30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  monthPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: brand.headerPink,
  },
  bannerTitle: {
    fontFamily: 'Poppins_700Bold',
    lineHeight: 24,
  },
  learnMore: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: brand.headerPink,
  },
});
