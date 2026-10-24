import {
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_600SemiBold,
  AtkinsonHyperlegibleNext_800ExtraBold,
} from '@expo-google-fonts/atkinson-hyperlegible-next';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import type { TextStyle } from 'react-native';

// The Flutter app uses Google Fonts Poppins. Each weight is its own font family in
// React Native, so styles pick the family instead of setting `fontWeight`.
// The redesign's Atkinson Hyperlegible Next (type.ts) loads alongside it until every
// screen has moved over; Poppins is removed in redesign Phase 7.

/** Pass to `useFonts` at startup. */
export const fontAssets = {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_600SemiBold,
  AtkinsonHyperlegibleNext_800ExtraBold,
};

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

/** Text styles from AppTheme's TextTheme (colors come from the active color scheme). */
export const textVariants = {
  displayLarge: { fontFamily: fonts.bold, fontSize: 32 },
  displayMedium: { fontFamily: fonts.bold, fontSize: 28 },
  headlineMedium: { fontFamily: fonts.semiBold, fontSize: 24 },
  titleLarge: { fontFamily: fonts.semiBold, fontSize: 20 },
  titleMedium: { fontFamily: fonts.semiBold, fontSize: 16 },
  bodyLarge: { fontFamily: fonts.regular, fontSize: 16 },
  bodyMedium: { fontFamily: fonts.regular, fontSize: 14 },
  bodySmall: { fontFamily: fonts.regular, fontSize: 12 },
  label: { fontFamily: fonts.semiBold, fontSize: 14 },
  button: { fontFamily: fonts.semiBold, fontSize: 16 },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
