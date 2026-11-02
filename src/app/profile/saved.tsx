import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { QuestionRow } from '@/components/community/QuestionRow';
import { ResourceRow } from '@/components/help/ResourceRow';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  Section,
  SegmentedControl,
} from '@/components/ui';
import { useBookmarkedQuestions, useBookmarkedResources } from '@/hooks/useBookmarks';
import { useNow } from '@/hooks/useNow';
import { useIsSignedIn } from '@/stores/authStore';

// Everything saved, in one place: questions and help contacts, kept in the account.
// (Saved guides and habits went in design refresh Phase 27: guides come through the
// checks, and picked habits are the ones that matter.)

type Kind = 'questions' | 'contacts';

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

export default function SavedScreen() {
  const params = useLocalSearchParams<{ tab?: Kind; kind?: Kind }>();
  const [selectedKind, setSelectedKind] = useState<Kind | null>(null);

  const routeKind = (params.tab || params.kind) as Kind | undefined;
  const initialKind =
    routeKind && ['questions', 'contacts'].includes(routeKind) ? routeKind : 'questions';

  const kind = selectedKind ?? initialKind;

  return (
    <Screen back={{ label: 'Profile', onPress: back }} title="Saved">
      <SegmentedControl<Kind>
        accessibilityLabel="Saved items"
        value={kind}
        onChange={setSelectedKind}
        options={[
          { value: 'questions', label: 'Questions' },
          { value: 'contacts', label: 'Help contacts' },
        ]}
      />
      {kind === 'questions' ? <SavedQuestions /> : <SavedContacts />}
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
      message="Saved questions and help contacts are kept in your account."
      action={{ label: 'Sign in', onPress: () => router.push('/login') }}
    />
  );
}
