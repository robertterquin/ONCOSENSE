import Svg, { Circle, Path } from 'react-native-svg';

import { decorative } from './a11y';

// The five mood faces (option A, design refresh): a soft tinted disc with no outline,
// tired closed eyes for Rough and happy ones for Great. Drawn here rather than taken
// from Material, whose "very dissatisfied" face has crossed-out eyes.

const STROKE = { strokeWidth: 3.4, strokeLinecap: 'round', fill: 'none' } as const;

const eyes = (color: string) => (
  <>
    <Circle cx={14} cy={17} r={2.9} fill={color} />
    <Circle cx={26} cy={17} r={2.9} fill={color} />
  </>
);

const FEATURES: Record<string, (color: string) => React.ReactNode> = {
  'mood-rough': (color) => (
    <Path d="M10.5 17.5q3.5 2 7 0M22.5 17.5q3.5 2 7 0M14 29q6-5 12 0" stroke={color} {...STROKE} />
  ),
  'mood-low': (color) => (
    <>
      {eyes(color)}
      <Path d="M15 28q5-3 10 0" stroke={color} {...STROKE} />
    </>
  ),
  'mood-okay': (color) => (
    <>
      {eyes(color)}
      <Path d="M14.5 26.5h11" stroke={color} {...STROKE} />
    </>
  ),
  'mood-good': (color) => (
    <>
      {eyes(color)}
      <Path d="M13.5 24.5q6.5 5.5 13 0" stroke={color} {...STROKE} />
    </>
  ),
  'mood-great': (color) => (
    <>
      <Path d="M10.5 18q3.5-3.5 7 0M22.5 18q3.5-3.5 7 0" stroke={color} {...STROKE} />
      <Path d="M12.5 23h15q-1 7.5-7.5 7.5t-7.5-7.5z" fill={color} />
    </>
  ),
};

export const isMoodFace = (name: string) => name in FEATURES;

/** A mood face in one colour: the disc is that colour, faint; the features full. */
export function MoodFace({ name, size, color }: { name: string; size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" pointerEvents="none" {...decorative}>
      <Circle cx={20} cy={20} r={18} fill={color} opacity={0.3} />
      {FEATURES[name](color)}
    </Svg>
  );
}
