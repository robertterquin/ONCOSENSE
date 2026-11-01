import { useId, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { useTransition } from '@/theme/motion';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Icon } from './Icon';
import { MAX_FONT_SCALE, Text } from './Text';

type TextFieldProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  /** Always visible above the field (placeholders vanish while typing). */
  label: string;
  /** Shown under the field in the danger colour, and announced. */
  error?: string | null;
  /** Password field with a Show / Hide button. */
  secure?: boolean;
  /**
   * A row inside a `Section` card (iOS grouped form): the label stays above in small
   * type, the input has no box of its own, and the label turns violet while typing.
   */
  grouped?: boolean;
};

/** Labelled text input, 56 pt tall (multi-line grows from three lines). */
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export function TextField({
  label,
  error,
  secure = false,
  grouped = false,
  multiline,
  ...input
}: TextFieldProps) {
  const { palette, type } = useDesign();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const id = useId();
  const border = useTransition('base', ['borderColor', 'borderWidth']);

  return (
    <View style={grouped ? styles.groupedField : styles.field}>
      <Text
        variant={grouped ? 'caption' : 'row'}
        tone={grouped ? (error ? 'danger' : focused ? 'action' : 'muted') : 'ink'}
        nativeID={`${id}-label`}>
        {label}
      </Text>
      <View>
        <AnimatedTextInput
          maxFontSizeMultiplier={MAX_FONT_SCALE}
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
            grouped ? styles.groupedInput : styles.input,
            !grouped && border,
            multiline && (grouped ? styles.groupedMultiline : styles.multiline),
            secure && styles.withButton,
            { color: palette.ink },
            !grouped && {
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
            style={[styles.showButton, grouped && styles.groupedShow]}>
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

/** Search input with a magnifier, for lists: slim and filled, like an iOS search bar. */
export function SearchField({ accessibilityLabel, ...input }: SearchFieldProps) {
  const { palette, type } = useDesign();
  return (
    <View>
      <View style={styles.searchIcon} pointerEvents="none">
        <Icon name="search" size={18} tone="muted" />
      </View>
      <TextInput
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        accessibilityLabel={accessibilityLabel}
        placeholderTextColor={palette.muted}
        returnKeyType="search"
        clearButtonMode="while-editing"
        {...input}
        style={[
          type('body'),
          styles.search,
          { color: palette.ink, backgroundColor: palette.surface },
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
  groupedField: { gap: 2, paddingVertical: space.md },
  groupedInput: { minHeight: sizes.touch, paddingVertical: space.xs },
  groupedMultiline: { minHeight: 72 },
  groupedShow: { right: -space.md },
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
  search: {
    minHeight: sizes.touch,
    paddingLeft: 38,
    paddingRight: space.md,
    paddingVertical: space.sm,
    borderRadius: 12,
  },
  searchIcon: {
    position: 'absolute',
    left: space.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
});
