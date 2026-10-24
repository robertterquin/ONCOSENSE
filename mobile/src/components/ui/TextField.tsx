import { useId, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Icon } from './Icon';
import { Text } from './Text';

type TextFieldProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  /** Always visible above the field (placeholders vanish while typing). */
  label: string;
  /** Shown under the field in rose, and announced. */
  error?: string | null;
  /** Password field with a Show / Hide button. */
  secure?: boolean;
};

/** Labelled text input, 56 pt tall (multi-line grows from three lines). */
export function TextField({ label, error, secure = false, multiline, ...input }: TextFieldProps) {
  const { palette, type } = useDesign();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const id = useId();

  return (
    <View style={styles.field}>
      <Text variant="row" nativeID={`${id}-label`}>
        {label}
      </Text>
      <View>
        <TextInput
          accessibilityLabel={label}
          accessibilityLabelledBy={`${id}-label`}
          accessibilityHint={error ?? undefined}
          placeholderTextColor={palette.muted}
          secureTextEntry={secure && hidden}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...input}
          onFocus={(event) => {
            setFocused(true);
            input.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            input.onBlur?.(event);
          }}
          style={[
            type('body'),
            styles.input,
            multiline && styles.multiline,
            secure && styles.withButton,
            {
              color: palette.ink,
              backgroundColor: palette.surface,
              borderColor: error ? palette.danger : focused ? palette.action : palette.border,
              borderWidth: error || focused ? 2 : 1.5,
            },
          ]}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hidden ? `Show ${label.toLowerCase()}` : `Hide ${label.toLowerCase()}`
            }
            onPress={() => setHidden((value) => !value)}
            style={styles.showButton}>
            <Text variant="strong" tone="action">
              {hidden ? 'Show' : 'Hide'}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.error} accessibilityLiveRegion="polite">
          <Icon name="circle-alert" size={18} tone="danger" />
          <Text variant="supporting" tone="danger" style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

type SearchFieldProps = Omit<TextInputProps, 'style'> & {
  /** Read by screen readers (the field has no visible label). */
  accessibilityLabel: string;
};

/** Search input with a magnifier, for lists. */
export function SearchField({ accessibilityLabel, ...input }: SearchFieldProps) {
  const { palette, type } = useDesign();
  return (
    <View>
      <View style={styles.searchIcon} pointerEvents="none">
        <Icon name="search" size={22} tone="muted" />
      </View>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        placeholderTextColor={palette.muted}
        returnKeyType="search"
        clearButtonMode="while-editing"
        {...input}
        style={[
          type('body'),
          styles.input,
          styles.search,
          { color: palette.ink, backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: space.sm },
  input: {
    minHeight: sizes.button + 2,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radii.control - 2,
    borderWidth: 1.5,
  },
  multiline: { minHeight: 112 },
  withButton: { paddingRight: 72 },
  showButton: {
    position: 'absolute',
    right: space.xs,
    top: 0,
    bottom: 0,
    minWidth: sizes.touch,
    paddingHorizontal: space.md,
    justifyContent: 'center',
  },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xs + 2 },
  errorText: { flex: 1 },
  search: { paddingLeft: 48, borderRadius: radii.control },
  searchIcon: {
    position: 'absolute',
    left: space.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
});
