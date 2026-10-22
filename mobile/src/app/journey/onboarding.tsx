import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateViews';

// Placeholder until Phase 5 (journey_onboarding_screen.dart). New users land here
// after registering, like in the Flutter app; "Skip for now" matches its Skip button.

export default function JourneyOnboardingScreen() {
  return (
    <Screen
      header={<AppHeader title="Start Your Journey" subtitle="Set up your journey tracker" />}>
      <EmptyState
        icon="auto_graph"
        title="Journey setup is coming soon"
        message="This screen is being rebuilt in migration Phase 5."
      />
      <Button title="Skip for now" onPress={() => router.replace('/home')} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
});
