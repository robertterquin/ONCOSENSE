import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { MaterialIcon } from './MaterialIcon';
import { Button } from './ui/Button';
import { Icon, ICON_NAMES, type IconName } from './ui/Icon';
import { Text } from './ui/Text';

// Loading, error and empty states in the redesign style. Screens not yet redesigned
// pass Material icon names; those still render until every screen uses Lucide names.

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
  /** Lucide icon name (or, on older screens, a Material icon name). */
  icon?: IconName | string;
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

function StateIcon({ name, tone }: { name: string; tone: 'muted' | 'danger' }) {
  const { palette } = useDesign();
  const isLucide = (ICON_NAMES as string[]).includes(name);
  return (
    <View style={[styles.iconCircle, { backgroundColor: palette.raised }]}>
      {isLucide ? (
        <Icon name={name as IconName} size={36} tone={tone} />
      ) : (
        <MaterialIcon name={name} size={36} color={palette[tone]} />
      )}
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
