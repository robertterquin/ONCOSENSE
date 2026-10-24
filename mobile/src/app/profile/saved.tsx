import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { QuestionItem, ResourceItem } from '@/components/profile/SavedItems';
import { SavedList } from '@/components/profile/SavedList';
import {
  useBookmarkedQuestions,
  useBookmarkedResources,
  useToggleQuestionBookmark,
  useToggleResourceBookmark,
} from '@/hooks/useBookmarks';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import type { Question } from '@/types/question';
import type { Resource } from '@/types/resource';

// One Saved screen for questions and help contacts (redesign Phase 1). Phase 5 adds
// saved guides and the new look.

type Tab = 'questions' | 'contacts';

export default function SavedScreen() {
  const [tab, setTab] = useState<Tab>('questions');
  const questions = useBookmarkedQuestions();
  const resources = useBookmarkedResources();
  const toggleQuestion = useToggleQuestionBookmark().toggle;
  const toggleResource = useToggleResourceBookmark().toggle;

  const tabs = (
    <View accessibilityRole="tablist" style={styles.tabs}>
      <TabButton
        label="Questions"
        selected={tab === 'questions'}
        onPress={() => setTab('questions')}
      />
      <TabButton
        label="Help contacts"
        selected={tab === 'contacts'}
        onPress={() => setTab('contacts')}
      />
    </View>
  );

  if (tab === 'questions') {
    return (
      <SavedList<Question>
        title="Saved"
        subtitle="Questions and help contacts you saved"
        top={tabs}
        query={questions}
        errorPrefix="Couldn't load saved questions"
        empty={{
          icon: 'bookmark_border',
          title: 'No saved questions',
          message: 'Save questions in Community to find them here.',
          action: 'Go to Community',
          href: '/community',
        }}
        renderItem={(question) => (
          <QuestionItem
            key={question.id}
            question={question}
            onRemove={() => {
              toggleQuestion(question);
              showToast('Removed from saved');
            }}
          />
        )}
      />
    );
  }

  return (
    <SavedList<Resource>
      title="Saved"
      subtitle="Questions and help contacts you saved"
      top={tabs}
      query={resources}
      errorPrefix="Couldn't load saved help contacts"
      empty={{
        icon: 'favorite_border',
        title: 'No saved help contacts',
        message: 'Save hotlines, centers and groups in Help to find them here.',
        action: 'Go to Help',
        href: '/help',
      }}
      renderItem={(resource) => (
        <ResourceItem
          key={resource.id}
          resource={resource}
          onRemove={() => {
            toggleResource(resource);
            showToast('Removed from saved');
          }}
        />
      )}
    />
  );
}

function TabButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tab, selected && styles.tabSelected]}>
      <AppText variant="label" color={selected ? brand.white : brand.headerPink}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: brand.headerPink,
  },
  tabSelected: { backgroundColor: brand.headerPink },
});
