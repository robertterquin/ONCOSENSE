import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { QuestionRow } from '@/components/forum/QuestionRow';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { Banner, Button, Chip, Screen, SearchField, Section } from '@/components/ui';
import { useQuestions } from '@/hooks/useForum';
import { useNow } from '@/hooks/useNow';
import { confirm } from '@/lib/confirm';
import { useIsSignedIn } from '@/stores/authStore';
import { space } from '@/theme/tokens';
import { FORUM_CATEGORIES } from '@/types/question';

// The Community tab (redesign Phase 5): questions by topic, with the guard banner and
// an "Ask a question" button above the tab bar. Guests can read but are asked to sign
// in before posting.

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

  return (
    <View style={styles.fill}>
      <Screen
        inTabs
        title="Community"
        subtitle="Questions and experiences from people who've been there"
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
        <Banner tone="guard">
          Share experiences, not diagnoses. Answers here are from members, not doctors.
        </Banner>

        {questions.isPending ? (
          <LoadingState message="Loading questions" />
        ) : questions.isError ? (
          <ErrorState
            message="Couldn't load questions. Check your connection and try again."
            onRetry={() => questions.refetch()}
          />
        ) : questions.data.length === 0 ? (
          <EmptyState
            icon="message"
            title={searchQuery ? `No questions about "${searchQuery}"` : 'No questions yet'}
            message={searchQuery ? 'Try other words, or ask it yourself.' : 'Be the first to ask.'}
          />
        ) : (
          <Section>
            {questions.data.map((question) => (
              <QuestionRow key={question.id} question={question} now={now} />
            ))}
          </Section>
        )}
        {/* Room for the floating button over the last question. */}
        <View style={styles.fabSpace} />
      </Screen>
      <View style={styles.fab} pointerEvents="box-none">
        <Button
          title="Ask a question"
          icon="plus"
          fullWidth={false}
          onPress={() => askQuestion(signedIn)}
          style={styles.fabButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topics: { gap: space.sm, paddingRight: space.xl },
  fabSpace: { height: 56 },
  fab: { position: 'absolute', right: space.xl, bottom: space.lg },
  fabButton: {
    shadowColor: '#2E1F66',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
