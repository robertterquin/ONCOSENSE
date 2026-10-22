import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { QuestionSort } from '@/api/forum';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { QuestionListCard } from '@/components/forum/ForumParts';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { useQuestions } from '@/hooks/useForum';
import { useNow } from '@/hooks/useNow';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { FORUM_CATEGORIES, forumCategoryIcon } from '@/types/question';

// Port of lib/screens/forum/forum_screen.dart. Flutter's category dropdown and sort
// menu are shown as chips here, which are quicker to tap on a phone.

const SORTS: { value: QuestionSort; label: string; icon: string }[] = [
  { value: 'recent', label: 'Most Recent', icon: 'access_time' },
  { value: 'trending', label: 'Trending', icon: 'trending_up' },
  { value: 'unanswered', label: 'Unanswered', icon: 'help_outline' },
];

export default function ForumTab() {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<QuestionSort>('recent');
  // Refresh relative times ("2 minutes ago") every 10 seconds, like Flutter.
  const now = useNow(10_000);

  const questions = useQuestions({ category, searchQuery, sortBy });

  // Search runs on submit, and clearing the box resets it (same as Flutter).
  const onChangeSearch = (text: string) => {
    setSearchText(text);
    if (!text) setSearchQuery(null);
  };

  return (
    <Screen
      inTabs
      background="surface"
      onRefresh={() => questions.refetch()}
      refreshing={questions.isRefetching}
      header={<AppHeader title="Q&A Forum" subtitle="Ask questions, share experiences" />}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/forum/ask')}
        style={({ pressed }) => [styles.askButton, pressed && styles.pressed]}>
        <MaterialIcon name="add" size={22} color={brand.white} />
        <AppText variant="button" color={brand.white}>
          Ask a Question
        </AppText>
      </Pressable>

      <SearchBar
        value={searchText}
        onChangeText={onChangeSearch}
        onSubmit={() => setSearchQuery(searchText.trim() || null)}
        placeholder="Search discussions..."
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        <Chip
          label="All Categories"
          icon="category"
          selected={!category}
          onPress={() => setCategory(null)}
        />
        {FORUM_CATEGORIES.map((option) => (
          <Chip
            key={option}
            label={`${forumCategoryIcon(option)} ${option}`}
            selected={category === option}
            onPress={() => setCategory(option)}
          />
        ))}
      </ScrollView>

      <View style={styles.sortRow} accessibilityRole="radiogroup" accessibilityLabel="Sort by">
        {SORTS.map((sort) => (
          <Chip
            key={sort.value}
            label={sort.label}
            icon={sort.icon}
            selected={sortBy === sort.value}
            onPress={() => setSortBy(sort.value)}
            radio
          />
        ))}
      </View>

      <AppText variant="titleLarge">Recent Discussions</AppText>

      {questions.isPending ? (
        <LoadingState />
      ) : questions.isError ? (
        <ErrorState
          message={`Error: ${questions.error.message}`}
          onRetry={() => questions.refetch()}
        />
      ) : questions.data.length === 0 ? (
        <EmptyState
          icon="forum"
          title={searchQuery ? 'No questions found' : 'No questions yet'}
          message={searchQuery ? 'Try different search terms' : 'Be the first to ask!'}
        />
      ) : (
        questions.data.map((question) => (
          <QuestionListCard key={question.id} question={question} now={now} />
        ))
      )}
    </Screen>
  );
}

function Chip({
  label,
  icon,
  selected,
  onPress,
  radio = false,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
  radio?: boolean;
}) {
  const { colors } = useTheme();
  const color = selected ? brand.white : colors.text;
  return (
    <Pressable
      accessibilityRole={radio ? 'radio' : 'button'}
      accessibilityState={radio ? { checked: selected } : { selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: brand.headerPink, borderColor: brand.headerPink }
          : { backgroundColor: colors.card, borderColor: colors.divider },
      ]}>
      {icon ? (
        <MaterialIcon name={icon} size={16} color={selected ? brand.white : brand.headerPink} />
      ) : null}
      <AppText variant="bodySmall" color={color} style={styles.chipText}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: radius.medium,
    backgroundColor: brand.headerPink,
  },
  pressed: {
    opacity: 0.85,
  },
  chips: {
    gap: 8,
    paddingRight: 8,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
  },
});
