import type { ViewStyle } from 'react-native';
import { cubicBezier, Easing, useReducedMotion } from 'react-native-reanimated';

// Motion for the whole app (docs/design-refresh/12-phase-12-motion.md): short, calm, no
// bounce. A quick start that eases out slowly; presses 150 ms, controls 250 ms, content
// and progress 400 ms. With Reduce Motion, changes happen at once.

export const DURATION = { fast: 150, base: 250, slow: 400 } as const;

export const EASE = cubicBezier(0.2, 0, 0, 1);
/** The same curve for `withTiming`. */
export const EASE_FN = Easing.bezier(0.2, 0, 0, 1);

/**
 * Reanimated CSS-transition style for an `Animated` component: the listed style props
 * ease to their new value whenever they change.
 */
export function useTransition(
  speed: keyof typeof DURATION,
  property: keyof ViewStyle | (keyof ViewStyle)[],
): ViewStyle {
  const reduceMotion = useReducedMotion();
  // React Native's own ViewStyle types the easing as a string; Reanimated takes this object.
  return {
    transitionProperty: property,
    transitionDuration: reduceMotion ? 0 : DURATION[speed],
    transitionTimingFunction: EASE,
  } as unknown as ViewStyle;
}
