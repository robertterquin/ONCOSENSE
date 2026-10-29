import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import {
  Button,
  IconButton,
  ListRow,
  ProgressSegments,
  Section,
  StatTile,
  Text,
} from '@/components/ui';
import { haptics } from '@/lib/haptics';
import { useCelebrateMilestone, useIncrementSession } from '@/hooks/useJourney';
import { formatShortDate, formatTime } from '@/lib/dates';
import { lastSevenDays, sevenDayTrend, weekSummaryText, type WeekSummary } from '@/lib/journey';
import { MOODS } from '@/lib/journeyLabels';
import { showToast } from '@/stores/toastStore';
import { elevation } from '@/theme/elevation';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { Appointment } from '@/types/appointment';
import type { JourneyEntry } from '@/types/journeyEntry';
import type { Milestone } from '@/types/milestone';
import { iconForTreatment, treatmentTypeLabel, type Treatment } from '@/types/treatment';

// The Journey dashboard's sections (docs/redesign/04-phase-4-journey.md).

const editEntry = (id: string) => router.push({ pathname: '/journey/check-in', params: { id } });

/**
 * Paired bars for energy and pain over the last 7 days, with a dashed line at each
 * week's average, today's column tinted, and the numbers in words.
 */
export function EnergyAndPain({ entries, now }: { entries: JourneyEntry[]; now: Date }) {
  const { palette, isDark } = useDesign();
  const summary = lastSevenDays(entries, now);
  const energy = sevenDayTrend(entries, 'averageEnergy', now);
  const pain = sevenDayTrend(entries, 'averagePain', now);
  return (
    <Section title="Energy and pain" subtitle="Last 7 days, 0 to 10" look="plain">
      <View style={styles.tiles}>
        <StatTile
          label="Energy, 7 days"
          value={energy.value === null ? '–' : String(energy.value)}
          detail={energy.detail}
        />
        <StatTile
          label="Pain, 7 days"
          value={pain.value === null ? '–' : String(pain.value)}
          detail={pain.detail}
          valueTone="rose"
        />
      </View>
      <View
        style={[
          styles.chartBlock,
          { backgroundColor: palette.surface },
          elevation('resting', palette, isDark),
        ]}>
        <Chart summary={summary} />
        <Text variant="supporting">{weekSummaryText(summary)}</Text>
        {summary.topSymptoms.length ? (
          <Text variant="supporting" tone="muted">
            Most common symptoms:{' '}
            {summary.topSymptoms.map(([name, count]) => `${name} (${count})`).join(', ')}
          </Text>
        ) : null}
      </View>
    </Section>
  );
}

