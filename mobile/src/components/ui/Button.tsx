import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Palette } from '@/theme/palette';
import { useTransition } from '@/theme/motion';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import { haptics } from '@/lib/haptics';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'quiet'
  | 'help'
  | 'destructive'
  /** White button on the night-violet panel. */
  | 'onPanel'
  /** Text-only button on the night-violet panel. */
  | 'onPanelQuiet'
  /** Text-only button in soft rose on the night-violet panel (Today's "Remind me tomorrow"). */
  | 'onPanelAccent'
  /** Outlined button on the night-violet panel (Welcome's "Sign in"). */
  | 'onPanelOutline'
  /** Light button on a solid teal card (Help's crisis line). */
  | 'onHelp';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** Stretches to the container's width (default) or hugs the label. */
  fullWidth?: boolean;
  /** A 44 pt pill that hugs its label, for an action inside a row. */
  small?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

type Look = {
  background: keyof Palette | 'transparent';
  text: keyof Palette;
  border?: keyof Palette;
};

const LOOKS: Record<ButtonVariant, Look> = {
  primary: { background: 'action', text: 'onAction' },
  secondary: { background: 'surface', text: 'action', border: 'border' },
  quiet: { background: 'transparent', text: 'action' },
  help: { background: 'help', text: 'surface' },
  destructive: { background: 'surface', text: 'danger', border: 'border' },
  onPanel: { background: 'onPanel', text: 'panel' },
  onPanelQuiet: { background: 'transparent', text: 'onPanel' },
  onPanelAccent: { background: 'transparent', text: 'onPanelAccent' },
  onPanelOutline: { background: 'transparent', text: 'onPanel', border: 'onPanelMuted' },
  onHelp: { background: 'surface', text: 'help' },
};

/** Labeled button, 54 pt tall (a touch target that is easy to hit when tired). */
export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  small = false,
  accessibilityHint,
  style,
}: ButtonProps) {
  const { palette } = useDesign();
  const look = LOOKS[variant];
  const inactive = disabled || loading;
  const textColor = palette[look.text];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={() => {
        haptics.lightImpact();
        onPress();
      }}
      style={[
        styles.button,
        !fullWidth && styles.hug,
        small && styles.small,
        {
          backgroundColor:
            look.background === 'transparent' ? 'transparent' : palette[look.background],
          borderColor: look.border ? palette[look.border] : 'transparent',
        },
        disabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={20} color={textColor} /> : null}
          {/* Two lines rather than "…" for long labels at large text sizes. */}
          <Text
            variant={small ? 'row' : 'strong'}
            color={textColor}
            numberOfLines={2}
            style={styles.label}>
            {title}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

type IconButtonProps = {
  icon: IconName;
  /** Read by screen readers ("Call Philippine Cancer Society, (02) 8508-7777"). */
  accessibilityLabel: string;
  onPress: () => void;
  /** `plain`: no background; `tinted`: lavender; `help`: teal tint for calling; `primary`: solid action. */
  look?: 'plain' | 'tinted' | 'help' | 'primary';
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** Round icon-only button, at least 44 pt. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  look = 'plain',
  size = 48,
  style,
}: IconButtonProps) {
  const { palette } = useDesign();
  const background =
    look === 'primary'
      ? palette.action
      : look === 'tinted'
        ? palette.raised
        : look === 'help'
          ? palette.helpTint
          : 'transparent';
  const color =
    look === 'primary' ? palette.onAction : look === 'help' ? palette.help : palette.action;
  // Saving a guide turns the button tinted; the fill fades in rather than appearing.
  const fill = useTransition('base', 'backgroundColor');
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={Math.max(0, (sizes.touch - size) / 2)}
      onPress={() => {
        haptics.lightImpact();
        onPress();
      }}
      style={[
        styles.iconButton,
        fill,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
        style,
      ]}>
      <Icon name={icon} size={Math.round(size * 0.44)} color={color} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: sizes.button,
    paddingHorizontal: space.xl,
    borderRadius: radii.control,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hug: { alignSelf: 'flex-start' },
  small: {
    alignSelf: 'center',
    minHeight: sizes.touch,
    paddingHorizontal: space.lg,
    borderRadius: radii.round,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  label: { flexShrink: 1, textAlign: 'center' },
  disabled: { opacity: 0.45 },
  iconButton: { alignItems: 'center', justifyContent: 'center' },
});
