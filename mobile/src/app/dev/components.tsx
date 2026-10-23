import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { PinkSwitch } from '@/components/PinkSwitch';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { InputField } from '@/components/InputField';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { emailSchema } from '@/constants/validation';
import { useThemeStore } from '@/stores/themeStore';
import { brand } from '@/theme/colors';
import { textVariants, type TextVariant } from '@/theme/typography';

/** Development-only gallery of the shared components, in light and dark mode. */
export default function ComponentGalleryScreen() {
  const { isDarkMode, setDarkMode } = useThemeStore();
  const [email, setEmail] = useState('not-an-email');
  const emailError = emailSchema.safeParse(email).error?.issues[0]?.message ?? null;

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <Screen
      header={<AppHeader title="Component Gallery" subtitle="Phase 2 shared UI" showBackButton />}>
      <Card style={styles.row}>
        <AppText variant="titleMedium">Dark mode</AppText>
        <PinkSwitch accessibilityLabel="Dark mode" value={isDarkMode} onValueChange={setDarkMode} />
      </Card>

      <Card>
        {(Object.keys(textVariants) as TextVariant[]).map((variant) => (
          <AppText key={variant} variant={variant}>
            {variant}
          </AppText>
        ))}
        <AppText secondary>Secondary text</AppText>
      </Card>

      <Card style={styles.row}>
        {['water_drop', 'health_and_safety', 'favorite', 'celebration', 'not_a_real_icon'].map(
          (name) => (
            <MaterialIcon key={name} name={name} size={28} color={brand.primaryPink} />
          ),
        )}
      </Card>

      <Button title="Primary button" onPress={() => {}} />
      <Button title="Outlined button" outlined onPress={() => {}} />
      <Button title="Loading" loading onPress={() => {}} />

      <InputField
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <InputField label="Password" placeholder="Enter your password" isPassword />

      <Card>
        <LoadingState message="Loading cancer types…" />
      </Card>
      <Card>
        <ErrorState message="Failed to load resources." onRetry={() => {}} />
      </Card>
      <Card>
        <EmptyState
          title="No saved articles"
          message="Articles you save appear here."
          icon="bookmark_border"
        />
      </Card>
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spacer: {
    height: 16,
  },
});