const CHART_HEIGHT = 120;
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function Chart({ summary }: { summary: WeekSummary }) {
  const { palette } = useDesign();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const selectedDay = selectedDayIndex !== null ? summary.days[selectedDayIndex] : null;

  const bar = (value: number | null, color: string) => (
    <View
      style={[
        styles.bar,
        {
          height: value === null ? 4 : Math.max(4, (value / 10) * CHART_HEIGHT),
          backgroundColor: value === null ? palette.line : color,
        },
      ]}
    />
  );
  return (
    <View>
      <View style={styles.chartHeader}>
        <View style={styles.legend}>
          <LegendDot color={palette.action} label="Energy" />
          <LegendDot color={palette.chartPain} label="Pain" />
        </View>
        <Text variant="caption" tone="muted">
          Tap a bar to inspect
        </Text>
      </View>

      {selectedDay ? (
        <View
          style={[
            styles.dayInspector,
            { backgroundColor: palette.raised, borderColor: palette.line },
          ]}>
          <View style={styles.inspectorTop}>
            <Text variant="strong">{formatShortDate(selectedDay.date)}</Text>
            <View style={styles.inspectorScores}>
              <View style={styles.inspectorBadge}>
                <View style={[styles.miniDot, { backgroundColor: palette.action }]} />
                <Text variant="caption">
                  {selectedDay.energy !== null ? `Energy ${selectedDay.energy}/10` : 'No energy'}
                </Text>
              </View>
              <View style={styles.inspectorBadge}>
                <View style={[styles.miniDot, { backgroundColor: palette.chartPain }]} />
                <Text variant="caption">
                  {selectedDay.pain !== null ? `Pain ${selectedDay.pain}/10` : 'No pain'}
                </Text>
              </View>
            </View>
          </View>
          {selectedDay.entry?.symptoms?.length ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              Symptoms: {selectedDay.entry.symptoms.join(', ')}
            </Text>
          ) : selectedDay.energy === null && selectedDay.pain === null ? (
            <Text variant="caption" tone="muted">
              No check-in recorded for this day
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.chart, { borderBottomColor: palette.line }]}>
        {summary.days.map((day, index) => {
          const isSelected = selectedDayIndex === index;
          const isToday = index === summary.days.length - 1;
          return (
            <Pressable
              key={day.date.toDateString()}
              accessibilityRole="button"
              accessibilityLabel={`${formatShortDate(day.date)}: Energy ${day.energy ?? 'none'}, Pain ${day.pain ?? 'none'}`}
              onPress={() => {
                haptics.selection();
                setSelectedDayIndex(isSelected ? null : index);
              }}
              style={[
                styles.chartDay,
                styles.chartColumn,
                isToday && { backgroundColor: palette.raised },
                isSelected && { borderColor: palette.action },
              ]}>
              <View style={styles.bars}>
                {bar(day.energy, palette.action)}
                {bar(day.pain, palette.chartPain)}
              </View>
            </Pressable>
          );
        })}
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
          {(
            [
              [summary.averageEnergy, palette.action],
              [summary.averagePain, palette.chartPain],
            ] as const
          ).map(([average, color]) => {
            if (average === null) return null;
            const y = CHART_HEIGHT - (average / 10) * CHART_HEIGHT;
            return (
              <Line
                key={color}
                x1="0"
                x2="100%"
                y1={y}
                y2={y}
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                opacity={0.6}
              />
            );
          })}
        </Svg>
      </View>
      <View style={styles.chartLabels}>
        {summary.days.map((day, index) => {
          const isToday = index === summary.days.length - 1;
          const isSelected = selectedDayIndex === index;
          return (
            <Text
              key={day.date.toDateString()}
              variant="supporting"
              tone={isToday || isSelected ? 'ink' : 'muted'}
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.chartDay, (isToday || isSelected) && styles.selectedDayLabel]}>
              {isToday ? 'Today' : DAY_LETTERS[day.date.getDay()]}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text variant="caption">{label}</Text>
    </View>
  );
}

/** Next appointments, soonest first. */
export function ComingUp({ appointments }: { appointments: Appointment[] }) {
  return (
    <Section
      title="Coming up"
      action={
        <IconButton
          icon="plus"
          look="tinted"
          accessibilityLabel="Add an appointment"
          onPress={() => router.push('/journey/appointment')}
        />
      }>
      {appointments.length ? (
        appointments
          .slice(0, 3)
          .map((appointment) => (
            <ListRow
              key={appointment.id}
              icon="calendar"
              iconTone="sun"
              title={appointment.title}
              subtitle={`${formatShortDate(appointment.startsAt)}, ${formatTime(appointment.startsAt)}${
                appointment.location ? ` · ${appointment.location}` : ''
              }`}
              onPress={() =>
                router.push({ pathname: '/journey/appointment', params: { id: appointment.id } })
              }
            />
          ))
      ) : (
        <ListRow
          title="No appointments yet"
          subtitle="Add one and we'll remind you the evening before"
          titleTone="muted"
        />
      )}
    </Section>
  );
}

export function Treatments({ treatments }: { treatments: Treatment[] }) {
  return (
    <Section
      title="Treatments"
      action={
        <IconButton
          icon="plus"
          look="tinted"
          accessibilityLabel="Add a treatment"
          onPress={() => router.push('/journey/treatment')}
        />
      }>
      {treatments.length ? (
        treatments.map((treatment) => <TreatmentRow key={treatment.id} treatment={treatment} />)
      ) : (
        <ListRow
          title="No treatments yet"
          subtitle="Add one to follow your sessions"
          titleTone="muted"
        />
      )}
    </Section>
  );
}

function TreatmentRow({ treatment }: { treatment: Treatment }) {
  const increment = useIncrementSession();
  const { completedSessions: done, totalSessions: total } = treatment;
  const status = !treatment.isActive
    ? 'Finished'
    : total
      ? `${done} of ${total} sessions`
      : 'In progress';
  const canAdd = treatment.isActive && total > 0 && done < total;
  return (
    <View style={styles.treatment}>
      <ListRow
        icon={iconForTreatment(treatment.type)}
        iconTone="sun"
        title={treatment.name}
        subtitle={`${treatmentTypeLabel(treatment.type)} · ${status}`}
        onPress={() =>
          router.push({ pathname: '/journey/treatment', params: { id: treatment.id } })
        }
      />
      {total > 0 ? (
        <View style={styles.treatmentProgress}>
          <View style={styles.flex}>
            <ProgressSegments
              total={Math.min(total, 12)}
              done={Math.round((Math.min(done, total) / total) * Math.min(total, 12))}
              accessibilityLabel={`${treatment.name}: ${done} of ${total} sessions`}
            />
          </View>
          {canAdd ? (
            <Button
              title="+1 session"
              variant="secondary"
              small
              loading={increment.isPending}
              onPress={() =>
                increment.increment(treatment, {
                  onSuccess: () => showToast(`Session ${done + 1} of ${total} logged`, 'success'),
                  onError: (error) => showToast(error.message, 'error'),
                })
              }
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function Milestones({ milestones }: { milestones: Milestone[] }) {
  const celebrate = useCelebrateMilestone();
  if (!milestones.length) return null;
  return (
    <Section title="Milestones">
      {milestones.slice(0, 5).map((milestone) => (
        <ListRow
          key={milestone.id}
          icon="flag"
          iconTone="sun"
          title={milestone.title}
          subtitle={formatShortDate(milestone.dateAchieved)}
          accessory={
            milestone.isCelebrated ? undefined : (
              <IconButton
                icon="heart"
                accessibilityLabel={`Celebrate ${milestone.title}`}
                onPress={() =>
                  celebrate.mutate(milestone, {
                    onSuccess: () => showToast('Milestone celebrated', 'success'),
                    onError: (error) => showToast(error.message, 'error'),
                  })
                }
              />
            )
          }
        />
      ))}
    </Section>
  );
}

/** The last few check-ins, to look back or fix one. */
export function RecentCheckIns({ entries }: { entries: JourneyEntry[] }) {
  if (!entries.length) return null;
  return (
    <Section title="Recent check-ins">
      {entries.slice(0, 5).map((entry) => {
        const mood = MOODS.find((m) => m.value === entry.moodLevel);
        return (
          <ListRow
            key={entry.id}
            icon={mood?.icon ?? 'activity'}
            iconTone={mood?.tone}
            title={mood?.label ?? 'Check-in'}
            // Two lines, so a number never ends up alone on the next line.
            subtitle={`${formatShortDate(entry.date)}\nPain ${entry.painLevel}, energy ${entry.energyLevel}`}
            onPress={() => editEntry(entry.id)}
          />
        );
      })}
    </Section>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tiles: { flexDirection: 'row', gap: space.sm },
  chartBlock: { gap: space.md, padding: space.lg, borderRadius: radii.section },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: space.xs,
  },
  legend: { flexDirection: 'row', gap: space.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  dayInspector: {
    padding: space.sm + 2,
    borderRadius: radii.control,
    borderWidth: 1,
    marginBottom: space.sm,
    gap: 4,
  },
  inspectorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inspectorScores: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'center',
  },
  inspectorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    borderBottomWidth: 1,
  },
  chartDay: { flex: 1, alignItems: 'center', textAlign: 'center' },
  // Full height, so today's tint and the selected outline fill the column.
  chartColumn: {
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: radii.control,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedDayLabel: {
    fontWeight: '700',
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  bar: { width: 14, borderTopLeftRadius: 7, borderTopRightRadius: 7 },
  chartLabels: { flexDirection: 'row', paddingTop: space.xs },
  treatment: { paddingBottom: space.sm },
  treatmentProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingBottom: space.sm,
  },
});
