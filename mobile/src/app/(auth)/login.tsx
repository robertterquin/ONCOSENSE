import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { FormField } from '@/components/FormField';
import { MaterialIcon } from '@/components/MaterialIcon';
import { loginSchema, type LoginForm } from '@/constants/validation';
import { continueAsGuest, useSignIn } from '@/hooks/useAuth';
import { brand } from '@/theme/colors';

// Port of lib/screens/auth/login_screen.dart

export default function LoginScreen() {
  const [rememberMe, setRememberMe] = useState(false);
  const signIn = useSignIn();
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((form) => signIn.mutate({ ...form, rememberMe }));

  return (
    <AuthLayout title="Login">
      <View style={styles.intro}>
        <AppText variant="displayMedium" color={brand.darkPink}>
          Welcome Back!
        </AppText>
        <AppText variant="bodyLarge" color="#424242">
          Login to continue your journey
        </AppText>
      </View>

      <FormField
        control={control}
        name="email"
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        leftIcon={<MaterialIcon name="mail-outline" size={22} color="#757575" />}
      />
      <FormField
        control={control}
        name="password"
        label="Password"
        placeholder="Enter your password"
        isPassword
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={() => onSubmit()}
        leftIcon={<MaterialIcon name="lock-outline" size={22} color="#757575" />}
      />

      <View style={styles.optionsRow}>
        <Checkbox checked={rememberMe} onChange={setRememberMe} label="Remember me" />
        <Pressable
          accessibilityRole="link"
          hitSlop={8}
          onPress={() => router.push('/forgot-password')}>
          <AppText variant="label" color={brand.primaryPink}>
            Forgot Password?
          </AppText>
        </Pressable>
      </View>

      <Button title="Login" onPress={onSubmit} loading={signIn.isPending} style={styles.gap} />

      <View style={styles.divider}>
        <View style={styles.line} />
        <AppText color="#BDBDBD">OR</AppText>
        <View style={styles.line} />
      </View>

      <Button title="Continue as Guest" outlined onPress={continueAsGuest} />

      <View style={styles.footer}>
        <AppText>Don&apos;t have an account? </AppText>
        <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.replace('/register')}>
          <AppText variant="label" color={brand.primaryPink} style={styles.bold}>
            Register
          </AppText>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  gap: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(189, 189, 189, 0.5)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bold: {
    fontFamily: 'Poppins_700Bold',
  },
});
