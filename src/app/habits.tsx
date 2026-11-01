import { router } from 'expo-router';

import { LowerYourRisk } from '@/components/learn/LearnSections';
import { Screen } from '@/components/ui';

// Habit tracking (design refresh Phase 19): the ring, the week and the ticks, opened from
// Today and from Journey. Learn › Habits explains each habit without the ticks.

const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));

export default function HabitsScreen() {
  return (
    <Screen back={{ label: 'Back', onPress: back }} title="Habits">
      <LowerYourRisk />
    </Screen>
  );
}
