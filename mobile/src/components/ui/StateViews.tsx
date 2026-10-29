import { useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { DURATION } from '@/theme/motion';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { decorative } from './a11y';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import {
  SkeletonCard,
  SkeletonCommunity,
  SkeletonHelp,
  SkeletonJourney,
  SkeletonLearn,
  SkeletonList,
} from './Skeleton';
import { Text } from './Text';

// Loading, error and empty states in the redesign style.

export type LoadingVariant =
  'spinner' | 'learn' | 'journey' | 'community' | 'help' | 'list' | 'card';

type LoadingStateProps = {
  message?: string;
  variant?: LoadingVariant;
};

export function LoadingState({ message, variant }: LoadingStateProps) {
  const { palette } = useDesign();

  if (variant === 'learn') return <SkeletonLearn />;
  if (variant === 'journey') return <SkeletonJourney />;
  if (variant === 'community') return <SkeletonCommunity />;
  if (variant === 'help') return <SkeletonHelp />;
  if (variant === 'list') return <SkeletonList count={4} />;
  if (variant === 'card') return <SkeletonCard />;

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Loading'}>
      <ActivityIndicator size="large" color={palette.action} />
      {message ? (
        <Text variant="supporting" tone="muted">
          {message}
        </Text>
      ) : null}
    </View>
  );
}

// Content that replaces a skeleton eases up 6 pt as it fades in. Layout animations skip
// themselves when Reduce Motion is on.
const ARRIVE = FadeInDown.duration(DURATION.slow).withInitialValues({
  opacity: 0,
  transform: [{ translateY: 6 }],
});

/** True once `loading` has been true, so content animates in only after a skeleton. */
export function useArrival(loading: boolean) {
  const [sawLoading, setSawLoading] = useState(loading);
  if (loading && !sawLoading) setSawLoading(true);
  return sawLoading;
}

/** Wraps what a screen shows after loading; keeps the screen's spacing between children. */
export function Arrive({ animate, children }: { animate: boolean; children: ReactNode }) {
  return (
    <Animated.View entering={animate ? ARRIVE : undefined} style={styles.arrive}>
      {children}
    </Animated.View>
  );
}

type ErrorStateProps = {
  message?: string;
  /** Shows a Retry button. */
  onRetry?: () => void;
};

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <StateIcon name="circle-alert" tone="danger" />
      <Text variant="body" style={styles.centered}>
        {message}
      </Text>
      {onRetry ? (
        <Button
          title="Try again"
          onPress={onRetry}
          variant="secondary"
          fullWidth={false}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

// One-line drawings in the ribbon's rounded stroke (120 x 100). Other icons use a tile.
const DRAWINGS: Partial<Record<IconName, string>> = {
  message:
    'M18 20C18 12 24 8 32 8H88C96 8 102 12 102 20V54C102 62 96 66 88 66H52L34 84V66H32C24 66 18 62 18 54Z M50 30C50 22 70 22 70 30C70 38 60 38 60 46 M60 55V55',
  bookmark: 'M40 8H80C85 8 88 11 88 16V90L60 70L32 90V16C32 11 35 8 40 8Z M48 30H72',
  search: 'M76 44A24 24 0 1 1 28 44A24 24 0 1 1 76 44Z M69 61L92 84 M40 40C42 34 46 31 52 30',
};

type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: IconName;
  /** The next step, as a button under the message. */
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ title, message, icon = 'info', action }: EmptyStateProps) {
  const { palette } = useDesign();
  const drawing = DRAWINGS[icon];
  return (
    <View style={styles.container}>
      {drawing ? (
        <Svg width={108} height={90} viewBox="0 0 120 100" fill="none" {...decorative}>
          <Path
            d={drawing}
            stroke={palette.action}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : (
        <StateIcon name={icon} tone="muted" />
      )}
      <Text variant="section" style={styles.centered}>
        {title}
      </Text>
      {message ? (
        <Text variant="body" tone="muted" style={styles.centered}>
          {message}
        </Text>
      ) : null}
      {action ? (
        <Button
          title={action.label}
          variant="secondary"
          fullWidth={false}
          style={styles.button}
          onPress={action.onPress}
        />
      ) : null}
    </View>
  );
}

function StateIcon({ name, tone }: { name: IconName; tone: 'muted' | 'danger' }) {
  const { palette } = useDesign();
  return (
    <View style={[styles.iconCircle, { backgroundColor: palette.raised }]}>
      <Icon name={name} size={36} tone={tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xxl,
    gap: space.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
  },
  centered: { textAlign: 'center', maxWidth: 320 },
  arrive: { gap: space.lg },
  button: { alignSelf: 'center', marginTop: space.xs },
});
