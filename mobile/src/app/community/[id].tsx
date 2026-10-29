import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReportSheet } from '@/components/community/ReportSheet';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Button,
  Icon,
  IconButton,
  ListRow,
  Screen,
  Section,
  Sheet,
  Switch,
  Text,
  TextField,
} from '@/components/ui';
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
} from '@/hooks/useCommunity';
import { useNow } from '@/hooks/useNow';
import { initials } from '@/lib/community';
import { confirm } from '@/lib/confirm';
import { formatRelativeTime } from '@/lib/dates';
import { useIsSignedIn, useUserId } from '@/stores/authStore';
import { useCommunityStore } from '@/stores/communityStore';
import { showToast } from '@/stores/toastStore';
import { elevation } from '@/theme/elevation';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import { answerDisplayName, type Answer } from '@/types/answer';
import { questionDisplayName, type Question } from '@/types/question';

// A question and its answers (redesign Phase 5). "Helpful" is the existing upvote.

const back = () => (router.canGoBack() ? router.back() : router.replace('/community'));

/** Answers shown before "Show N more answers". */
const FIRST_ANSWERS = 5;

export default function QuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const question = useQuestion(id);
  const answers = useAnswers(id);
  const now = useNow(10_000);
  const signedIn = useIsSignedIn();
  const [showAll, setShowAll] = useState(false);

  if (!question.data) {
    return (
      <Screen back={{ label: 'Community', onPress: back }}>
        {question.isPending ? (
          <LoadingState message="Loading the question" />
        ) : question.isError ? (
          <ErrorState
            message="Couldn't load this question. Check your connection and try again."
            onRetry={() => question.refetch()}
          />
        ) : (
          <EmptyState icon="message" title="This question was removed" />
        )}
      </Screen>
    );
  }

  const list = answers.data ?? [];
  const shown = showAll ? list : list.slice(0, FIRST_ANSWERS);

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        back={{ label: 'Community', onPress: back }}
        actions={<QuestionActions question={question.data} />}
        background="surface"
        bottomBar={signedIn ? <Composer questionId={id} /> : <SignInToAnswer />}>
        <QuestionHeader question={question.data} now={now} />

        <Section
          title={list.length === 1 ? '1 answer' : `${list.length} answers`}
          look="plain"
          divided={false}>
          {answers.isPending ? (
            <LoadingState message="Loading answers" />
          ) : answers.isError ? (
            <ErrorState message="Couldn't load the answers." onRetry={() => answers.refetch()} />
          ) : list.length === 0 ? (
            <Text variant="body" tone="muted">
              No answers yet. If you&apos;ve been through something similar, your experience could
              help.
            </Text>
          ) : (
            <>
              {shown.map((answer) => (
                <AnswerRow key={answer.id} answer={answer} questionId={id} now={now} />
              ))}
              {!showAll && list.length > FIRST_ANSWERS ? (
                <Button
                  title={`Show ${list.length - FIRST_ANSWERS} more answers`}
                  variant="quiet"
                  fullWidth={false}
                  onPress={() => setShowAll(true)}
                />
              ) : null}
            </>
          )}
        </Section>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function QuestionHeader({ question, now }: { question: Question; now: Date }) {
  const upvoted = useHasUpvotedQuestion(question.id).data ?? false;
  const toggle = useToggleQuestionUpvote(question.id);
  const signedIn = useIsSignedIn();
  const by = question.isAnonymous ? 'Shared anonymously' : questionDisplayName(question);
  return (
    <View style={styles.header}>
      <Text variant="caption" tone="action">
        {question.category}
      </Text>
      <Text variant="heading" accessibilityRole="header">
        {question.title}
      </Text>
      <Text variant="reading">{question.content}</Text>
      <Text variant="supporting" tone="muted">
        {by} · {formatRelativeTime(question.createdAt, now)}
      </Text>
      <HelpfulButton
        count={question.upvotes}
        active={upvoted}
        onPress={() =>
          signedIn
            ? toggle.mutate(undefined, { onError: (error) => showToast(error.message, 'error') })
            : showToast('Sign in to mark questions as helpful')
        }
      />
    </View>
  );
}

/** Save, and a More menu with Report (and Delete for your own question). */
function QuestionActions({ question }: { question: Question }) {
  const userId = useUserId();
  const bookmarks = useQuestionBookmarks();
  const remove = useDeleteQuestion();
  const report = useReportContent();
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const saved = bookmarks.isSaved(question);
  const own = userId === question.userId;
  const signedIn = userId !== null;

  const onDelete = async () => {
    setMenu(false);
    const ok = await confirm({
      title: 'Delete your question?',
      message: 'Its answers are deleted too. This can’t be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(question.id, {
      onSuccess: () => {
        showToast('Question deleted');
        back();
      },
      onError: (error) => showToast(error.message, 'error'),
    });
  };

  return (
    <>
      <IconButton
        icon="bookmark"
        look={saved ? 'tinted' : 'plain'}
        accessibilityLabel={saved ? 'Saved. Remove from saved' : 'Save question'}
        onPress={() => bookmarks.toggle(question)}
      />
      <IconButton icon="more" accessibilityLabel="More options" onPress={() => setMenu(true)} />
      <Sheet visible={menu} onClose={() => setMenu(false)} title="Question options">
        <ListRow
          icon="flag"
          title="Report question"
          subtitle="Harmful, misleading or unkind"
          onPress={() => {
            setMenu(false);
            if (!signedIn) {
              showToast('Sign in to report a question');
              return;
            }
            // iOS can't show a second modal while the first is still closing.
            setTimeout(() => setReporting(true), 350);
          }}
        />
        {own ? <ListRow icon="trash" title="Delete my question" onPress={onDelete} /> : null}
      </Sheet>
      <ReportSheet
        visible={reporting}
        what="question"
        onCancel={() => setReporting(false)}
        onSubmit={({ reason, additionalInfo }) => {
          setReporting(false);
          report.mutate(
            { contentType: 'question', contentId: question.id, reason, additionalInfo },
            {
              onSuccess: () =>
                showToast('Report sent. Thank you for keeping Community safe.', 'success'),
              onError: (error) => showToast(error.message, 'error'),
            },
          );
        }}
      />
    </>
  );
}

