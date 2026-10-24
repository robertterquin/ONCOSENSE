import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { MaterialIcon } from '@/components/MaterialIcon';
import { PasswordChecklist } from '@/components/PasswordChecklist';
import { Screen } from '@/components/Screen';
import { changePasswordSchema, type ChangePasswordForm } from '@/constants/validation';
import { useChangePassword } from '@/hooks/useAuth';
import { useUser } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';

// Port of lib/screens/profile/change_password_screen.dart

const lockIcon = <MaterialIcon name="lock-outline" size={22} color="#757575" />;

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
        showToast('Password changed successfully!', 'success');
        router.back();
      },
      onError: (error) => showToast(error.message, 'error'),
    }),
  );

  return (
    <Screen
      background="surface"
      header={
        <AppHeader title="Change Password" subtitle="Update your account password" showBackButton />
      }>
      <FormField
        control={control}
        name="email"
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        leftIcon={<MaterialIcon name="mail-outline" size={22} color="#757575" />}
      />
      <FormField
        control={control}
        name="currentPassword"
        label="Current Password"
        placeholder="Enter current password"
        isPassword
        autoComplete="current-password"
        leftIcon={lockIcon}
      />
      <FormField
        control={control}
        name="newPassword"
        label="New Password"
        placeholder="Enter a strong password"
        isPassword
        autoComplete="new-password"
        leftIcon={lockIcon}
      />
      <PasswordChecklist password={newPassword ?? ''} />
      <FormField
        control={control}
        name="confirmPassword"
        label="Confirm New Password"
        placeholder="Confirm new password"
        isPassword
        autoComplete="new-password"
        leftIcon={lockIcon}
      />
      <Button title="Change Password" onPress={onSubmit} loading={change.isPending} />
    </Screen>
  );
}
