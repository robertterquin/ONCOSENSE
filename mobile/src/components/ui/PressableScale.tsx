import { useState } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { useTransition } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = PressableProps & {
  /** `scale`: buttons and cards settle to 97%. `fade`: list rows dim, as iOS lists do. */
  feedback?: 'scale' | 'fade';
};

/** A Pressable whose pressed state eases in and out (150 ms) instead of blinking. */
export function PressableScale({
  feedback = 'scale',
  style,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);
  const transition = useTransition('fast', feedback === 'scale' ? 'transform' : 'opacity');
  const resolved = typeof style === 'function' ? style({ pressed, hovered: false }) : style;
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[
        resolved,
        transition,
        // A disabled control keeps its own dimmed opacity.
        rest.disabled
          ? null
          : feedback === 'scale'
            ? { transform: [{ scale: pressed ? 0.97 : 1 }] }
            : { opacity: pressed ? 0.6 : 1 },
      ]}
    />
  );
}
