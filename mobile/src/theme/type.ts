import type { TextStyle } from 'react-native';

// Redesign type scale (docs/redesign/02-phase-2-foundations.md). One family, Atkinson
// Hyperlegible Next, built by the Braille Institute for low vision. Sizes are at the
// "Default" text size; `scaledType` applies the user's Large or Larger setting.

export const fontFamily = {
  regular: 'AtkinsonHyperlegibleNext_400Regular',
  semiBold: 'AtkinsonHyperlegibleNext_600SemiBold',
  extraBold: 'AtkinsonHyperlegibleNext_800ExtraBold',
} as const;

type TypeStyle = Required<Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight'>> &
  Pick<TextStyle, 'letterSpacing'>;

export const typeScale = {
  /** Detail screen titles (cancer type, guide). */
  display: { fontFamily: fontFamily.extraBold, fontSize: 34, lineHeight: 38, letterSpacing: -0.34 },
  /** Tab screen titles. */
  title: { fontFamily: fontFamily.extraBold, fontSize: 32, lineHeight: 37, letterSpacing: -0.32 },
  /** The next-step panel's title. */
  panel: { fontFamily: fontFamily.extraBold, fontSize: 28, lineHeight: 32 },
  /** Large section headings on detail screens. */
  heading: { fontFamily: fontFamily.extraBold, fontSize: 23, lineHeight: 28 },
  /** Section titles. */
  section: { fontFamily: fontFamily.extraBold, fontSize: 21, lineHeight: 26 },
  /** Long reading text (articles, guides). */
  reading: { fontFamily: fontFamily.regular, fontSize: 18, lineHeight: 28 },
  /** Row titles. */
  row: { fontFamily: fontFamily.semiBold, fontSize: 17, lineHeight: 23 },
  /** Short body text. */
  body: { fontFamily: fontFamily.regular, fontSize: 17, lineHeight: 25 },
  /** Emphasised body text and button labels. */
  strong: { fontFamily: fontFamily.extraBold, fontSize: 17, lineHeight: 23 },
  /** Secondary lines under titles. */
  supporting: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 21 },
  /** Small labels such as a topic or a tab name. */
  caption: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 19 },
} satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof typeScale;

export const TEXT_SIZES = { default: 1, large: 1.15, larger: 1.3 } as const;

export type TextSize = keyof typeof TEXT_SIZES;

/** A type style at the user's text size (line height grows with it). */
export function scaledType(variant: TypeVariant, size: TextSize): TextStyle {
  const style: TypeStyle = typeScale[variant];
  const factor = TEXT_SIZES[size];
  return {
    ...style,
    fontSize: Math.round(style.fontSize * factor),
    lineHeight: Math.round(style.lineHeight * factor),
  };
}
