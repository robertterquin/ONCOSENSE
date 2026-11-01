import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { FormTextField } from '@/components/account/FormTextField';
import { PasswordRules } from '@/components/account/PasswordRules';
import { Screen, Section } from '@/components/ui';
import { changePasswordSchema, type ChangePasswordForm } from '@/constants/validation';
import { useChangePassword } from '@/hooks/useAuth';
import { useUser } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';

// Change password (redesign Phase 6, a sheet since Phase 18): confirms the current
// password, then sets the new one.

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile/settings'));

export default function ChangePasswordScreen() {
  const user = useUser();
  const change = useChangePassword();
  const { control, handleSubmit } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      email: user?.email ?? '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  const newPassword = useWatch({ control, name: 'newPassword' });

  const onSubmit = handleSubmit((form) =>
    change.mutate(form, {
      onSuccess: () => {
        showToast('Password changed', 'success');
        back();
      },
      onError: (error) => showToast(error.message, 'error'),
    }),
  );

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        sheet={{
          title: 'Change password',
          onCancel: back,
          done: { label: 'Change', onPress: onSubmit, loading: change.isPending },
        }}>
        {/* The email is the signed-in one, so it's not asked for again. */}
        <Section>
          <FormTextField
            grouped
            control={control}
            name="currentPassword"
            label="Current password"
            secure
            autoComplete="current-password"
            textContentType="password"
          />
        </Section>
        <Section>
          <FormTextField
            grouped
            control={control}
            name="newPassword"
            label="New password"
            secure
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <FormTextField
            grouped
            control={control}
            name="confirmPassword"
            label="Confirm new password"
            secure
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={() => onSubmit()}
          />
        </Section>
        <PasswordRules password={newPassword ?? ''} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
