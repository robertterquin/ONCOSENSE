import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

import { AppText } from './AppText';
import { MaterialIcon } from './MaterialIcon';

type InputFieldProps = Omit<TextInputProps, 'secureTextEntry' | 'style'> & {
  label: string;
  /** Shown under the field in red. */
  error?: string | null;
  /** Hides the text and adds a show/hide toggle. */
  isPassword?: boolean;
  leftIcon?: ReactNode;
};

/** Labeled text field (port of InputField). */
export function InputField({
  label,
  error,
  isPassword = false,
  leftIcon,
  editable = true,
  multiline,
  ...inputProps
}: InputFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const borderColor = error ? brand.error : focused ? brand.primaryPink : 'transparent';

  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      <View
        style={[
          styles.field,
          { backgroundColor: colors.inputFill, borderColor, borderWidth: error || focused ? 2 : 0 },
          !editable && styles.disabled,
        ]}>
        {leftIcon}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={isPassword && hidden}
          editable={editable}
          multiline={multiline}
          style={[styles.input, { color: colors.text }, multiline && styles.multiline]}
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={8}
            onPress={() => setHidden((value) => !value)}>
            <MaterialIcon
              name={hidden ? 'visibility_off' : 'visibility'}
              size={22}
              color="#BDBDBD"
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="bodySmall" color={brand.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.medium,
    paddingHorizontal: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  disabled: {
    opacity: 0.6,
  },
});
