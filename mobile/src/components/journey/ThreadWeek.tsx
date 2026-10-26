import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Section, Text } from '@/components/ui';
import { decorative } from '@/components/ui/a11y';
import { weekStrip, weekThreadText } from '@/lib/journey';
import { space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { JourneyEntry } from '@/types/journeyEntry';

// "This week" as the ribbon thread (docs/design-refresh/04-phase-4-journey.md): one
// line from Monday to Sunday with a knot per day. A filled knot with a check is a
// check-in; an outlined knot is a missed day; today is the larger ringed knot.

const HEIGHT = 64;
const MIDDLE = 32;
const WAVE = 20;
const EDGE = 16;
const LABEL_WIDTH = 56;

export function ThreadWeek({ entries, now }: { entries: JourneyEntry[]; now: Date }) {
  const { palette } = useDesign();
  const [width, setWidth] = useState(0);
  const days = weekStrip(entries, now);
  const today = days.findIndex((day) => day.isToday);
  const count = days.filter((day) => day.checkedIn).length;
  const step = (width - EDGE * 2) / 6;
  const x = (index: number) => EDGE + index * step;

  // One gentle wave per day, alternating up and down; the part after today is paler.
  const segment = (index: number) => {
    const y = MIDDLE + (index % 2 ? WAVE : -WAVE);
    return `M ${x(index)} ${MIDDLE} C ${x(index) + step * 0.4} ${y}, ${x(index + 1) - step * 0.4} ${y}, ${x(index + 1)} ${MIDDLE}`;
  };

  return (
    <Section title="This week" subtitle={`${count} of 7 days checked in`} divided={false}>
      <View
        accessible
        accessibilityLabel={weekThreadText(days)}
        style={styles.thread}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        <View style={styles.drawing} {...decorative}>
          {width ? (
            <Svg width={width} height={HEIGHT}>
              {days.slice(0, -1).map((day, index) => (
                <Path
                  key={`line-${day.label}`}
                  d={segment(index)}
                  stroke={index < today ? palette.action : palette.border}
                  strokeWidth={4}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
              {days.map((day, index) => {
                const cx = x(index);
                const future = index > today;
                return (
                  <Knot
                    key={day.label}
                    cx={cx}
                    checkedIn={day.checkedIn}
                    isToday={day.isToday}
                    future={future}
                  />
                );
              })}
            </Svg>
          ) : null}
        </View>
        <View style={styles.labels} {...decorative}>
          {width > 0 &&
            days.map((day, index) => (
              <Text
                key={day.label}
                variant="caption"
                tone={day.isToday ? 'action' : 'muted'}
                numberOfLines={1}
                style={[styles.label, { left: x(index) - LABEL_WIDTH / 2 }]}>
                {day.isToday ? 'Today' : day.label.charAt(0)}
              </Text>
            ))}
        </View>
      </View>
    </Section>
  );
}

function Knot({
  cx,
  checkedIn,
  isToday,
  future,
}: {
  cx: number;
  checkedIn: boolean;
  isToday: boolean;
  future: boolean;
}) {
  const { palette } = useDesign();
  const radius = isToday ? 14 : 11;
  const ring = isToday ? palette.action : future ? palette.line : palette.border;
  return (
    <>
      <Circle
        cx={cx}
        cy={MIDDLE}
        r={radius}
        fill={checkedIn ? palette.action : palette.surface}
        stroke={checkedIn && !isToday ? palette.action : ring}
        strokeWidth={isToday ? 3 : 2.5}
      />
      {checkedIn ? (
        <Path
          d={`M ${cx - 5} ${MIDDLE} L ${cx - 1.5} ${MIDDLE + 3.5} L ${cx + 5} ${MIDDLE - 4}`}
          stroke={palette.onAction}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  thread: { paddingTop: space.md, paddingBottom: space.lg },
  drawing: { height: HEIGHT },
  labels: { height: 22, marginTop: space.xs },
  label: { position: 'absolute', width: LABEL_WIDTH, textAlign: 'center' },
});
