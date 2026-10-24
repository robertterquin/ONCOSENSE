import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import type { Palette } from '@/theme/palette';
import type { TypeVariant } from '@/theme/type';
import { useDesign } from '@/theme/useTheme';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  /** A palette token (`muted`, `action`, …) or a color. Defaults to `ink`. */
  tone?: keyof Palette;
  color?: string;
};

/** Atkinson Hyperlegible Next at the user's text size, in the active theme. */
export function Text({ variant = 'body', tone = 'ink', color, style, ...rest }: TextProps) {
  const { palette, type } = useDesign();
  return <RNText style={[type(variant), { color: color ?? palette[tone] }, style]} {...rest} />;
}
