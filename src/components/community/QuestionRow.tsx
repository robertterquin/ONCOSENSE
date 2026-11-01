import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { questionMeta } from '@/lib/community';
import { space } from '@/theme/tokens';
import type { Question } from '@/types/question';

// A question in a list (Community, Saved): topic, bold title, then answers, helpful
// count and time.

export function QuestionRow({ question, now }: { question: Question; now: Date }) {
  const meta = questionMeta(question, now);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${question.category}. ${question.title}. ${meta}`}
      onPress={() => router.push({ pathname: '/community/[id]', params: { id: question.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.text}>
        <Text variant="caption" tone="action">
          {question.category}
        </Text>
        <Text variant="row" numberOfLines={2}>
          {question.title}
        </Text>
        <Text variant="supporting" tone="muted">
          {meta}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} tone="muted" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  text: { flex: 1, gap: 2 },
  pressed: { opacity: 0.6 },
});
