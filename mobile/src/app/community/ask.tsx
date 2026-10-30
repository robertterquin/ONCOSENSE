import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { ListRow, PickerRow, Screen, Section, Switch, Text, TextField } from '@/components/ui';
import { askQuestionSchema, type AskQuestionForm } from '@/constants/validation';
import { useAskQuestion } from '@/hooks/useCommunity';
import { useCommunityStore } from '@/stores/communityStore';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';
import { FORUM_CATEGORIES } from '@/types/question';

// Ask the community (redesign Phase 5, a sheet since Phase 18). Anonymous by default;
// the guard reminder is the footnote under the form.

const close = () => (router.canGoBack() ? router.back() : router.replace('/community'));

export default function AskScreen() {
  const ask = useAskQuestion();
  const anonymousByDefault = useCommunityStore((state) => state.anonymousByDefault);
  const rememberAnonymous = useCommunityStore((state) => state.setAnonymousByDefault);
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
          rememberAnonymous(form.isAnonymous);
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
        sheet={{
          title: 'Ask a question',
          onCancel: close,
          done: { label: 'Post', onPress: onSubmit, loading: ask.isPending },
        }}>
        <Section>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <PickerRow
                label="Topic"
                value={field.value}
                onChange={field.onChange}
                options={FORUM_CATEGORIES.map((topic) => ({ value: topic, label: topic }))}
              />
            )}
          />
        </Section>
        <Section>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <TextField
                grouped
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
                grouped
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
        </Section>
        <Controller
          control={control}
          name="isAnonymous"
          render={({ field }) => (
            <Section>
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
        <Text variant="supporting" tone="muted" style={styles.footer}>
          Members answer from their own experience. Share experiences, not diagnoses. For anything
          urgent, call your doctor or a hotline in Help.
        </Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // A footnote under the groups, as iOS forms do.
  footer: { paddingHorizontal: space.xs },
});
