import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  ComingUp,
  EnergyAndPain,
  Milestones,
  RecentCheckIns,
  ThisWeek,
  Treatments,
} from '@/components/journey/Dashboard';
import {
  ErrorState,
  LoadingState,
  Banner,
  Button,
  RibbonMark,
  Screen,
  Text,
} from '@/components/ui';
import { useFocus } from '@/hooks/useFocus';
import {
  useAppointments,
  useJourneyEntries,
  useJourneySetup,
  useMilestones,
  useTreatments,
} from '@/hooks/useJourney';
import { useNow } from '@/hooks/useNow';
import { entryForDate } from '@/lib/journey';
import { focusSubtitle, forFocus, usesJourney } from '@/lib/focus';
import { useIsSignedIn } from '@/stores/authStore';
import { space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import { upcomingAppointments } from '@/types/appointment';

// The Journey tab (redesign Phase 4): opt-in by focus. Learning (or no focus yet)
// shows a short invitation; Treatment, Finished and Caring show the dashboard.

export default function JourneyTab() {
  const focus = useFocus();
  const signedIn = useIsSignedIn();
  const { journeyStarted } = useJourneySetup();

  if (!usesJourney(focus)) {
    return (
      <Invitation
        title="Track how you feel"
        body="Journey keeps daily check-ins, treatments and appointments in one place, and can turn them into a summary for your doctor."
        action={{
          label: focus ? 'Change what brings you here' : 'Set up Journey',
          onPress: () => router.push('/journey/focus'),
        }}
      />
    );
  }
  if (!signedIn) {
    return (
      <Invitation
        title="Sign in to keep a journey"
        body="Check-ins, treatments and appointments are saved to your account, so they're safe if you change phones."
        action={{ label: 'Sign in', onPress: () => router.push('/login') }}
        secondary={{ label: 'Change focus', onPress: () => router.push('/journey/focus') }}
      />
    );
  }
  if (!journeyStarted) {
    return (
      <Invitation
        title="Finish setting up Journey"
        body="A couple of dates help Journey show how things change over time."
        action={{ label: 'Continue', onPress: () => router.push('/journey/focus') }}
      />
    );
  }
  return <Dashboard />;
}

function Dashboard() {
  const focus = useFocus();
  const now = useNow(60_000);
  const { diagnosisDate, cancerFreeDate } = useJourneySetup();
  const entries = useJourneyEntries();
  const treatments = useTreatments();
  const milestones = useMilestones();
  const appointments = useAppointments();
  const queries = [entries, treatments, milestones, appointments];

  const loading = queries.some((query) => query.isPending);
  // Offline or a failed request: say so instead of showing an empty journey.
  const failed = queries.some((query) => query.isError && !query.data);
  const refresh = () => queries.forEach((query) => void query.refetch());
  const entryList = entries.data ?? [];
  const checkedInToday = entryForDate(entryList, now) !== undefined;

  return (
    <Screen
      inTabs
      title="My journey"
      subtitle={focusSubtitle(focus, diagnosisDate, cancerFreeDate)}
      onRefresh={refresh}
      refreshing={queries.some((query) => query.isRefetching)}>
      <Button
        title={
          checkedInToday
            ? 'Edit today’s check-in'
            : forFocus(focus, 'Check in', 'Check in for them')
        }
        icon={checkedInToday ? 'check' : 'plus'}
        onPress={() => router.push('/journey/check-in')}
      />
      {loading ? (
        <LoadingState message="Loading your journey" />
      ) : failed ? (
        <ErrorState
          message="Couldn't load your journey. Check your connection and try again."
          onRetry={refresh}
        />
      ) : (
        <>
          <ThisWeek entries={entryList} now={now} />
          <EnergyAndPain entries={entryList} now={now} />
          <ComingUp appointments={upcomingAppointments(appointments.data ?? [], now)} />
          <Treatments treatments={treatments.data ?? []} />
          <Milestones milestones={milestones.data ?? []} />
          <RecentCheckIns entries={entryList} />
          <Button
            title="Share a summary with my doctor"
            icon="share"
            variant="secondary"
            onPress={() => router.push('/journey/summary')}
          />
        </>
      )}
    </Screen>
  );
}

type Action = { label: string; onPress: () => void };

function Invitation({
  title,
  body,
  action,
  secondary,
}: {
  title: string;
  body: string;
  action: Action;
  secondary?: Action;
}) {
  const { palette } = useDesign();
  return (
    <Screen inTabs title="Journey">
      <View style={styles.invitation}>
        <RibbonMark height={96} color={palette.action} />
        <Text variant="heading" style={styles.centered} accessibilityRole="header">
          {title}
        </Text>
        <Text variant="body" tone="muted" style={styles.centered}>
          {body}
        </Text>
        <Button title={action.label} onPress={action.onPress} />
        {secondary ? (
          <Button title={secondary.label} variant="quiet" onPress={secondary.onPress} />
        ) : null}
      </View>
      <Banner tone="info">
        Learn, Today and the self-checks work for everyone, with or without Journey.
      </Banner>
    </Screen>
  );
}

const styles = StyleSheet.create({
  invitation: { alignItems: 'center', gap: space.lg, paddingVertical: space.xxl },
  centered: { textAlign: 'center' },
});
