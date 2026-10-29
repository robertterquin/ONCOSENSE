import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { QuestionRow } from '@/components/community/QuestionRow';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Banner,
  Chip,
  Icon,
  Screen,
  SearchField,
  Section,
  Text,
} from '@/components/ui';
import { useQuestions } from '@/hooks/useCommunity';
import { useNow } from '@/hooks/useNow';
import { confirm } from '@/lib/confirm';
import { useIsSignedIn } from '@/stores/authStore';
import { elevation } from '@/theme/elevation';
import { radii, space } from '@/theme/tokens';
import { fontFamily } from '@/theme/type';
import { useDesign } from '@/theme/useTheme';
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
  const { palette, isDark } = useDesign();
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

      <View
        style={[
          styles.promptCard,
          { backgroundColor: palette.surface },
          elevation('resting', isDark),
        ]}>
        <View style={[styles.promptIconTile, { backgroundColor: palette.raised }]}>
          <Icon name="message" size={20} tone="action" />
        </View>
        <View style={styles.promptContent}>
          <Text variant="strong">Have a question or story?</Text>
          <Text variant="caption" tone="muted">
            Ask the community for support & tips
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ask a question"
          accessibilityHint="Opens the composer to ask a question in the community"
          hitSlop={8}
          onPress={() => askQuestion(signedIn)}
          style={({ pressed }) => [
            styles.promptPill,
            { backgroundColor: palette.action },
            pressed && styles.promptPillPressed,
          ]}>
          <Icon name="plus" size={16} color={palette.onAction} bold />
          <Text variant="caption" color={palette.onAction} style={styles.promptPillText}>
            Ask
          </Text>
        </Pressable>
      </View>

      {questions.isPending ? (
        <LoadingState variant="community" message="Loading questions" />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  topics: { gap: space.sm, paddingRight: space.xl },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radii.section,
  },
  promptIconTile: {
    width: 44,
    height: 44,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptContent: {
    flex: 1,
    gap: 2,
  },
  promptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radii.round,
  },
  promptPillPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  promptPillText: {
    fontFamily: fontFamily.extraBold,
  },
});
