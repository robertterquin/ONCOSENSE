import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { hasCompletedJourneySetup, userDisplayName, userProfilePictureUrl } from '@/api/auth';
import {
  AwarenessRow,
  HelpRow,
  MoodCard,
  ProfileButton,
  TipCard,
} from '@/components/today/TodayParts';
import { NextStepPanel, Screen, Text } from '@/components/ui';
import { useDailyHealthTip } from '@/hooks/useHome';
import { snoozeSelfCheck, useSelfChecks } from '@/hooks/useSelfChecks';
import { useNow } from '@/hooks/useNow';
import { firstName, formatTodayDate, greeting } from '@/lib/today';
import { useUser } from '@/stores/authStore';
import { space } from '@/theme/tokens';

// The Today tab (redesign Phase 3): one next step, a quick mood check-in for Journey
// users, the tip of the day, the awareness month and a pointer to Help. "Coming up"
// (appointments and treatment sessions) arrives with Journey in Phase 4.

export default function TodayTab() {
  const user = useUser();
  const now = useNow(60_000);
  const tip = useDailyHealthTip();
  const { nextStep, snoozed } = useSelfChecks(now);
  const name = user ? userDisplayName(user) : '';

  return (
    <Screen inTabs>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="supporting" tone="muted">
            {formatTodayDate(now)}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {greeting(now, user ? firstName(name) : null)}
          </Text>
        </View>
        <ProfileButton pictureUrl={userProfilePictureUrl(user)} name={name} />
      </View>

      {nextStep.kind === 'self-check' ? (
        <NextStepPanel
          status="Due today"
          title={nextStep.guide.title}
          body={`Your ${nextStep.guide.frequency.toLowerCase()} check. About 10 minutes, one step at a time.`}
          primary={{
            label: 'Start self-check',
            onPress: () =>
              router.push({ pathname: '/learn/check/[id]', params: { id: nextStep.guide.id } }),
          }}
          secondary={{ label: 'Remind me tomorrow', onPress: snoozeSelfCheck }}
        />
      ) : (
        <NextStepPanel
          status={snoozed ? "We'll remind you tomorrow" : "You're up to date"}
          statusIcon={snoozed ? 'bell' : 'circle-check'}
          title="Learn the early signs"
          body="Knowing what's normal for you makes changes easier to spot."
          primary={{ label: 'Explore Learn', onPress: () => router.navigate('/learn') }}
        />
      )}

      {user && hasCompletedJourneySetup(user) ? <MoodCard now={now} /> : null}
      <TipCard tip={tip} />
      <AwarenessRow now={now} />
      <HelpRow />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  headerText: { flex: 1, gap: 2 },
});
