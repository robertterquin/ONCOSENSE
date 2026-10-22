import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Checkbox } from '@/components/Checkbox';
import { CategoryPill, UpvoteButton, UserAvatar } from '@/components/forum/ForumParts';
import { ReportDialog } from '@/components/forum/ReportDialog';
import { MaterialIcon } from '@/components/MaterialIcon';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { useQuestionBookmarks } from '@/hooks/useBookmarkToggle';
import {
  useAnswers,
  useDeleteAnswer,
  useDeleteQuestion,
  useHasUpvotedAnswer,
  useHasUpvotedQuestion,
  usePostAnswer,
  useQuestion,
  useReportContent,
  useToggleAnswerUpvote,
  useToggleQuestionUpvote,
} from '@/hooks/useForum';
import { useNow } from '@/hooks/useNow';
import { confirm } from '@/lib/confirm';
import { useUserId } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';
import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { answerDisplayName, answerRelativeTime, type Answer } from '@/types/answer';
import { questionDisplayName, questionRelativeTime, type Question } from '@/types/question';

// Port of lib/screens/forum/question_detail_screen.dart

const showError = (error: Error) => showToast(`Error: ${error.message}`, 'error');

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const question = useQuestion(id);
  const answers = useAnswers(id);
  const now = useNow(10_000);

  const header = <AppHeader title="Question Details" subtitle="Discussion thread" showBackButton />;

  if (!question.data) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.surface }]}>
        {header}
        {question.isPending ? (
          <LoadingState />
        ) : question.isError ? (
          <ErrorState
            message={`Error loading question: ${question.error.message}`}
            onRetry={() => question.refetch()}
          />
        ) : (
          <EmptyState icon="help_outline" title="Question not found" />
        )}
      </View>
    );
  }

  const answerList = answers.data ?? [];
  return (
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {header}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <QuestionCard question={question.data} now={now} />
        <AppText variant="titleMedium" style={styles.answersTitle}>
          {answerList.length} {answerList.length === 1 ? 'Answer' : 'Answers'}
        </AppText>
        {answers.isPending ? (
          <LoadingState />
        ) : answers.isError ? (
          <ErrorState
            message={`Error loading answers: ${answers.error.message}`}
            onRetry={() => answers.refetch()}
          />
        ) : answerList.length === 0 ? (
          <EmptyState
            icon="question_answer"
            title="No answers yet"
            message="Be the first to answer!"
          />
        ) : (
          answerList.map((answer) => (
            <AnswerCard key={answer.id} answer={answer} questionId={id} now={now} />
          ))
        )}
      </ScrollView>
      <AnswerInput questionId={id} />
    </KeyboardAvoidingView>
  );
}

function QuestionCard({ question, now }: { question: Question; now: Date }) {
  const { colors, isDark } = useTheme();
  const userId = useUserId();
  const bookmarks = useQuestionBookmarks();
  const upvoted = useHasUpvotedQuestion(question.id).data ?? false;
  const toggleUpvote = useToggleQuestionUpvote(question.id);
  const deleteQuestion = useDeleteQuestion();
  const report = useReportContent();
  const [reporting, setReporting] = useState(false);

  const onDelete = async () => {
    const ok = await confirm({
      title: 'Delete Question',
      message:
        'Are you sure you want to delete this question? This action cannot be undone and will also delete all answers.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    deleteQuestion.mutate(question.id, {
      onSuccess: () => {
        showToast('Question deleted successfully');
        router.back();
      },
      onError: (error) => showToast(`Error deleting question: ${error.message}`, 'error'),
    });
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.divider },
        !isDark && styles.shadow,
      ]}>
      <View style={styles.row}>
        <CategoryPill category={question.category} />
        <View style={styles.flex} />
        <BookmarkButton
          saved={bookmarks.isSaved(question)}
          onPress={() => bookmarks.toggle(question)}
          itemLabel="question"
          size={20}
        />
        {userId === question.userId ? (
          <IconAction icon="delete_outline" label="Delete question" onPress={onDelete} />
        ) : null}
        <IconAction icon="flag" label="Report question" onPress={() => setReporting(true)} />
      </View>
      <AppText variant="titleMedium" style={styles.questionTitle}>
        {question.title}
      </AppText>
      <AppText style={styles.questionBody}>{question.content}</AppText>
      <View style={styles.row}>
        <UserAvatar
          name={question.userName}
          pictureUrl={question.profilePictureUrl}
          isAnonymous={question.isAnonymous}
          size={24}
        />
        <View style={styles.flex}>
          <AppText variant="label" numberOfLines={1}>
            {questionDisplayName(question)}
          </AppText>
          <AppText variant="bodySmall" secondary>
            {questionRelativeTime(question, now)}
          </AppText>
        </View>
        <UpvoteButton
          count={question.upvotes}
          upvoted={upvoted}
          onPress={() => toggleUpvote.mutate(undefined, { onError: showError })}
        />
      </View>

      <ReportDialog
        visible={reporting}
        onCancel={() => setReporting(false)}
        onSubmit={({ reason, additionalInfo }) => {
          setReporting(false);
          report.mutate(
            { contentType: 'question', contentId: question.id, reason, additionalInfo },
            {
              onSuccess: () =>
                showToast(
                  'Report submitted. Thank you for helping keep our community safe.',
                  'success',
                ),
              onError: (error) => showToast(`Error submitting report: ${error.message}`, 'error'),
            },
          );
        }}
      />
    </View>
  );
}

