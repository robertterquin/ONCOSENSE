import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import {
  Banner,
  BottomActionBar,
  Button,
  Chip,
  ListRow,
  Screen,
  Section,
  Switch,
  TextField,
} from '@/components/ui';
import { askQuestionSchema, type AskQuestionForm } from '@/constants/validation';
import { useAskQuestion } from '@/hooks/useForum';
import { useCommunityStore } from '@/stores/communityStore';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';
import { FORUM_CATEGORIES } from '@/types/question';

// Ask the community (redesign Phase 5). Anonymous by default; the guard reminder sits
// right above the Post button.

const close = () => (router.canGoBack() ? router.back() : router.replace('/community'));

export default function AskScreen() {
  const ask = useAskQuestion();
  const anonymousByDefault = useCommunityStore((state) => state.anonymousByDefault);
  const { control, handleSubmit } = useForm<AskQuestionForm>({
    resolver: zodResolver(askQuestionSchema),
    defaultValues: {
      category: 'Symptoms',
      title: '',
      content: '',
      isAnonymous: anonymousByDefault,
    },
  });

  const onSubmit = handleSubmit((form) =>
    ask.mutate(
      {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        isAnonymous: form.isAnonymous,
      },
      {
        onSuccess: () => {
          showToast('Question posted', 'success');
          close();
        },
        onError: (error) => showToast(`Couldn't post: ${error.message}`, 'error'),
      },
    ),
  );

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        back={{ label: 'Community', onPress: close }}
        title="Ask a question"
        subtitle="Members answer from their own experience."
        bottomBar={
          <BottomActionBar>
            <Button title="Post question" loading={ask.isPending} onPress={onSubmit} />
          </BottomActionBar>
        }>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Section title="Topic" look="plain">
              <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Topic">
                {FORUM_CATEGORIES.map((topic) => (
                  <Chip
                    key={topic}
                    kind="radio"
                    label={topic}
                    selected={field.value === topic}
                    onPress={() => field.onChange(topic)}
                  />
                ))}
              </View>
            </Section>
          )}
        />
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <TextField
              label="Your question"
              placeholder="What would you like to ask?"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message ?? null}
              maxLength={200}
            />
          )}
        />
        <Controller
          control={control}
          name="content"
          render={({ field, fieldState }) => (
            <TextField
              label="Details"
              placeholder="Share what's going on, so people can answer well"
              multiline
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message ?? null}
              maxLength={2000}
            />
          )}
        />
        <Controller
          control={control}
          name="isAnonymous"
          render={({ field }) => (
            <Section divided={false}>
              <ListRow
                title="Post anonymously"
                subtitle={field.value ? 'Your name is hidden' : 'Your name is shown'}
                accessory={
                  <Switch
                    accessibilityLabel="Post anonymously"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                }
              />
            </Section>
          )}
        />
        <Banner tone="guard">
          Share experiences, not diagnoses. For anything urgent, call your doctor or a hotline in
          Help.
        </Banner>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
