import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { FormField } from '@/components/FormField';
import { MaterialIcon } from '@/components/MaterialIcon';
import { PasswordChecklist } from '@/components/PasswordChecklist';
import { GENDER_OPTIONS } from '@/constants/app';
import { MESSAGES, registerSchema, type RegisterForm } from '@/constants/validation';
import { useSignUp } from '@/hooks/useAuth';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';

// Port of lib/screens/auth/register_screen.dart

const WHITE: readonly [string, string] = ['#FFFFFF', '#FFFFFF'];

export default function RegisterScreen() {
  const [termsAccepted, setTermsAccepted] = useState(false);
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
    <AuthLayout title="Create Account" gradient={WHITE}>
      <FormField
        control={control}
        name="name"
        label="Full Name"
        placeholder="Enter your full name"
        autoComplete="name"
        textContentType="name"
        leftIcon={<MaterialIcon name="person-outline" size={22} color="#757575" />}
      />
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
        placeholder="Enter a strong password"
        isPassword
        autoComplete="new-password"
        textContentType="newPassword"
        leftIcon={<MaterialIcon name="lock-outline" size={22} color="#757575" />}
      />

      <PasswordChecklist password={password ?? ''} />

      <FormField
        control={control}
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Re-enter your password"
        isPassword
        autoComplete="new-password"
        textContentType="newPassword"
        leftIcon={<MaterialIcon name="lock-outline" size={22} color="#757575" />}
      />
      <FormField
        control={control}
        name="age"
        label="Age (Optional)"
        placeholder="Enter your age"
        keyboardType="number-pad"
        maxLength={3}
        leftIcon={<MaterialIcon name="calendar_today" size={20} color="#757575" />}
      />

      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <View style={styles.gender}>
            <AppText variant="label">Gender (Optional)</AppText>
            <View style={styles.chips} accessibilityRole="radiogroup">
              {GENDER_OPTIONS.map((option) => {
                const selected = field.value === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => field.onChange(selected ? null : option)}
                    style={[styles.chip, selected && styles.chipSelected]}>
                    <AppText color={selected ? brand.white : '#424242'}>{option}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      />

      <Checkbox
        checked={termsAccepted}
        onChange={setTermsAccepted}
        accessibilityLabel="I agree to the Terms & Conditions and Privacy Policy"
        label={
          <AppText style={styles.terms}>
            I agree to the{' '}
            <AppText variant="label" color={brand.primaryPink}>
              Terms &amp; Conditions
            </AppText>{' '}
            and{' '}
            <AppText variant="label" color={brand.primaryPink}>
              Privacy Policy
            </AppText>
          </AppText>
        }
      />

      <Button title="Register" onPress={onSubmit} loading={signUp.isPending} style={styles.gap} />

      <View style={styles.footer}>
        <AppText>Already have an account? </AppText>
        <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.replace('/login')}>
          <AppText variant="label" color={brand.primaryPink}>
            Login
          </AppText>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  gender: {
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  chipSelected: {
    backgroundColor: brand.primaryPink,
  },
  terms: {
    flexShrink: 1,
  },
  gap: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
