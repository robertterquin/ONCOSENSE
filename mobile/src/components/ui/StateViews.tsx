import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

// Loading, error and empty states in the redesign style.

export function LoadingState({ message }: { message?: string }) {
  const { palette } = useDesign();
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

type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: IconName;
};

export function EmptyState({ title, message, icon = 'info' }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <StateIcon name={icon} tone="muted" />
      <Text variant="section" style={styles.centered}>
        {title}
      </Text>
      {message ? (
        <Text variant="body" tone="muted" style={styles.centered}>
          {message}
        </Text>
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
  button: { alignSelf: 'center', marginTop: space.xs },
});
