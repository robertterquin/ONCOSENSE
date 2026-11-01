import { router } from 'expo-router';

import { MyHealth, MyHealthSections } from '@/components/journey/MyHealth';
import { useMyCancer } from '@/hooks/useCancerInfo';
import { StyleSheet, View } from 'react-native';

import { ProfileButton } from '@/components/account/ProfileButton';
import {
  ComingUp,
  EnergyAndPain,
  HowYouveBeen,
  Milestones,
  RecentCheckIns,
  Treatments,
} from '@/components/journey/Dashboard';
import { ThreadWeek } from '@/components/journey/ThreadWeek';
import {
  ErrorState,
  LoadingState,
  Arrive,
  useArrival,
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
import { addDays } from '@/lib/dates';
import { entryForDate } from '@/lib/journey';
import { startOfDay } from '@/lib/selfCheck';
import { focusSubtitle, usesJourney } from '@/lib/focus';
import { useIsSignedIn } from '@/stores/authStore';
import { space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import { upcomingAppointments } from '@/types/appointment';

// The Journey tab (redesign Phase 4): by focus. Learning (or no focus yet) shows My health
// (design refresh Phase 19); Treatment shows the daily dashboard, Finished a weekly one.

export default function JourneyTab() {
  const focus = useFocus();
  const signedIn = useIsSignedIn();
  const { journeyStarted } = useJourneySetup();

  // Learning (or no focus yet): their checks and habits over time, with a way into Journey.
  if (!usesJourney(focus)) return <MyHealth />;
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
  const myCancer = useMyCancer();
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
  // After treatment, Journey is weekly: follow-ups, how the weeks have gone, their checks
  // and habits, and past treatments (no daily dots, streaks or session counters).
  const survivor = focus === 'finished';
  const weekStart = addDays(startOfDay(now), -6);
  const thisWeek = entryList.find((entry) => entry.date >= weekStart);

  const arrived = useArrival(loading);
  return (
    <Screen
      inTabs
      tab="journey"
      title="Journey"
      subtitle={[myCancer?.name, focusSubtitle(focus, diagnosisDate, cancerFreeDate)]
        .filter(Boolean)
        .join(' · ')}
      titleAside={<ProfileButton />}
      onRefresh={refresh}
      refreshing={queries.some((query) => query.isRefetching)}>
      {loading ? (
        <LoadingState variant="journey" message="Loading your journey" />
      ) : (
        <Arrive animate={arrived}>
          {failed ? (
            <ErrorState
              message="Couldn't load your journey. Check your connection and try again."
              onRetry={refresh}
            />
          ) : (
            <>
              {survivor ? (
                <>
                  <Button
                    title={thisWeek ? 'Edit this week’s check-in' : 'Check in for this week'}
                    icon={thisWeek ? 'check' : 'plus'}
                    variant={thisWeek ? 'tinted' : 'primary'}
                    onPress={() =>
                      router.push(
                        thisWeek
                          ? { pathname: '/journey/check-in', params: { id: thisWeek.id } }
                          : '/journey/check-in',
                      )
                    }
                  />
                  <ComingUp
                    appointments={upcomingAppointments(appointments.data ?? [], now)}
                    title="Follow-ups"
                  />
                  <HowYouveBeen entries={entryList} now={now} />
                  <Text variant="section" accessibilityRole="header">
                    My health
                  </Text>
                  <MyHealthSections />
                  <Treatments treatments={treatments.data ?? []} past />
                </>
              ) : (
                <>
                  <ThreadWeek entries={entryList} now={now} />
                  <Button
                    title={checkedInToday ? 'Edit today’s check-in' : 'Check in for today'}
                    icon={checkedInToday ? 'check' : 'plus'}
                    // Done for today, so it steps back; bright only while it's still to do.
                    variant={checkedInToday ? 'tinted' : 'primary'}
                    onPress={() => router.push('/journey/check-in')}
                  />
                  <EnergyAndPain entries={entryList} now={now} />
                  <ComingUp appointments={upcomingAppointments(appointments.data ?? [], now)} />
                  <Treatments treatments={treatments.data ?? []} />
                  <Milestones milestones={milestones.data ?? []} />
                  <RecentCheckIns entries={entryList} />
                </>
              )}
              <Button
                title="Share with my doctor"
                icon="share"
                variant="secondary"
                onPress={() => router.push('/journey/summary')}
              />
            </>
          )}
        </Arrive>
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
    <Screen inTabs tab="journey" title="Journey" titleAside={<ProfileButton />}>
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
