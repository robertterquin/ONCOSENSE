import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
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
  PressableScale,
  Screen,
  Section,
  Sheet,
  Tag,
  Text,
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
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import { answerDisplayName, type Answer } from '@/types/answer';
import { questionDisplayName, type Question } from '@/types/question';

// A question and its answers (redesign Phase 5, iOS grouped layout after Phase 17): the
// question in a card with its author and a quiet actions row, answers together in one
// card, and a one-line answer bar like Messages. "Helpful" is the existing upvote.

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
        navTitle="Question"
        actions={<QuestionActions question={question.data} />}
        bottomBar={signedIn ? <Composer questionId={id} /> : <SignInToAnswer />}>
        <QuestionHeader question={question.data} now={now} answers={list.length} />

        <Section title="Answers" look={list.length ? 'card' : 'plain'} divided={list.length > 0}>
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
                <ListRow
                  title={`Show ${list.length - FIRST_ANSWERS} more answers`}
                  titleTone="action"
                  onPress={() => setShowAll(true)}
                />
              ) : null}
            </>
          )}
        </Section>
        <Text variant="caption" tone="muted" style={styles.footer}>
          Answers come from members, not doctors.
        </Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function QuestionHeader({
  question,
  now,
  answers,
}: {
  question: Question;
  now: Date;
  answers: number;
}) {
  const { palette, isDark } = useDesign();
  const upvoted = useHasUpvotedQuestion(question.id).data ?? false;
  const toggle = useToggleQuestionUpvote(question.id);
  const signedIn = useIsSignedIn();
  const by = question.isAnonymous ? 'Shared anonymously' : questionDisplayName(question);
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface },
        elevation('resting', palette, isDark),
      ]}>
      <Author
        label={question.isAnonymous ? '?' : initials(by)}
        name={by}
        detail={formatRelativeTime(question.createdAt, now)}
      />
      <View style={styles.topic}>
        <Tag tone="next" label={question.category} />
      </View>
      <Text variant="heading" accessibilityRole="header">
        {question.title}
      </Text>
      <Text variant="reading">{question.content}</Text>
      <View style={[styles.actionsRow, { borderTopColor: palette.line }]}>
        <HelpfulButton
          count={question.upvotes}
          active={upvoted}
          onPress={() =>
            signedIn
              ? toggle.mutate(undefined, { onError: (error) => showToast(error.message, 'error') })
              : showToast('Sign in to mark questions as helpful')
          }
        />
        <View style={styles.count}>
          <Icon name="message" size={16} tone="muted" />
          <Text variant="caption" tone="muted">
            {answers === 1 ? '1 answer' : `${answers} answers`}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Avatar initials, name and when: the question's and each answer's top line. */
function Author({ label, name, detail }: { label: string; name: string; detail: string }) {
  const { palette } = useDesign();
  return (
    <View style={styles.author}>
      <View style={[styles.avatar, { backgroundColor: palette.raised }]}>
        <Text variant="caption" tone="action">
          {label}
        </Text>
      </View>
      <View style={styles.flex}>
        <Text variant="strong">{name}</Text>
        <Text variant="caption" tone="muted">
          {detail}
        </Text>
      </View>
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
    <View style={styles.answer}>
      <View style={styles.answerTop}>
        <View style={styles.flex}>
          <Author
            label={answer.isAnonymous ? '?' : initials(name)}
            name={name}
            detail={formatRelativeTime(answer.createdAt, now)}
          />
        </View>
        {userId === answer.userId ? (
          <IconButton icon="trash" accessibilityLabel="Delete your answer" onPress={onDelete} />
        ) : null}
      </View>
      <View style={styles.answerBody}>
        {answer.isAccepted ? (
          <Text variant="caption" tone="help">
            Marked most helpful by the asker
          </Text>
        ) : null}
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
    </View>
  );
}

/** "Helpful · 5": a quiet text toggle; on, it turns violet and bold, not only coloured. */
function HelpfulButton({
  count,
  active,
  onPress,
}: {
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      feedback="fade"
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Helpful, ${count} ${count === 1 ? 'person' : 'people'}`}
      hitSlop={8}
      onPress={onPress}
      style={styles.helpful}>
      <Icon name="thumbs-up" size={16} tone={active ? 'action' : 'muted'} />
      <Text variant={active ? 'strong' : 'caption'} tone={active ? 'action' : 'muted'}>
        Helpful{count ? ` · ${count}` : ''}
      </Text>
    </PressableScale>
  );
}

/** The answer bar pinned at the bottom: anonymous toggle, a field that grows, and Post. */
function Composer({ questionId }: { questionId: string }) {
  const { palette, type } = useDesign();
  const insets = useSafeAreaInsets();
  const anonymousByDefault = useCommunityStore((state) => state.anonymousByDefault);
  const [content, setContent] = useState('');
  const rememberAnonymous = useCommunityStore((state) => state.setAnonymousByDefault);
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
          rememberAnonymous(anonymous);
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
      <IconButton
        icon="eye-off"
        size={40}
        look={anonymous ? 'tinted' : 'plain'}
        accessibilityLabel={
          anonymous
            ? 'Posting anonymously. Double tap to post with your name'
            : 'Posting with your name. Double tap to post anonymously'
        }
        onPress={() => setAnonymous((value) => !value)}
      />
      <TextInput
        accessibilityLabel="Your answer"
        placeholder={anonymous ? 'Answer anonymously' : 'Write an answer'}
        placeholderTextColor={palette.muted}
        multiline
        value={content}
        onChangeText={setContent}
        style={[
          type('body'),
          styles.field,
          { color: palette.ink, backgroundColor: palette.ground },
        ]}
      />
      <Button
        title="Post"
        small
        fullWidth={false}
        disabled={!content.trim()}
        loading={post.isPending}
        onPress={submit}
      />
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
      <Text variant="supporting" tone="muted" style={styles.flex}>
        Sign in to answer, mark answers helpful or save questions.
      </Text>
      <Button
        title="Sign in"
        variant="secondary"
        small
        fullWidth={false}
        onPress={() => router.push('/login')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  card: { gap: space.sm, padding: space.lg, borderRadius: radii.section },
  author: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topic: { flexDirection: 'row', paddingTop: space.xs },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
    marginTop: space.xs,
    paddingTop: space.sm,
    borderTopWidth: 1,
  },
  count: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  answer: { gap: space.xs, paddingVertical: space.md },
  answerTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  // Lines the answer up with the name, past the avatar.
  answerBody: { gap: space.xs, paddingLeft: 32 + space.sm },
  helpful: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xs,
    minHeight: 32,
  },
  footer: { paddingHorizontal: space.xs },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    borderTopWidth: 1,
  },
  field: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    paddingBottom: space.sm,
    borderRadius: 20,
  },
});
