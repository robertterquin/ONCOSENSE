import { useEffect, useId } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { haptics } from '@/lib/haptics';

import { decorative } from './a11y';

// The awareness ribbon drawn as one continuous line: the app's only illustration
// (next-step panel, welcome screen, awareness rows, a finished self-check).

const RIBBON = 'M62 248 L126 118 C146 76 146 34 100 34 C54 34 54 76 74 118 L138 248';
// A little longer than the path (about 480), so the dash hides all of it at the start.
const LENGTH = 520;
const DRAW_MS = 800;

const AnimatedPath = Animated.createAnimatedComponent(Path);

type RibbonMarkProps = {
  /** Height in points; width follows the ribbon's 200:260 shape. */
  height: number;
  color: string;
  /** Stroke width in the 200×260 drawing (thicker reads better small). */
  weight?: number;
  /** A thin highlight line along the middle of the ribbon. */
  highlight?: string;
  /** Top-left and bottom-right colors; the stroke fades between them instead of using `color`. */
  gradient?: [from: string, to: string];
  /** Traces the line in, then settles with a small pulse (shown whole with Reduce Motion). */
  draw?: boolean;
};

export function RibbonMark({
  height,
  color,
  weight = 20,
  highlight,
  gradient,
  draw = false,
}: RibbonMarkProps) {
  const gradientId = useId().replace(/:/g, '');
  const reduceMotion = useReducedMotion();
  const offset = useSharedValue(draw && !reduceMotion ? LENGTH : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!draw) return;
    // The tap lands as the line closes.
    const tap = setTimeout(haptics.success, reduceMotion ? 0 : DRAW_MS);
    if (reduceMotion) return () => clearTimeout(tap);
    offset.value = withTiming(0, {
      duration: DRAW_MS,
      easing: Easing.bezier(0.3, 0.7, 0.3, 1),
    });
    scale.value = withDelay(
      DRAW_MS,
      withSequence(withTiming(1.08, { duration: 160 }), withTiming(1, { duration: 200 })),
    );
    return () => clearTimeout(tap);
  }, [draw, reduceMotion, offset, scale]);

  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: offset.value }));
  const settle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const svg = (
    <Svg
      width={(height * 200) / 260}
      height={height}
      viewBox="0 0 200 260"
      fill="none"
      {...decorative}>
      {gradient ? (
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={gradient[0]} />
            <Stop offset="1" stopColor={gradient[1]} />
          </LinearGradient>
        </Defs>
      ) : null}
      <AnimatedPath
        d={RIBBON}
        stroke={gradient ? `url(#${gradientId})` : color}
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={draw ? [LENGTH, LENGTH] : undefined}
        animatedProps={draw ? lineProps : undefined}
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
  return draw ? <Animated.View style={settle}>{svg}</Animated.View> : svg;
}
