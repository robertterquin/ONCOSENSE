import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { FormTextField } from '@/components/account/FormTextField';
import { LegalSheet, type LegalTitle } from '@/components/account/LegalSheet';
import { PasswordRules } from '@/components/account/PasswordRules';
import { Button, Chip, Screen, Text } from '@/components/ui';
import { GENDER_OPTIONS } from '@/constants/app';
import { MESSAGES, registerSchema, type RegisterForm } from '@/constants/validation';
import { useSignUp } from '@/hooks/useAuth';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';

// Create an account (redesign Phase 6): same fields and rules as before, then "What
// brings you here?".

const back = () => (router.canGoBack() ? router.back() : router.replace('/welcome'));

export default function CreateAccountScreen() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [legal, setLegal] = useState<LegalTitle | null>(null);
  const signUp = useSignUp();
  const { control, handleSubmit } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
      gender: null,
    },
  });
  const password = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit((form) => {
    if (!termsAccepted) {
      showToast(MESSAGES.termsNotAccepted, 'error');
      return;
    }
    const age = form.age.trim();
    signUp.mutate({
      email: form.email,
      password: form.password,
      // Same metadata keys as the Flutter app.
      metadata: {
        full_name: form.name.trim(),
        ...(age && { age: Number(age) }),
        ...(form.gender && { gender: form.gender }),
      },
    });
  });

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        back={{ label: 'Welcome', onPress: back }}
        title="Create an account"
        subtitle="Your check-ins and saved items stay with you on any phone.">
        <FormTextField
          control={control}
          name="name"
          label="Your name"
          autoComplete="name"
          textContentType="name"
        />
        <FormTextField
          control={control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <FormTextField
          control={control}
          name="password"
          label="Password"
          secure
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <PasswordRules password={password ?? ''} />
        <FormTextField
          control={control}
          name="confirmPassword"
          label="Confirm password"
          secure
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <FormTextField
          control={control}
          name="age"
          label="Age (optional)"
          keyboardType="number-pad"
          maxLength={3}
        />
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <View style={styles.field}>
              <Text variant="row">Gender (optional)</Text>
              <Text variant="supporting" tone="muted">
                Helps us suggest the right self-checks
              </Text>
              <View style={styles.chips} accessibilityRole="radiogroup">
                {GENDER_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    kind="radio"
                    label={option}
                    selected={field.value === option}
                    onPress={() => field.onChange(field.value === option ? null : option)}
                  />
                ))}
              </View>
            </View>
          )}
        />
        <View style={styles.terms}>
          <Chip
            label="I agree to the Terms of service and Privacy policy"
            selected={termsAccepted}
            onPress={() => setTermsAccepted(!termsAccepted)}
          />
          <View style={styles.links}>
            <Button
              title="Read the terms"
              variant="quiet"
              small
              onPress={() => setLegal('Terms of service')}
            />
            <Button
              title="Read the privacy policy"
              variant="quiet"
              small
              onPress={() => setLegal('Privacy policy')}
            />
          </View>
        </View>
        <Button title="Create account" loading={signUp.isPending} onPress={onSubmit} />
        <View style={styles.footer}>
          <Text variant="supporting" tone="muted">
            Already have an account?
          </Text>
          <Button title="Sign in" variant="quiet" small onPress={() => router.replace('/login')} />
        </View>
      </Screen>
      <LegalSheet open={legal} onClose={() => setLegal(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // Matches a text field: label, then the control.
  field: { gap: space.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xs },
  terms: { gap: space.xs },
  links: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
});