function AnswerRow({ answer, questionId, now }: { answer: Answer; questionId: string; now: Date }) {
  const { palette, isDark } = useDesign();
  const userId = useUserId();
  const signedIn = useIsSignedIn();
  const upvoted = useHasUpvotedAnswer(answer.id).data ?? false;
  const toggle = useToggleAnswerUpvote(questionId, answer.id);
  const remove = useDeleteAnswer(questionId);
  const name = answerDisplayName(answer);

  const onDelete = async () => {
    const ok = await confirm({
      title: 'Delete your answer?',
      message: 'This can’t be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(answer.id, {
      onSuccess: () => showToast('Answer deleted'),
      onError: (error) => showToast(error.message, 'error'),
    });
  };

  return (
    <View
      style={[
        styles.answer,
        { backgroundColor: palette.surface },
        elevation('resting', palette, isDark),
        answer.isAccepted && { borderWidth: 1.5, borderColor: palette.help },
      ]}>
      <View style={styles.answerTop}>
        <View style={[styles.avatar, { backgroundColor: palette.raised }]}>
          <Text variant="caption" tone="action">
            {answer.isAnonymous ? '?' : initials(name)}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text variant="row">{name}</Text>
          <Text variant="caption" tone="muted">
            {formatRelativeTime(answer.createdAt, now)}
            {answer.isAccepted ? ' · Marked most helpful by the asker' : ''}
          </Text>
        </View>
        {userId === answer.userId ? (
          <IconButton icon="trash" accessibilityLabel="Delete your answer" onPress={onDelete} />
        ) : null}
      </View>
      <Text variant="reading">{answer.content}</Text>
      <HelpfulButton
        count={answer.upvotes}
        active={upvoted}
        onPress={() =>
          signedIn
            ? toggle.mutate(undefined, { onError: (error) => showToast(error.message, 'error') })
            : showToast('Sign in to mark answers as helpful')
        }
      />
    </View>
  );
}

/** "Helpful · 5": a toggle that differs in fill and weight, not only color. */
function HelpfulButton({
  count,
  active,
  onPress,
}: {
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const { palette } = useDesign();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Helpful, ${count} ${count === 1 ? 'person' : 'people'}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.helpful,
        active
          ? { backgroundColor: palette.raised, borderColor: palette.action, borderWidth: 2 }
          : { borderColor: palette.border, borderWidth: 1.5 },
        pressed && styles.pressed,
      ]}>
      <Icon name="thumbs-up" size={18} tone={active ? 'action' : 'muted'} />
      <Text variant={active ? 'strong' : 'row'} tone={active ? 'action' : 'ink'}>
        Helpful{count ? ` · ${count}` : ''}
      </Text>
    </Pressable>
  );
}

/** The answer box pinned at the bottom. */
function Composer({ questionId }: { questionId: string }) {
  const { palette } = useDesign();
  const insets = useSafeAreaInsets();
  const anonymousByDefault = useCommunityStore((state) => state.anonymousByDefault);
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(anonymousByDefault);
  const post = usePostAnswer(questionId);

  const submit = () => {
    const text = content.trim();
    if (!text) return;
    post.mutate(
      { content: text, isAnonymous: anonymous },
      {
        onSuccess: () => {
          setContent('');
          showToast('Answer posted', 'success');
        },
        onError: (error) => showToast(`Couldn't post: ${error.message}`, 'error'),
      },
    );
  };

  return (
    <View
      style={[
        styles.composer,
        {
          backgroundColor: palette.surface,
          borderTopColor: palette.line,
          paddingBottom: Math.max(insets.bottom, space.md),
        },
      ]}>
      <TextField
        label="Your answer"
        placeholder="Share what helped you, or what you went through"
        multiline
        value={content}
        onChangeText={setContent}
      />
      <View style={styles.composerRow}>
        <Switch
          accessibilityLabel="Post anonymously"
          value={anonymous}
          onValueChange={setAnonymous}
        />
        <Text variant="supporting" style={styles.flex}>
          Post anonymously
        </Text>
        <Button
          title="Post"
          small
          disabled={!content.trim()}
          loading={post.isPending}
          onPress={submit}
        />
      </View>
    </View>
  );
}

function SignInToAnswer() {
  const { palette } = useDesign();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.composer,
        {
          backgroundColor: palette.surface,
          borderTopColor: palette.line,
          paddingBottom: Math.max(insets.bottom, space.md),
        },
      ]}>
      <Text variant="supporting" tone="muted">
        Sign in to answer, mark answers helpful or save questions.
      </Text>
      <Button title="Sign in" variant="secondary" onPress={() => router.push('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  pressed: { opacity: 0.6 },
  header: { gap: space.sm },
  answer: { gap: space.sm, padding: space.lg, borderRadius: radii.control },
  answerTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpful: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xs,
    minHeight: sizes.touch,
    paddingHorizontal: space.lg,
    borderRadius: radii.round,
  },
  composer: {
    gap: space.sm,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
  },
  composerRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
