import { router } from 'expo-router';

import { userAge, userGender } from '@/api/auth';
import { ErrorState, ListRow, LoadingState, Screen, Section, Switch, Text } from '@/components/ui';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { iconForCancer } from '@/lib/learn';
import { rescheduleSelfCheckReminder } from '@/lib/notifications/service';
import { useUser } from '@/stores/authStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';

// Your checks (design refresh Phase 22): a switch for each self-check. Starts on the
// defaults for the person's sex and age; turning one on or off makes the list theirs.

const back = () => (router.canGoBack() ? router.back() : router.replace('/learn'));

export default function YourChecksScreen() {
  const { query, all, mine } = useSelfChecks();
  const user = useUser();
  const setChosen = useSelfCheckStore((state) => state.setChosen);
  const chosen = mine.map((status) => status.guide.id);
  const sex = userGender(user);
  const age = userAge(user);

  const toggle = (id: string) => {
    setChosen(chosen.includes(id) ? chosen.filter((item) => item !== id) : [...chosen, id]);
    void rescheduleSelfCheckReminder();
  };

  return (
    <Screen back={{ label: 'Back', onPress: back }} title="Your checks">
      <Text variant="supporting" tone="muted">
        {sex === 'Male' || sex === 'Female'
          ? `Set for ${sex === 'Male' ? 'a man' : 'a woman'}${age ? ` of ${age}` : ''}. Turn on any that apply to you.`
          : 'Turn on the checks that apply to your body.'}
      </Text>
      {query.isPending ? (
        <LoadingState variant="list" message="Loading checks" />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : (
        <Section>
          {all.map(({ guide }) => {
            const on = chosen.includes(guide.id);
            return (
              <ListRow
                key={guide.id}
                icon={iconForCancer(guide.cancerType)}
                title={guide.title}
                subtitle={guide.ageRecommendation ?? guide.frequency}
                accessory={
                  <Switch
                    accessibilityLabel={guide.title}
                    value={on}
                    onValueChange={() => toggle(guide.id)}
                  />
                }
              />
            );
          })}
        </Section>
      )}
      <Text variant="supporting" tone="muted">
        Checks you follow show on Today when they&apos;re due, with a monthly reminder.
      </Text>
    </Screen>
  );
}
