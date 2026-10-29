import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { QuestionRow } from '@/components/community/QuestionRow';
import { ResourceRow } from '@/components/help/ResourceRow';
import { GuideRow, PreventionDetailSheet } from '@/components/learn/LearnSections';
import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  ListRow,
  LoadingState,
  Screen,
  Section,
  SegmentedControl,
  Text,
  type TileTone,
} from '@/components/ui';
import { useBookmarkedQuestions, useBookmarkedResources } from '@/hooks/useBookmarks';
import { useNow } from '@/hooks/useNow';
import { usePreventionTips } from '@/hooks/usePrevention';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { iconForPreventionTip } from '@/lib/learn';
import { useIsSignedIn } from '@/stores/authStore';
import { useHabitsStore } from '@/stores/habitsStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { PreventionTip } from '@/types/preventionTip';

// Everything saved, in one place: questions and help contacts from
// the account, self-check guides and prevention habits from this phone.

type Kind = 'questions' | 'guides' | 'habits' | 'contacts';

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

export default function SavedScreen() {
  const params = useLocalSearchParams<{ tab?: Kind; kind?: Kind }>();
  const [selectedKind, setSelectedKind] = useState<Kind | null>(null);

  const routeKind = (params.tab || params.kind) as Kind | undefined;
  const initialKind =
    routeKind && ['questions', 'guides', 'habits', 'contacts'].includes(routeKind)
      ? routeKind
      : 'questions';

  const kind = selectedKind ?? initialKind;

  return (
    <Screen back={{ label: 'Profile', onPress: back }} title="Saved">
      <SegmentedControl<Kind>
        accessibilityLabel="Saved items"
        value={kind}
        onChange={setSelectedKind}
        options={[
          { value: 'questions', label: 'Questions' },
          { value: 'guides', label: 'Guides' },
          { value: 'habits', label: 'Habits' },
          { value: 'contacts', label: 'Contacts' },
        ]}
      />
      {kind === 'questions' ? (
        <SavedQuestions />
      ) : kind === 'guides' ? (
        <SavedGuides />
      ) : kind === 'habits' ? (
        <SavedHabits />
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

function SavedHabits() {
  const [selectedTip, setSelectedTip] = useState<PreventionTip | null>(null);
  const bookmarkedIds = useHabitsStore((state) => state.bookmarkedHabits);
  const tips = usePreventionTips();

  if (tips.isPending && bookmarkedIds.length) {
    return <LoadingState message="Loading saved habits" />;
  }

  if (tips.isError) {
    return <ErrorState message="Couldn't load saved habits." onRetry={() => tips.refetch()} />;
  }

  const saved = (tips.data ?? []).filter((tip) => bookmarkedIds.includes(tip.id));

  if (!saved.length) {
    return (
      <Empty
        title="No saved habits"
        message="Tap Save on an everyday habit in Learn to keep it here."
        action={{
          label: 'Go to Learn',
          onPress: () => router.navigate({ pathname: '/learn', params: { section: 'risk' } }),
        }}
      />
    );
  }

  return (
    <>
      <Section>
        {saved.map((tip) => (
          <HabitRow key={tip.id} tip={tip} onOpen={() => setSelectedTip(tip)} />
        ))}
      </Section>
      <PreventionDetailSheet tip={selectedTip} onClose={() => setSelectedTip(null)} />
    </>
  );
}

function tileToneForCategory(category: string): TileTone {
  const cat = category.toLowerCase();
  switch (cat) {
    case 'exercise':
    case 'hydration':
    case 'prevention':
      return 'help';
    case 'lifestyle':
      return 'rose';
    case 'weight':
      return 'sun';
    case 'diet':
    case 'screening':
    default:
      return 'action';
  }
}

function HabitRow({ tip, onOpen }: { tip: PreventionTip; onOpen: () => void }) {
  const { palette } = useDesign();
  const isDone = useHabitsStore((state) => state.isDone(tip.id));
  const toggleDone = useHabitsStore((state) => state.toggleDone);

  return (
    <ListRow
      icon={iconForPreventionTip(tip)}
      iconTone={tileToneForCategory(tip.category)}
      title={tip.title}
      subtitle={tip.description}
      onPress={onOpen}
      accessory={
        <Pressable
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isDone }}
          accessibilityLabel={`Mark ${tip.title} as ${isDone ? 'incomplete' : 'completed today'}`}
          onPress={() => toggleDone(tip.id)}
          style={[
            styles.actionPill,
            isDone
              ? { backgroundColor: palette.helpTint, borderColor: palette.help }
              : { backgroundColor: palette.raised, borderColor: palette.line },
          ]}>
          <Icon
            name={isDone ? 'check' : 'circle'}
            size={12}
            tone={isDone ? 'help' : 'muted'}
            bold={isDone}
          />
          <Text variant="caption" tone={isDone ? 'help' : 'muted'}>
            {isDone ? 'Done' : 'Today'}
          </Text>
        </Pressable>
      }
    />
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
      message="Saved questions and contacts are kept in your account. Guides and habits save on this phone."
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
      <Button
        title={action.label}
        variant="secondary"
        fullWidth={false}
        style={styles.centered}
        onPress={action.onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: space.md },
  centered: { alignSelf: 'center' },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.round,
    borderWidth: 1,
  },
});
