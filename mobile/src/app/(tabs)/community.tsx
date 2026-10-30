import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ProfileButton } from '@/components/account/ProfileButton';
import { QuestionRow } from '@/components/community/QuestionRow';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Arrive,
  useArrival,
  Chip,
  IconButton,
  Screen,
  SearchField,
  Section,
  Text,
} from '@/components/ui';
import { useQuestions } from '@/hooks/useCommunity';
import { useNow } from '@/hooks/useNow';
import { confirm } from '@/lib/confirm';
import { useIsSignedIn } from '@/stores/authStore';
import { space } from '@/theme/tokens';
import { FORUM_CATEGORIES } from '@/types/question';

// The Community tab (redesign Phase 5, iOS layout in Phase 15): questions by topic, an
// "Ask a question" button in the title row and the members-not-doctors line under the
// list. Guests can read but are asked to sign in before posting.

/** Opens the composer, or asks a guest to sign in first. */
async function askQuestion(signedIn: boolean) {
  if (signedIn) {
    router.push('/community/ask');
    return;
  }
  const ok = await confirm({
    title: 'Sign in to ask',
    message: 'Questions are posted from your account, so you can follow the answers.',
    confirmText: 'Sign in',
    cancelText: 'Not now',
  });
  if (ok) router.push('/login');
}

export default function CommunityTab() {
  const signedIn = useIsSignedIn();
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  // Keep "2 minutes ago" fresh.
  const now = useNow(10_000);
  const questions = useQuestions({ category, searchQuery, sortBy: 'recent' });

  // Search runs on submit, and clearing the box resets it.
  const onChangeSearch = (text: string) => {
    setSearchText(text);
    if (!text) setSearchQuery(null);
  };

  const arrived = useArrival(questions.isPending);
  return (
    <Screen
      inTabs
      tab="community"
      title="Community"
      titleAside={
        <View style={styles.headerButtons}>
          <IconButton
            icon="plus"
            accessibilityLabel="Ask a question"
            look="tinted"
            onPress={() => askQuestion(signedIn)}
          />
          <ProfileButton />
        </View>
      }
      onRefresh={() => questions.refetch()}
      refreshing={questions.isRefetching}>
      <SearchField
        accessibilityLabel="Search questions"
        placeholder="Search questions"
        value={searchText}
        onChangeText={onChangeSearch}
        onSubmitEditing={() => setSearchQuery(searchText.trim() || null)}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topics}
        accessibilityRole="radiogroup"
        accessibilityLabel="Topic">
        {[null, ...FORUM_CATEGORIES].map((topic) => (
          <Chip
            key={topic ?? 'all'}
            kind="radio"
            label={topic ?? 'All'}
            selected={category === topic}
            onPress={() => setCategory(topic)}
          />
        ))}
      </ScrollView>
      {questions.isPending ? (
        <LoadingState variant="community" message="Loading questions" />
      ) : (
        <Arrive animate={arrived}>
          {questions.isError ? (
            <ErrorState
              message="Couldn't load questions. Check your connection and try again."
              onRetry={() => questions.refetch()}
            />
          ) : questions.data.length === 0 ? (
            <EmptyState
              icon="message"
              title={searchQuery ? `No questions about "${searchQuery}"` : 'No questions yet'}
              message={
                searchQuery ? 'Try other words, or ask it yourself.' : 'Be the first to ask.'
              }
              action={{ label: 'Ask a question', onPress: () => askQuestion(signedIn) }}
            />
          ) : (
            <View style={styles.list}>
              <Section>
                {questions.data.map((question) => (
                  <QuestionRow key={question.id} question={question} now={now} />
                ))}
              </Section>
              <Text variant="caption" tone="muted" style={styles.footer}>
                Answers come from members, not doctors. Share experiences, not diagnoses.
              </Text>
            </View>
          )}
        </Arrive>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topics: { gap: space.sm, paddingRight: space.xl },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
  list: { gap: space.sm },
  footer: { paddingHorizontal: space.xs },
});
