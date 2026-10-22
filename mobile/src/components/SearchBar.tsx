import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

import { MaterialIcon } from './MaterialIcon';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSubmit?: () => void;
};

/** Rounded search field with a pink search icon and a clear button. */
export function SearchBar({ value, onChangeText, placeholder, onSubmit }: SearchBarProps) {
  const { colors, isDark } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.card : '#FAFAFA',
          borderColor: focused ? brand.headerPink : isDark ? colors.divider : '#E0E0E0',
        },
      ]}>
      <MaterialIcon name="search" size={22} color={brand.headerPink} />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect={false}
        style={[styles.input, { color: colors.text }]}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={() => onChangeText('')}>
          <MaterialIcon name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.medium,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
});
