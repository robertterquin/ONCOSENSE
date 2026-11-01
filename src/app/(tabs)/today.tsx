import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { hasCompletedJourneySetup, userDisplayName } from '@/api/auth';
import { ProfileButton } from '@/components/account/ProfileButton';
import { ChecksCard } from '@/components/today/ChecksCard';
import {
  CaregiverRetiredCard,
  ComingUpToday,
  HabitsRow,
  MoodCard,
  SupportCard,
  YourCancerTodayCard,
} from '@/components/today/TodayParts';
import { IconButton, NextStepPanel, Screen, Text } from '@/components/ui';
import { useMyCancer } from '@/hooks/useCancerInfo';
import { useFocus } from '@/hooks/useFocus';
import { useAppointments, useJourneyEntries } from '@/hooks/useJourney';
import { snoozeSelfCheck, useSelfChecks } from '@/hooks/useSelfChecks';
import { useNow } from '@/hooks/useNow';
import { formatTime, isSameDay } from '@/lib/dates';
import { usesJourney, wasCaregiver } from '@/lib/focus';
import { firstName, formatTodayDate, greeting } from '@/lib/today';
import { useUser } from '@/stores/authStore';
import { space } from '@/theme/tokens';
import { appointmentWithinDay, upcomingAppointments } from '@/types/appointment';

// The Today tab (redesign Phase 3, appointments from Phase 4): the checks card (design
// refresh Phase 24), a quick mood check-in and what's coming up for Journey users, and
// today's habits. After a Rough or Low mood, a support card comes first.

export default function TodayTab() {
  const user = useUser();
  const now = useNow(60_000);
  const { items, snoozed } = useSelfChecks(now);
  const focus = useFocus();
  const myCancer = useMyCancer();
  const appointments = useAppointments();
  const name = user ? userDisplayName(user) : '';
  const journeyUser = user !== null && usesJourney(focus) && hasCompletedJourneySetup(user);
  const upcoming = journeyUser ? upcomingAppointments(appointments.data ?? [], now) : [];
  const soon = journeyUser ? appointmentWithinDay(upcoming, now) : null;
  const entries = useJourneyEntries();
  const todaysMood = entries.data?.find((entry) => isSameDay(entry.date, now))?.moodLevel;
  // Rough (1) or Low (2): support comes first today.
  const hardDay = journeyUser && todaysMood !== undefined && todaysMood <= 2;

  return (
    <Screen inTabs tab="today">
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="supporting" tone="muted">
            {formatTodayDate(now)}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {greeting(now, user ? firstName(name) : null)}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <IconButton
            icon="search"
            accessibilityLabel="Search OncoSense"
            look="tinted"
            onPress={() => router.push('/search')}
          />
          <ProfileButton />
        </View>
      </View>

      {wasCaregiver(user) ? <CaregiverRetiredCard /> : null}
      {hardDay ? <SupportCard /> : null}

      {journeyUser ? (
        <>
          {soon ? (
            <NextStepPanel
              status={`${isSameDay(soon.startsAt, now) ? 'Today' : 'Tomorrow'} at ${formatTime(soon.startsAt)}`}
              statusIcon="calendar-check"
              title={soon.title}
              body={soon.location ?? 'Bring your questions and any notes for your doctor.'}
              primary={{
                label: 'See details',
                onPress: () =>
                  router.push({ pathname: '/journey/appointment', params: { id: soon.id } }),
              }}
            />
          ) : null}
          {focus === 'finished' ? (
            // After treatment: the next follow-up, a weekly check-in and their checks.
            // Their cancer's guide is in Learn and the doctor summary in Journey.
            <>
              {soon ? null : (
                <ComingUpToday appointments={upcoming.slice(0, 1)} title="Next follow-up" />
              )}
              <MoodCard now={now} weekly />
              {items.length ? (
                <ChecksCard items={items} snoozed={snoozed} onSnooze={snoozeSelfCheck} now={now} />
              ) : null}
            </>
          ) : (
            <>
              <MoodCard now={now} />
              <YourCancerTodayCard cancer={myCancer} />
              <ComingUpToday appointments={upcoming.slice(0, 2)} />
            </>
          )}
        </>
      ) : (
        <>
          {items.length ? (
            <ChecksCard items={items} snoozed={snoozed} onSnooze={snoozeSelfCheck} now={now} />
          ) : (
            // Following nothing yet (or nothing with a check at their age).
            <NextStepPanel
              status="Nothing to check yet"
              statusIcon="circle-check"
              title="Pick cancers to keep an eye on"
              body="Their checks, tests and warning signs will show here when they're due."
              primary={{ label: 'Your cancers', onPress: () => router.push('/checks') }}
            />
          )}
        </>
      )}

      <HabitsRow />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  headerText: { flex: 1, gap: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
});
