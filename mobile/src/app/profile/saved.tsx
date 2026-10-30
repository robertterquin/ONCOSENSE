import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { QuestionRow } from '@/components/community/QuestionRow';
import { ResourceRow } from '@/components/help/ResourceRow';
import {
  GuideRow,
  HabitInfoRow,
  HabitRow,
  PreventionDetailSheet,
} from '@/components/learn/LearnSections';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  Section,
  SegmentedControl,
} from '@/components/ui';
import { useBookmarkedQuestions, useBookmarkedResources } from '@/hooks/useBookmarks';
import { HABITS, type Habit } from '@/constants/habits';
import { useNow } from '@/hooks/useNow';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { useIsSignedIn } from '@/stores/authStore';
import { useHabitsStore } from '@/stores/habitsStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';

// Everything saved, in one place: questions and help contacts from
// the account, self-check guides and prevention habits from this phone.

type Kind = 'questions' | 'guides' | 'habits' | 'contacts';

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

export default function SavedScreen() {
  const params = useLocalSearchParams<{ tab?: Kind; kind?: Kind }>();
  const [selectedKind, setSelectedKind] = useState<Kind | null>(null);

  const routeKind = (params.tab || params.kind) as Kind | undefined;
  const initialKind =
    routeKind && ['questions', 'guides', 'habits', 'contacts'].includes(routeKind)
      ? routeKind
      : 'questions';

  const kind = selectedKind ?? initialKind;

  return (
    <Screen back={{ label: 'Profile', onPress: back }} title="Saved">
      <SegmentedControl<Kind>
        accessibilityLabel="Saved items"
        value={kind}
        onChange={setSelectedKind}
        options={[
          { value: 'questions', label: 'Questions' },
          { value: 'guides', label: 'Guides' },
          { value: 'habits', label: 'Habits' },
          { value: 'contacts', label: 'Contacts' },
        ]}
      />
      {kind === 'questions' ? (
        <SavedQuestions />
      ) : kind === 'guides' ? (
        <SavedGuides />
      ) : kind === 'habits' ? (
        <SavedHabits />
      ) : (
        <SavedContacts />
      )}
    </Screen>
  );
}

function SavedQuestions() {
  const signedIn = useIsSignedIn();
  const questions = useBookmarkedQuestions();
  const now = useNow(60_000);
  if (!signedIn) return <SignInToSave what="questions" />;
  if (questions.isPending) return <LoadingState message="Loading saved questions" />;
  if (questions.isError) {
    return (
      <ErrorState message="Couldn't load saved questions." onRetry={() => questions.refetch()} />
    );
  }
  if (!questions.data.length) {
    return (
      <EmptyState
        icon="bookmark"
        title="No saved questions"
        message="Tap Save on a question in Community to keep it here."
        action={{ label: 'Go to Community', onPress: () => router.navigate('/community') }}
      />
    );
  }
  return (
    <Section>
      {questions.data.map((question) => (
        <QuestionRow key={question.id} question={question} now={now} />
      ))}
    </Section>
  );
}

function SavedGuides() {
  const savedIds = useSelfCheckStore((state) => state.savedGuides);
  const { all, query } = useSelfChecks();
  const saved = all.filter((status) => savedIds.includes(status.guide.id));
  if (query.isPending && savedIds.length) return <LoadingState message="Loading saved guides" />;
  if (!saved.length) {
    return (
      <EmptyState
        icon="bookmark"
        title="No saved guides"
        message="Tap Save on a self-check guide in Learn to keep it here."
        action={{ label: 'Go to Learn', onPress: () => router.navigate('/learn') }}
      />
    );
  }
  return (
    <Section>
      {saved.map((status) => (
        <GuideRow key={status.guide.id} status={status} />
      ))}
    </Section>
  );
}

function SavedHabits() {
  const [selectedTip, setSelectedTip] = useState<Habit | null>(null);
  const bookmarkedIds = useHabitsStore((state) => state.bookmarkedHabits);
  const saved = HABITS.filter((tip) => bookmarkedIds.includes(tip.id));

  if (!saved.length) {
    return (
      <EmptyState
        icon="bookmark"
        title="No saved habits"
        message="Tap Save on an everyday habit in Learn to keep it here."
        action={{
          label: 'Go to Learn',
          onPress: () => router.navigate({ pathname: '/learn', params: { section: 'risk' } }),
        }}
      />
    );
  }

  return (
    <>
      <Section>
        {saved.map((tip) =>
          tip.kind === 'wellbeing' ? (
            <HabitInfoRow key={tip.id} tip={tip} onPress={() => setSelectedTip(tip)} />
          ) : (
            <HabitRow
              key={tip.id}
              tip={tip}
              once={tip.kind === 'once'}
              onPress={() => setSelectedTip(tip)}
            />
          ),
        )}
      </Section>
      <PreventionDetailSheet tip={selectedTip} onClose={() => setSelectedTip(null)} />
    </>
  );
}

function SavedContacts() {
  const signedIn = useIsSignedIn();
  const resources = useBookmarkedResources();
  if (!signedIn) return <SignInToSave what="help contacts" />;
  if (resources.isPending) return <LoadingState message="Loading saved contacts" />;
  if (resources.isError) {
    return (
      <ErrorState message="Couldn't load saved contacts." onRetry={() => resources.refetch()} />
    );
  }
  if (!resources.data.length) {
    return (
      <EmptyState
        icon="bookmark"
        title="No saved help contacts"
        message="Use the More button on a contact in Help to save it here."
        action={{ label: 'Go to Help', onPress: () => router.navigate('/help') }}
      />
    );
  }
  return (
    <Section>
      {resources.data.map((resource) => (
        <ResourceRow key={resource.id} resource={resource} />
      ))}
    </Section>
  );
}

function SignInToSave({ what }: { what: string }) {
  return (
    <EmptyState
      icon="bookmark"
      title={`Sign in to save ${what}`}
      message="Saved questions and contacts are kept in your account. Guides and habits save on this phone."
      action={{ label: 'Sign in', onPress: () => router.push('/login') }}
    />
  );
}
