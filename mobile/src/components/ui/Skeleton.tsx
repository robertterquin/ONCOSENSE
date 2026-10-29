import { useEffect } from 'react';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { elevation } from '@/theme/elevation';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Animated skeleton block with a gentle breathing pulse.
 * Respects system reduced motion and theme tokens.
 */
export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { palette } = useDesign();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.5;
      return;
    }
    opacity.value = withRepeat(
      withSequence(withTiming(0.85, { duration: 850 }), withTiming(0.4, { duration: 850 })),
      -1,
      true,
    );
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: palette.raised,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Mimics a single list row (icon tile + 2 lines of text). */
export function SkeletonRow({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.row, style]}>
      <Skeleton width={44} height={44} borderRadius={radii.tile} />
      <View style={styles.rowText}>
        <Skeleton width="65%" height={16} borderRadius={6} />
        <Skeleton width="40%" height={12} borderRadius={4} />
      </View>
    </View>
  );
}

/** Mimics a single insight or action card. */
export function SkeletonCard({
  width = '100%',
  height = 180,
  style,
}: {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}) {
  const { palette, isDark } = useDesign();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, width, height },
        elevation('resting', palette, isDark),
        style,
      ]}>
      <View style={styles.cardHeader}>
        <Skeleton width={56} height={22} borderRadius={radii.round} />
        <Skeleton width={32} height={32} borderRadius={10} />
      </View>
      <View style={styles.cardBody}>
        <Skeleton width="75%" height={18} borderRadius={6} />
        <Skeleton width="92%" height={13} borderRadius={4} />
        <Skeleton width="60%" height={13} borderRadius={4} />
      </View>
      <View style={[styles.cardFooter, { borderTopColor: palette.line }]}>
        <Skeleton width={50} height={12} borderRadius={4} />
        <Skeleton width={65} height={12} borderRadius={4} />
      </View>
    </View>
  );
}

/** Mimics a section container filled with rows. */
export function SkeletonList({
  count = 3,
  style,
}: {
  count?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { palette, isDark } = useDesign();
  return (
    <View
      style={[
        styles.listContainer,
        { backgroundColor: palette.surface },
        elevation('resting', palette, isDark),
        style,
      ]}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.listItem,
            i < count - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: palette.line,
            },
          ]}>
          <SkeletonRow />
        </View>
      ))}
    </View>
  );
}

/** Pre-assembled skeleton layout matching the Learn tab. */
export function SkeletonLearn() {
  return (
    <View style={styles.stack}>
      <View style={styles.headingBlock}>
        <Skeleton width={140} height={20} borderRadius={6} />
        <Skeleton width={220} height={14} borderRadius={4} />
      </View>
      <SkeletonList count={3} />
      <View style={styles.headingBlock}>
        <Skeleton width={160} height={20} borderRadius={6} />
      </View>
      <View style={styles.carouselRow}>
        <SkeletonCard width={238} height={184} />
        <SkeletonCard width={120} height={184} />
      </View>
    </View>
  );
}

/** Pre-assembled skeleton layout matching the Journey tab. */
export function SkeletonJourney() {
  const { palette, isDark } = useDesign();
  return (
    <View style={styles.stack}>
      {/* Week dots */}
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface },
          elevation('resting', palette, isDark),
        ]}>
        <View style={styles.weekDots}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} width={34} height={48} borderRadius={10} />
          ))}
        </View>
      </View>
      {/* Chart placeholder */}
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, height: 220 },
          elevation('resting', palette, isDark),
        ]}>
        <Skeleton width={160} height={18} borderRadius={6} />
        <View style={styles.chartBars}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} width={22} height={50 + (i % 3) * 35} borderRadius={6} />
          ))}
        </View>
      </View>
    </View>
  );
}

/** Pre-assembled skeleton layout matching the Community tab. */
export function SkeletonCommunity() {
  return (
    <View style={styles.stack}>
      {/* Search box & filter pills */}
      <Skeleton height={46} borderRadius={radii.control} />
      <View style={styles.pillsRow}>
        <Skeleton width={70} height={32} borderRadius={radii.round} />
        <Skeleton width={90} height={32} borderRadius={radii.round} />
        <Skeleton width={80} height={32} borderRadius={radii.round} />
        <Skeleton width={60} height={32} borderRadius={radii.round} />
      </View>
      <SkeletonList count={4} />
    </View>
  );
}

/** Pre-assembled skeleton layout matching the Help tab. */
export function SkeletonHelp() {
  return (
    <View style={styles.stack}>
      {/* Crisis Banner */}
      <Skeleton height={110} borderRadius={radii.section} />
      {/* Near chips */}
      <View style={styles.pillsRow}>
        <Skeleton width={80} height={32} borderRadius={radii.round} />
        <Skeleton width={110} height={32} borderRadius={radii.round} />
        <Skeleton width={90} height={32} borderRadius={radii.round} />
      </View>
      <SkeletonList count={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: space.lg,
    width: '100%',
  },
  headingBlock: {
    gap: space.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  rowText: {
    flex: 1,
    gap: space.xs + 2,
  },
  listContainer: {
    borderRadius: radii.section,
    overflow: 'hidden',
  },
  listItem: {
    padding: space.md,
  },
  card: {
    borderRadius: radii.section,
    padding: space.lg,
    justifyContent: 'space-between',
    gap: space.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBody: {
    gap: space.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  carouselRow: {
    flexDirection: 'row',
    gap: space.md,
    overflow: 'hidden',
  },
  weekDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    flex: 1,
    paddingTop: space.md,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
});
