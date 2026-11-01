import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { FormTextField } from '@/components/account/FormTextField';
import { Button, ListRow, Screen, Section, Switch, Text } from '@/components/ui';
import { loginSchema, type LoginForm } from '@/constants/validation';
import { continueAsGuest, useSignIn } from '@/hooks/useAuth';
import { space } from '@/theme/tokens';

// Sign in (redesign Phase 6). "Keep me signed in" is the existing remember-me.

const back = () => (router.canGoBack() ? router.back() : router.replace('/welcome'));

export default function SignInScreen() {
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const signIn = useSignIn();
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const onSubmit = handleSubmit((form) => signIn.mutate({ ...form, rememberMe: keepSignedIn }));

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen back={{ label: 'Welcome', onPress: back }} title="Sign in" subtitle="Welcome back.">
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
          autoComplete="current-password"
          textContentType="password"
          onSubmitEditing={() => onSubmit()}
        />
        <Section divided={false}>
          <ListRow
            title="Keep me signed in"
            subtitle="On this phone"
            accessory={
              <Switch
                accessibilityLabel="Keep me signed in"
                value={keepSignedIn}
                onValueChange={setKeepSignedIn}
              />
            }
          />
        </Section>
        <Button title="Sign in" loading={signIn.isPending} onPress={onSubmit} />
        <Button
          title="Forgot your password?"
          variant="quiet"
          onPress={() => router.push('/forgot-password')}
        />
        <View style={styles.divider}>
          <Text variant="supporting" tone="muted">
            or
          </Text>
        </View>
        <Button
          title="Look around without an account"
          variant="secondary"
          onPress={continueAsGuest}
        />
        <View style={styles.footer}>
          <Text variant="supporting" tone="muted">
            New to OncoSense?
          </Text>
          <Button
            title="Create an account"
            variant="quiet"
            small
            fullWidth={false}
            onPress={() => router.replace('/register')}
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  divider: { alignItems: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
});
