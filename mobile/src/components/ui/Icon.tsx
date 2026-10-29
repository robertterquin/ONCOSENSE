import Svg, { Path } from 'react-native-svg';

import type { Palette } from '@/theme/palette';
import { useDesign } from '@/theme/useTheme';

import { decorative } from './a11y';
import { MATERIAL_ICONS, MATERIAL_ICONS_BOLD } from './materialIcons';

// Every icon in the app is Material Symbols Rounded, one family throughout. To add one,
// name it in scripts/material-icons.mjs and run the script (it explains how).

export type IconName = keyof typeof MATERIAL_ICONS;

export const ICON_NAMES = Object.keys(MATERIAL_ICONS) as IconName[];

type IconProps = {
  name: IconName;
  size?: number;
  /** A palette token or a color. Defaults to `ink`. */
  tone?: keyof Palette;
  color?: string;
  /** Heavier weight, for small ticks and pluses (only where the script ships one). */
  bold?: boolean;
};

/** A decorative icon (hidden from screen readers; label the control that holds it). */
export function Icon({ name, size = 22, tone = 'ink', color, bold = false }: IconProps) {
  const { palette } = useDesign();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      // On iOS an SVG catches touches, so a tap on the icon wouldn't reach its button.
      pointerEvents="none"
      {...decorative}>
      <Path
        d={(bold && MATERIAL_ICONS_BOLD[name]) || MATERIAL_ICONS[name]}
        fill={color ?? palette[tone]}
      />
    </Svg>
  );
}
