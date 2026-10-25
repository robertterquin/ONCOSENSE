import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { QuestionRow } from '@/components/community/QuestionRow';
import { ResourceRow } from '@/components/help/ResourceRow';
import { GuideRow } from '@/components/learn/LearnSections';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Button,
  Screen,
  Section,
  SegmentedControl,
} from '@/components/ui';
import { useBookmarkedQuestions, useBookmarkedResources } from '@/hooks/useBookmarks';
import { useNow } from '@/hooks/useNow';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { useIsSignedIn } from '@/stores/authStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { space } from '@/theme/tokens';

// Everything saved, in one place (redesign Phase 5): questions and help contacts from
// the account, self-check guides from this phone.

type Kind = 'questions' | 'guides' | 'contacts';

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

export default function SavedScreen() {
  const [kind, setKind] = useState<Kind>('questions');
  return (
    <Screen back={{ label: 'Profile', onPress: back }} title="Saved">
      <SegmentedControl<Kind>
        accessibilityLabel="Saved items"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'questions', label: 'Questions' },
          { value: 'guides', label: 'Guides' },
          { value: 'contacts', label: 'Help contacts' },
        ]}
      />
      {kind === 'questions' ? (
        <SavedQuestions />
      ) : kind === 'guides' ? (
        <SavedGuides />
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
      <Empty
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
      <Empty
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
      <Empty
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
    <Empty
      title={`Sign in to save ${what}`}
      message="Saved questions and contacts are kept in your account. Guides save on this phone."
      action={{ label: 'Sign in', onPress: () => router.push('/login') }}
    />
  );
}

function Empty({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.empty}>
      <EmptyState icon="bookmark" title={title} message={message} />
      <Button title={action.label} variant="secondary" fullWidth={false} onPress={action.onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: space.md },
});
