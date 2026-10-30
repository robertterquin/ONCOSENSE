import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { DURATION, useTransition } from '@/theme/motion';
import type { Palette } from '@/theme/palette';
import { space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Icon } from './Icon';
import { decorative } from './a11y';
import { Text } from './Text';

type ProgressSegmentsProps = {
  total: number;
  done: number;
  /** Filled color. */
  tone?: keyof Palette;
  /** "Treatment cycles", "Self-check steps". */
  accessibilityLabel: string;
};

/** A row of segments, one per step or cycle. */
export function ProgressSegments({
  total,
  done,
  tone = 'action',
  accessibilityLabel,
}: ProgressSegmentsProps) {
  const { palette } = useDesign();
  const fill = useTransition('slow', 'backgroundColor');
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: total, now: done, text: `${done} of ${total}` }}
      style={styles.segments}>
      {Array.from({ length: total }, (_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.segment,
            fill,
            { backgroundColor: index < done ? palette[tone] : palette.raised },
          ]}
        />
      ))}
    </View>
  );
}

type Step = { title: string };

type StepListProps = {
  steps: Step[];
  /** Index of the step being shown; earlier steps count as done. */
  current: number;
  /** Detail for the current step (text, warning signs, an illustration). */
  children?: ReactNode;
};

// Moving to the next step: rows slide to their new heights and the new detail fades in.
const STEP_LAYOUT = LinearTransition.duration(DURATION.base);
const STEP_DETAIL = FadeIn.duration(DURATION.base);

/**
 * Numbered steps joined by a line: done steps show a check, the current one is
 * expanded with `children`, the rest are one-line titles.
 */
export function StepList({ steps, current, children }: StepListProps) {
  const { palette } = useDesign();
  const fill = useTransition('base', 'backgroundColor');
  return (
    <View accessibilityRole="list">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const last = index === steps.length - 1;
        const state = done ? 'done' : active ? 'current step' : 'not started';
        return (
          <Animated.View key={index} layout={STEP_LAYOUT} style={styles.step}>
            <View style={styles.rail} {...decorative}>
              <Animated.View
                style={[
                  styles.marker,
                  fill,
                  done && { backgroundColor: palette.action },
                  active && { backgroundColor: palette.panel },
                  !done &&
                    !active && {
                      backgroundColor: 'transparent',
                      borderWidth: 2,
                      borderColor: palette.border,
                    },
                ]}>
                {done ? (
                  <Icon name="check" size={18} color={palette.onAction} bold />
                ) : (
                  <Text variant="strong" color={active ? '#FFFFFF' : palette.muted}>
                    {String(index + 1)}
                  </Text>
                )}
              </Animated.View>
              {last ? null : (
                <Animated.View
                  style={[
                    styles.line,
                    fill,
                    { backgroundColor: done ? palette.action : palette.raised },
                  ]}
                />
              )}
            </View>
            <View style={[styles.stepBody, active && styles.stepBodyActive]}>
              <Text
                variant={active ? 'heading' : 'row'}
                tone={done ? 'muted' : 'ink'}
                accessibilityLabel={`Step ${index + 1} of ${steps.length}, ${state}: ${step.title}`}>
                {step.title}
              </Text>
              {active ? <Animated.View entering={STEP_DETAIL}>{children}</Animated.View> : null}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segments: { flexDirection: 'row', gap: space.xs },
  segment: { flex: 1, height: 8, borderRadius: 4 },
  step: { flexDirection: 'row', gap: space.md + 2 },
  rail: { width: 40, alignItems: 'center' },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, width: 3, minHeight: 18 },
  stepBody: { flex: 1, paddingTop: space.sm - 2, paddingBottom: space.lg + 2, gap: space.md },
  stepBodyActive: { paddingTop: space.xs, paddingBottom: space.xxl },
});