function AnswerCard({
  answer,
  questionId,
  now,
}: {
  answer: Answer;
  questionId: string;
  now: Date;
}) {
  const { colors, isDark } = useTheme();
  const userId = useUserId();
  const upvoted = useHasUpvotedAnswer(answer.id).data ?? false;
  const toggleUpvote = useToggleAnswerUpvote(questionId, answer.id);
  const deleteAnswer = useDeleteAnswer(questionId);

  const onDelete = async () => {
    const ok = await confirm({
      title: 'Delete Answer',
      message: 'Are you sure you want to delete this answer? This action cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    deleteAnswer.mutate(answer.id, {
      onSuccess: () => showToast('Answer deleted successfully'),
      onError: (error) => showToast(`Error deleting answer: ${error.message}`, 'error'),
    });
  };

  return (
    <View
      style={[
        styles.card,
        answer.isAccepted
          ? { backgroundColor: isDark ? '#1B3D2E' : '#F1F8F4', borderColor: '#4CAF50' }
          : { backgroundColor: colors.card, borderColor: colors.divider },
      ]}>
      {answer.isAccepted ? (
        <View style={styles.bestAnswer}>
          <MaterialIcon name="check_circle" size={14} color={brand.white} />
          <AppText style={styles.bestAnswerText}>Best Answer</AppText>
        </View>
      ) : null}
      <AppText style={styles.answerBody}>{answer.content}</AppText>
      <View style={styles.row}>
        <View style={styles.flex}>
          <AppText variant="label" numberOfLines={1} style={styles.answerName}>
            {answerDisplayName(answer)}
          </AppText>
          <AppText variant="bodySmall" secondary>
            {answerRelativeTime(answer, now)}
          </AppText>
        </View>
        {userId === answer.userId ? (
          <IconAction icon="delete_outline" label="Delete answer" onPress={onDelete} size={18} />
        ) : null}
        <UpvoteButton
          count={answer.upvotes}
          upvoted={upvoted}
          onPress={() => toggleUpvote.mutate(undefined, { onError: showError })}
        />
      </View>
    </View>
  );
}

function AnswerInput({ questionId }: { questionId: string }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const post = usePostAnswer(questionId);

  const submit = () => {
    const text = content.trim();
    if (!text) {
      showToast('Please enter an answer', 'error');
      return;
    }
    post.mutate(
      { content: text, isAnonymous: anonymous },
      {
        onSuccess: () => {
          setContent('');
          setAnonymous(false);
          showToast('✅ Answer posted successfully!', 'success');
        },
        onError: (error) => showToast(`❌ Error posting answer: ${error.message}`, 'error'),
      },
    );
  };

  return (
    <View
      style={[
        styles.inputBar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          paddingBottom: spacing.small + insets.bottom,
        },
        !isDark && styles.inputShadow,
      ]}>
      <Checkbox checked={anonymous} onChange={setAnonymous} label="Post anonymously" />
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel="Write your answer"
          placeholder="Write your answer..."
          placeholderTextColor={colors.inputPlaceholder}
          value={content}
          onChangeText={setContent}
          multiline
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.divider, backgroundColor: colors.card },
          ]}
        />
        {post.isPending ? (
          <ActivityIndicator color={brand.headerPink} style={styles.send} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Post answer"
            onPress={submit}
            hitSlop={6}
            style={styles.send}>
            <MaterialIcon name="send" size={28} color={brand.headerPink} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function IconAction({
  icon,
  label,
  onPress,
  size = 20,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={styles.iconAction}>
      <MaterialIcon name={icon} size={size} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.medium,
    gap: 12,
    paddingBottom: spacing.large,
  },
  card: {
    padding: 16,
    borderRadius: radius.medium,
    borderWidth: 1,
    gap: 12,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  questionBody: {
    lineHeight: 22,
  },
  answersTitle: {
    marginTop: 8,
  },
  answerBody: {
    lineHeight: 21,
  },
  answerName: {
    fontSize: 13,
  },
  bestAnswer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  bestAnswerText: {
    fontSize: 11,
    color: brand.white,
    fontFamily: 'Poppins_600SemiBold',
  },
  iconAction: {
    padding: 4,
  },
  inputBar: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.small,
    gap: 8,
  },
  inputShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  send: {
    paddingBottom: 8,
  },
});
