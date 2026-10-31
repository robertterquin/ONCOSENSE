import Svg, { Path } from 'react-native-svg';

import { decorative } from './a11y';

// Liver and stomach, drawn to sit with Material Symbols at weight 500: Material has only
// "gastroenterology", which colorectal keeps, so these two no longer look the same.

const PATHS: Record<string, string[]> = {
  liver: [
    'M3.5 8.5C3.5 6 6 4.5 9 5c3 .4 5.5-.8 8-.8 2.2 0 3.5 1.2 3.5 3 0 3.3-3.6 5.8-7.4 7.8C10.5 16.3 8.6 19 7 19c-2 0-3.5-2.6-3.5-6.2Z',
    'M12.5 5.2c-.6 2.5-.4 5.3.6 8',
  ],
  stomach: [
    'M9 3v3.5c0 1.6 1.2 2.6 2.6 2.4 3.2-.4 7.4.6 7.4 5.1 0 3.9-3.3 6.5-7.3 6.5-3.6 0-6.2-2-6.2-4.5 0-1.9 1.4-3 3.1-3 1.4 0 2.2.7 3 1.5',
  ],
};

export const isOrganIcon = (name: string) => name in PATHS;

export function OrganIcon({ name, size, color }: { name: string; size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" pointerEvents="none" {...decorative}>
      {PATHS[name].map((d) => (
        <Path
          key={d}
          d={d}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </Svg>
  );
}
