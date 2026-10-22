import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import { askQuestionSchema, type AskQuestionForm } from '@/constants/validation';
import { useAskQuestion } from '@/hooks/useForum';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { FORUM_CATEGORIES, forumCategoryIcon } from '@/types/question';

// Port of lib/screens/forum/ask_question_screen.dart

export default function AskQuestionScreen() {
  const { colors, isDark } = useTheme();
  const ask = useAskQuestion();
  const { control, handleSubmit } = useForm<AskQuestionForm>({
    resolver: zodResolver(askQuestionSchema),
    defaultValues: { category: 'Symptoms', title: '', content: '', isAnonymous: false },
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
          showToast('✅ Question posted successfully!', 'success');
          router.back();
        },
        onError: (error) => showToast(`❌ Error posting question: ${error.message}`, 'error'),
      },
    ),
  );

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        background="surface"
        header={
          <AppHeader
            title="Ask a Question"
            subtitle="Share your concerns with the community"
            showBackButton
          />
        }>
        <AppText variant="label">Category</AppText>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <View style={styles.chips} accessibilityRole="radiogroup">
              {FORUM_CATEGORIES.map((category) => {
                const selected = field.value === category;
                return (
                  <Pressable
                    key={category}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => field.onChange(category)}
                    style={[
                      styles.chip,
                      selected
                        ? { backgroundColor: brand.headerPink, borderColor: brand.headerPink }
                        : { backgroundColor: colors.card, borderColor: colors.divider },
                    ]}>
                    <AppText variant="bodySmall" color={selected ? brand.white : colors.text}>
                      {forumCategoryIcon(category)} {category}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        <FormField
          control={control}
          name="title"
          label="Title"
          placeholder="What would you like to know?"
          maxLength={200}
        />
        <FormField
          control={control}
          name="content"
          label="Details"
          placeholder="Provide more details to help others understand your question..."
          multiline
          numberOfLines={8}
          maxLength={2000}
        />

        <Controller
          control={control}
          name="isAnonymous"
          render={({ field }) => (
            <View style={[styles.anonymous, { backgroundColor: isDark ? colors.card : '#F5F5F5' }]}>
              <View style={styles.flex}>
                <AppText variant="label">Post Anonymously</AppText>
                <AppText variant="bodySmall" secondary>
                  Your name won&apos;t be shown
                </AppText>
              </View>
              <Switch
                accessibilityLabel="Post anonymously"
                value={field.value}
                onValueChange={field.onChange}
                trackColor={{ true: brand.mediumPink }}
                thumbColor={field.value ? brand.headerPink : undefined}
              />
            </View>
          )}
        />

        <View
          style={[styles.guidelines, { backgroundColor: isDark ? '#3D1F2B' : brand.lightPink }]}>
          <View style={styles.row}>
            <MaterialIcon name="info_outline" size={18} color={brand.headerPink} />
            <AppText variant="label" color={brand.headerPink}>
              Community Guidelines
            </AppText>
          </View>
          <AppText variant="bodySmall" secondary style={styles.guidelineText}>
            • Be respectful and supportive{'\n'}• Don&apos;t share personal medical information
            {'\n'}• Seek professional medical advice{'\n'}• No spam or promotional content
          </AppText>
        </View>

        <Button title="Post Question" onPress={onSubmit} loading={ask.isPending} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  anonymous: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.medium,
  },
  guidelines: {
    padding: 16,
    borderRadius: radius.medium,
    gap: 8,
  },
  guidelineText: {
    lineHeight: 20,
  },
});
