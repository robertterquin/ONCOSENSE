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

// How far the phone's own text size may enlarge text. At the largest accessibility sizes
// (about 3x) headings break mid-word, so they stop at 1.5x and other text at 2x.
const HEADINGS: TypeVariant[] = ['display', 'title', 'panel', 'heading', 'section'];
export const MAX_FONT_SCALE = 2;

/** Atkinson Hyperlegible Next at the user's text size, in the active theme. */
export function Text({ variant = 'body', tone = 'ink', color, style, ...rest }: TextProps) {
  const { palette, type } = useDesign();
  return (
    <RNText
      maxFontSizeMultiplier={HEADINGS.includes(variant) ? 1.5 : MAX_FONT_SCALE}
      style={[type(variant), { color: color ?? palette[tone] }, style]}
      {...rest}
    />
  );
}
