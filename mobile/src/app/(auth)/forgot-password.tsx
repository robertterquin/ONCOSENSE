import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { MaterialIcon } from '@/components/MaterialIcon';
import { forgotPasswordSchema, MESSAGES, type ForgotPasswordForm } from '@/constants/validation';
import { useResetPassword } from '@/hooks/useAuth';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';

// Port of lib/screens/auth/forgot_password_screen.dart

const backToLogin = () => (router.canGoBack() ? router.back() : router.replace('/login'));

export default function ForgotPasswordScreen() {
  const reset = useResetPassword();
  const { control, handleSubmit } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit((form) => reset.mutate(form.email));

  if (reset.isSuccess) {
    return (
      <AuthLayout title="Forgot Password" centered>
        <View style={styles.center}>
          <MaterialIcon name="check_circle" size={80} color="#43A047" />
          <AppText variant="headlineMedium">Email Sent!</AppText>
          <AppText color="#424242" style={styles.centeredText}>
            {MESSAGES.passwordResetEmailSent}
          </AppText>
        </View>
        <View style={styles.info}>
          <MaterialIcon name="info_outline" size={20} color={brand.primaryPink} />
          <AppText variant="bodySmall" color="#424242" style={styles.infoText}>
            Please check your inbox and spam folder. The link will expire in 24 hours.
          </AppText>
        </View>
        <Button title="Back to Login" onPress={backToLogin} />
        <Pressable accessibilityRole="button" onPress={() => reset.reset()} style={styles.resend}>
          <AppText variant="label" color={brand.primaryPink}>
            Didn&apos;t receive the email? Resend
          </AppText>
        </Pressable>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password">
      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <MaterialIcon name="lock_reset" size={56} color={brand.primaryPink} />
        </View>
        <AppText variant="headlineMedium">Reset Your Password</AppText>
        <AppText color="#424242" style={styles.centeredText}>
          Enter your email address and we&apos;ll send you a link to reset your password.
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
        onSubmitEditing={() => onSubmit()}
        leftIcon={<MaterialIcon name="mail-outline" size={22} color="#757575" />}
      />
      <Button title="Send Reset Link" onPress={onSubmit} loading={reset.isPending} />

      <View style={styles.footer}>
        <AppText>Remember your password? </AppText>
        <Pressable accessibilityRole="link" hitSlop={8} onPress={backToLogin}>
          <AppText variant="label" color={brand.primaryPink}>
            Login
          </AppText>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: brand.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
  info: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: radius.medium,
    backgroundColor: brand.lightPink,
  },
  infoText: {
    flex: 1,
  },
  resend: {
    alignItems: 'center',
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
