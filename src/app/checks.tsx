import { router } from 'expo-router';
import { useState } from 'react';

import { userAge, userGender } from '@/api/auth';
import {
  ErrorState,
  Icon,
  ListRow,
  LoadingState,
  Screen,
  Section,
  Sheet,
  Switch,
  Text,
} from '@/components/ui';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { cancerKeyword } from '@/lib/help';
import { iconForCancer } from '@/lib/learn';
import { rescheduleSelfCheckReminder } from '@/lib/notifications/service';
import {
  actionsFor,
  cancerAppliesToSex,
  QUESTION_FOR,
  type CancerKey,
  type ScreeningAnswers,
} from '@/lib/screening';
import { useUser } from '@/stores/authStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import type { CancerType } from '@/types/cancerType';

// Your cancers (design refresh Phase 23): a switch for each cancer in Learn. Following one
// adds what's recognised for it: a self-check, a screening test, a talk with a doctor, or
// its warning signs. Lung and liver ask one question first. Starts on the defaults for
// the person's sex and age.

const back = () => (router.canGoBack() ? router.back() : router.replace('/learn'));

const QUESTIONS: Record<keyof ScreeningAnswers, { text: string; note: string }> = {
  heavySmoker: {
    text: 'Have you smoked about a pack a day for 20 years or more?',
    note: 'Including if you stopped in the last 15 years. Screening is for people at high risk.',
  },
  hepatitis: {
    text: 'Do you have hepatitis B or C, or cirrhosis?',
    note: 'People with these have regular liver checks; everyone else follows the warning signs.',
  },
};

const ANSWERS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsaid', label: "I'd rather not say" },
] as const;

export default function YourCancersScreen() {
  const cancers = useCancerTypes();
  const { followed, careTeamCancer } = useSelfChecks();
  const user = useUser();
  const sex = userGender(user);
  const age = userAge(user);
  const answers = useSelfCheckStore((state) => state.answers);
  const setFollowed = useSelfCheckStore((state) => state.setFollowed);
  const setAnswer = useSelfCheckStore((state) => state.setAnswer);
  const [asking, setAsking] = useState<CancerType | null>(null);

  const follow = (key: CancerKey, on: boolean) => {
    setFollowed(on ? [...followed, key] : followed.filter((item) => item !== key));
    void rescheduleSelfCheckReminder();
  };
  const toggle = (cancer: CancerType) => {
    const key = cancerKeyword(cancer.name);
    const question = QUESTION_FOR[key];
    if (!followed.includes(key) && question && !answers[question]) setAsking(cancer);
    else follow(key, !followed.includes(key));
  };

  const list = (cancers.data ?? [])
    .filter((cancer) => cancerAppliesToSex(cancerKeyword(cancer.name), sex))
    .sort((a, b) => {
      const rank = (cancer: CancerType) => {
        const index = followed.indexOf(cancerKeyword(cancer.name));
        return index === -1 ? Infinity : index;
      };
      return rank(a) - rank(b) || a.name.localeCompare(b.name);
    });
  const question = asking ? QUESTION_FOR[cancerKeyword(asking.name)] : undefined;

  return (
    <Screen back={{ label: 'Back', onPress: back }} title="Your cancers">
      <Text variant="supporting" tone="muted">
        {sex === 'Male' || sex === 'Female'
          ? `Set for ${sex === 'Male' ? 'a man' : 'a woman'}${age ? ` of ${age}` : ''}. Follow any that matter to you.`
          : 'Follow the cancers that apply to you or run in your family.'}
      </Text>
      {cancers.isPending ? (
        <LoadingState variant="list" message="Loading cancers" />
      ) : cancers.isError ? (
        <ErrorState message={cancers.error.message} onRetry={() => cancers.refetch()} />
      ) : (
        <Section>
          {list.map((cancer) => {
            const key = cancerKeyword(cancer.name);
            const on = followed.includes(key);
            if (key === careTeamCancer) {
              return (
                <ListRow
                  key={cancer.id}
                  icon={iconForCancer(cancer.name)}
                  title={cancer.name}
                  subtitle="Your care team sets your follow-up"
                />
              );
            }
            return (
              <ListRow
                key={cancer.id}
                icon={iconForCancer(cancer.name)}
                title={cancer.name}
                subtitle={whatYouGet(key, age, answers)}
                accessory={
                  <Switch
                    accessibilityLabel={`Follow ${cancer.name.toLowerCase()}`}
                    value={on}
                    onValueChange={() => toggle(cancer)}
                  />
                }
              />
            );
          })}
        </Section>
      )}
      <Text variant="supporting" tone="muted">
        Self-checks and tests show on Today when they&apos;re due. For cancers with no check or
        test, you&apos;ll be asked about their warning signs every 3 months.
      </Text>

      <Sheet visible={asking !== null} onClose={() => setAsking(null)} title={asking?.name ?? ''}>
        {question ? (
          <>
            <Text variant="section">{QUESTIONS[question].text}</Text>
            <Text variant="supporting" tone="muted">
              {QUESTIONS[question].note}
            </Text>
            <Section>
              {ANSWERS.map((answer) => (
                <ListRow
                  key={answer.value}
                  title={answer.label}
                  accessory={
                    answers[question] === answer.value ? (
                      <Icon name="check" size={22} tone="action" bold />
                    ) : (
                      <></>
                    )
                  }
                  onPress={() => {
                    setAnswer(question, answer.value);
                    if (asking) follow(cancerKeyword(asking.name), true);
                    setAsking(null);
                  }}
                />
              ))}
            </Section>
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

/** "Self-check monthly, mammogram every year", "HPV test every 5 years", "Warning signs every 3 months". */
function whatYouGet(key: CancerKey, age: number | null, answers: ScreeningAnswers): string {
  const parts = actionsFor(key, age, answers).map((action) =>
    action.kind === 'self-check'
      ? 'Self-check monthly'
      : action.kind === 'screening'
        ? action.test.months(age) === null
          ? action.test.title
          : `${action.test.title} ${lowerFirst(action.test.howOften(age))}`
        : 'Warning signs every 3 months',
  );
  const text = parts.map((part, index) => (index ? lowerFirst(part) : part)).join(', ');
  const question = QUESTION_FOR[key];
  return question && !answers[question] ? `${text} (a test if you're at high risk)` : text;
}

/** "Every year" → "every year", but "HPV test" stays as it is. */
const lowerFirst = (text: string) =>
  /^[A-Z][A-Z]/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);
