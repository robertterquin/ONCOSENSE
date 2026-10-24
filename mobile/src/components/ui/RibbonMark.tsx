import Svg, { Path } from 'react-native-svg';

import { decorative } from './a11y';

// The awareness ribbon drawn as one continuous line: the app's only illustration
// (next-step panel, welcome screen, awareness rows).

const RIBBON = 'M62 248 L126 118 C146 76 146 34 100 34 C54 34 54 76 74 118 L138 248';

type RibbonMarkProps = {
  /** Height in points; width follows the ribbon's 200:260 shape. */
  height: number;
  color: string;
  /** Stroke width in the 200×260 drawing (thicker reads better small). */
  weight?: number;
  /** A thin highlight line along the middle of the ribbon. */
  highlight?: string;
};

export function RibbonMark({ height, color, weight = 20, highlight }: RibbonMarkProps) {
  return (
    <Svg
      width={(height * 200) / 260}
      height={height}
      viewBox="0 0 200 260"
      fill="none"
      {...decorative}>
      <Path
        d={RIBBON}
        stroke={color}
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {highlight ? (
        <Path
          d={RIBBON}
          stroke={highlight}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
}
