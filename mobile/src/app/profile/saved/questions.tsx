import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { CategoryPill } from '@/components/forum/ForumParts';
import { MaterialIcon } from '@/components/MaterialIcon';
import { RemoveBookmarkButton, SavedCard, SavedList } from '@/components/profile/SavedList';
import { useBookmarkedQuestions, useToggleQuestionBookmark } from '@/hooks/useBookmarks';
import { formatShortDate } from '@/lib/dates';
import { showToast } from '@/stores/toastStore';
import { useTheme } from '@/theme/useTheme';
import { questionDisplayName, type Question } from '@/types/question';

// Port of lib/screens/profile/saved_questions_screen.dart

export default function SavedQuestionsScreen() {
  const query = useBookmarkedQuestions();
  const { toggle } = useToggleQuestionBookmark();

  return (
    <SavedList<Question>
      title="Saved Questions"
      subtitle="Your bookmarked forum discussions"
      query={query}
      errorPrefix="Error loading saved questions"
      empty={{
        icon: 'bookmark_border',
        title: 'No Saved Questions',
        message: 'Questions you bookmark will appear here for easy access later.',
        action: 'Browse Q&A Forum',
        href: '/forum',
      }}
      renderItem={(question) => (
        <QuestionItem
          key={question.id}
          question={question}
          onRemove={() => {
            toggle(question);
            showToast('Question removed from bookmarks');
          }}
        />
      )}
    />
  );
}

function QuestionItem({ question, onRemove }: { question: Question; onRemove: () => void }) {
  const { colors } = useTheme();
  return (
    <SavedCard>
      <View style={styles.row}>
        <CategoryPill category={question.category} />
        {question.isResolved ? (
          <View style={styles.resolved}>
            <MaterialIcon name="check_circle" size={12} color="#4CAF50" />
            <AppText style={styles.resolvedText}>Resolved</AppText>
          </View>
        ) : null}
        <View style={styles.flex} />
        <RemoveBookmarkButton onPress={onRemove} />
      </View>
      {/* The remove button sits outside this tappable area (no nested buttons on web). */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={question.title}
        onPress={() => router.push({ pathname: '/forum/[id]', params: { id: question.id } })}
        style={styles.body}>
        <AppText variant="titleMedium">{question.title}</AppText>
        <AppText variant="bodySmall" secondary numberOfLines={2}>
          {question.content}
        </AppText>
        <View style={styles.meta}>
          <MaterialIcon name="person_outline" size={14} color={colors.textSecondary} />
          <AppText secondary style={styles.metaText} numberOfLines={1}>
            {questionDisplayName(question)}
          </AppText>
          <MaterialIcon name="arrow_upward" size={14} color={colors.textSecondary} />
          <AppText secondary style={styles.metaText}>
            {question.upvotes}
          </AppText>
          <MaterialIcon name="chat_bubble_outline" size={14} color={colors.textSecondary} />
          <AppText secondary style={styles.metaText}>
            {question.answerCount}
          </AppText>
          <View style={styles.flex} />
          <AppText secondary style={styles.metaText}>
            {formatShortDate(question.createdAt)}
          </AppText>
        </View>
      </Pressable>
    </SavedCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resolved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  resolvedText: { fontSize: 11, color: '#4CAF50', fontFamily: 'Poppins_600SemiBold' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, marginRight: 8 },
});
