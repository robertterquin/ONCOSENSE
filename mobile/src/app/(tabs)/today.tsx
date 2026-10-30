import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { hasCompletedJourneySetup, userDisplayName } from '@/api/auth';
import { ProfileButton } from '@/components/account/ProfileButton';
import { ChecksCard } from '@/components/today/ChecksCard';
import {
  AwarenessRow,
  ComingUpToday,
  HelpRow,
  MoodCard,
  TipCard,
} from '@/components/today/TodayParts';
import { IconButton, NextStepPanel, Screen, Text } from '@/components/ui';
import { useFocus } from '@/hooks/useFocus';
import { useDailyHealthTip } from '@/hooks/useHome';
import { useAppointments } from '@/hooks/useJourney';
import { snoozeSelfCheck, useSelfChecks } from '@/hooks/useSelfChecks';
import { useNow } from '@/hooks/useNow';
import { formatTime, isSameDay } from '@/lib/dates';
import { usesJourney } from '@/lib/focus';
import { firstName, formatTodayDate, greeting } from '@/lib/today';
import { useUser } from '@/stores/authStore';
import { space } from '@/theme/tokens';
import { appointmentWithinDay, upcomingAppointments } from '@/types/appointment';

// The Today tab (redesign Phase 3, appointments from Phase 4): the self-checks card (or
// an appointment within a day when no check is waiting), a quick
// mood check-in and what's coming up for Journey users, the tip of the day, the
// awareness month and a pointer to Help.

export default function TodayTab() {
  const user = useUser();
  const now = useNow(60_000);
  const tip = useDailyHealthTip();
  const { mine, nextStep, snoozed } = useSelfChecks(now);
  const focus = useFocus();
  const appointments = useAppointments();
  const name = user ? userDisplayName(user) : '';
  const journeyUser = user !== null && usesJourney(focus) && hasCompletedJourneySetup(user);
  const upcoming = journeyUser ? upcomingAppointments(appointments.data ?? [], now) : [];
  const soon = journeyUser ? appointmentWithinDay(upcoming, now) : null;

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

      {nextStep.kind === 'self-check' ? (
        <ChecksCard checks={mine} snoozed={snoozed} onSnooze={snoozeSelfCheck} now={now} />
      ) : soon ? (
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
      ) : mine.length ? (
        <ChecksCard checks={mine} snoozed={snoozed} onSnooze={snoozeSelfCheck} now={now} />
      ) : (
        <NextStepPanel
          status={snoozed ? "We'll remind you tomorrow" : "You're up to date"}
          statusIcon={snoozed ? 'bell' : 'circle-check'}
          title="Learn the early signs"
          body="Knowing what's normal for you makes changes easier to spot."
          primary={{
            label: 'Explore Learn',
            onPress: () => router.navigate({ pathname: '/learn', params: { section: 'cancers' } }),
          }}
        />
      )}

      {journeyUser ? <MoodCard now={now} /> : null}
      {journeyUser ? <ComingUpToday appointments={upcoming.slice(0, 2)} /> : null}
      <TipCard tip={tip} />
      <AwarenessRow now={now} />
      <HelpRow />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  headerText: { flex: 1, gap: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
});
