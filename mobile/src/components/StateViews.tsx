import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { brand } from '@/theme/colors';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AppText } from './AppText';
import { Button } from './Button';
import { MaterialIcon } from './MaterialIcon';

export function LoadingState({ message }: { message?: string }) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Loading'}>
      <ActivityIndicator size="large" color={brand.primaryPink} />
      {message ? <AppText secondary>{message}</AppText> : null}
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
    <View style={styles.container}>
      <MaterialIcon name="error_outline" size={48} color={brand.error} />
      <AppText style={styles.centered}>{message}</AppText>
      {onRetry ? <Button title="Retry" onPress={onRetry} outlined style={styles.button} /> : null}
    </View>
  );
}

type EmptyStateProps = {
  title: string;
  message?: string;
  /** Material icon name. */
  icon?: string;
};

export function EmptyState({ title, message, icon = 'inbox' }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <MaterialIcon name={icon} size={56} color={colors.textSecondary} />
      <AppText variant="titleMedium" style={styles.centered}>
        {title}
      </AppText>
      {message ? (
        <AppText secondary style={styles.centered}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.large,
    gap: spacing.small,
  },
  centered: {
    textAlign: 'center',
  },
  button: {
    alignSelf: 'center',
    marginTop: spacing.small,
  },
});
