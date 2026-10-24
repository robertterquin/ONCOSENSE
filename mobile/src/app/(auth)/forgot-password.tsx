import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { FormTextField } from '@/components/account/FormTextField';
import { Banner, Button, Screen } from '@/components/ui';
import { forgotPasswordSchema, MESSAGES, type ForgotPasswordForm } from '@/constants/validation';
import { useResetPassword } from '@/hooks/useAuth';

// Forgot password (redesign Phase 6): same Supabase reset email as before.

const backToSignIn = () => (router.canGoBack() ? router.back() : router.replace('/login'));

export default function ForgotPasswordScreen() {
  const reset = useResetPassword();
  const { control, handleSubmit } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const onSubmit = handleSubmit((form) => reset.mutate(form.email));

  if (reset.isSuccess) {
    return (
      <Screen back={{ label: 'Sign in', onPress: backToSignIn }} title="Check your email">
        <Banner tone="info" title="Reset link sent">
          {MESSAGES.passwordResetEmailSent}
        </Banner>
        <Banner tone="info">
          Look in your inbox and spam folder. The link works for 24 hours.
        </Banner>
        <Button title="Back to sign in" onPress={backToSignIn} />
        <Button title="Didn't get it? Send again" variant="quiet" onPress={() => reset.reset()} />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        back={{ label: 'Sign in', onPress: backToSignIn }}
        title="Reset your password"
        subtitle="Enter your email and we'll send you a link to choose a new password.">
        <FormTextField
          control={control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          onSubmitEditing={() => onSubmit()}
        />
        <Button title="Send reset link" loading={reset.isPending} onPress={onSubmit} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
