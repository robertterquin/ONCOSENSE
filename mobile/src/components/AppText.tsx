import { Text, type TextProps } from 'react-native';

import { textVariants, type TextVariant } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  /** Defaults to the theme's text color. */
  color?: string;
  secondary?: boolean;
};

/** Text in Poppins with the theme's colors. */
export function AppText({
  variant = 'bodyMedium',
  color,
  secondary,
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        textVariants[variant],
        { color: color ?? (secondary ? colors.textSecondary : colors.text) },
        style,
      ]}
      {...rest}
    />
  );
}
