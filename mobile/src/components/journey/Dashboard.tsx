import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Icon,
  IconButton,
  ListRow,
  ProgressSegments,
  Section,
  Text,
} from '@/components/ui';
import { decorative } from '@/components/ui/a11y';
import { useCelebrateMilestone, useIncrementSession } from '@/hooks/useJourney';
import { formatShortDate, formatTime } from '@/lib/dates';
import { lastSevenDays, weekStrip, weekSummaryText, type WeekSummary } from '@/lib/journey';
import { MOODS } from '@/lib/journeyLabels';
import { showToast } from '@/stores/toastStore';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { Appointment } from '@/types/appointment';
import type { JourneyEntry } from '@/types/journeyEntry';
import type { Milestone } from '@/types/milestone';
import { treatmentTypeLabel, type Treatment } from '@/types/treatment';

// The Journey dashboard's sections (docs/redesign/04-phase-4-journey.md).

const editEntry = (id: string) => router.push({ pathname: '/journey/check-in', params: { id } });

/** Monday to Sunday; days with a check-in show a check, today has a ring. */
export function ThisWeek({ entries, now }: { entries: JourneyEntry[]; now: Date }) {
  const { palette } = useDesign();
  const days = weekStrip(entries, now);
  const count = days.filter((day) => day.checkedIn).length;
  return (
    <Section title="This week" subtitle={`${count} of 7 days checked in`} divided={false}>
      <View style={styles.week}>
        {days.map((day) => (
          <View
            key={day.label}
            style={styles.day}
            accessible
            accessibilityLabel={`${day.label}${day.isToday ? ', today' : ''}, ${
              day.checkedIn ? 'checked in' : 'no check-in'
            }`}>
            <Text variant="caption" tone={day.isToday ? 'action' : 'muted'}>
              {day.label}
            </Text>
            <View
              style={[
                styles.dayMark,
                day.checkedIn
                  ? { backgroundColor: palette.action }
                  : { backgroundColor: palette.ground },
                day.isToday && { borderWidth: 2.5, borderColor: palette.action },
              ]}>
              {day.checkedIn ? (
                <Icon name="check" size={16} tone="onAction" strokeWidth={3} />
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </Section>
  );
}

/** Paired bars for energy and pain over the last 7 days, with the numbers in words. */
export function EnergyAndPain({ entries, now }: { entries: JourneyEntry[]; now: Date }) {
  const summary = lastSevenDays(entries, now);
  return (
    <Section title="Energy and pain" subtitle="Last 7 days, 0 to 10" divided={false}>
      <View style={styles.chartBlock}>
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

const CHART_HEIGHT = 96;

function Chart({ summary }: { summary: WeekSummary }) {
  const { palette } = useDesign();
  const bar = (value: number | null, color: string) => (
    <View
      style={[
        styles.bar,
        {
          height: value === null ? 3 : Math.max(3, (value / 10) * CHART_HEIGHT),
          backgroundColor: value === null ? palette.line : color,
        },
      ]}
    />
  );
  return (
    <View {...decorative}>
      <View style={styles.legend}>
        <LegendDot color={palette.action} label="Energy" />
        <LegendDot color={palette.chartPain} label="Pain" />
      </View>
      <View style={[styles.chart, { borderBottomColor: palette.line }]}>
        {summary.days.map((day) => (
          <View key={day.date.toDateString()} style={styles.chartDay}>
            <View style={styles.bars}>
              {bar(day.energy, palette.action)}
              {bar(day.pain, palette.chartPain)}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.chartLabels}>
        {summary.days.map((day) => (
          <Text
            key={day.date.toDateString()}
            variant="caption"
            tone="muted"
            style={styles.chartDay}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'][day.date.getDay()]}
          </Text>
        ))}
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
        icon="pill"
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
              fullWidth={false}
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
                    onSuccess: () => showToast('Celebrated!', 'success'),
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
            title={`${mood?.emoji ?? ''} ${mood?.label ?? 'Check-in'}`.trim()}
            subtitle={`${formatShortDate(entry.date)} · pain ${entry.painLevel}, energy ${entry.energyLevel}`}
            onPress={() => editEntry(entry.id)}
          />
        );
      })}
    </Section>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  week: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.lg },
  day: { alignItems: 'center', gap: space.xs, flex: 1 },
  dayMark: {
    width: 34,
    height: 34,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartBlock: { gap: space.md, paddingVertical: space.lg },
  legend: { flexDirection: 'row', gap: space.lg, paddingBottom: space.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
  },
  chartDay: { flex: 1, alignItems: 'center', textAlign: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 10, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLabels: { flexDirection: 'row', paddingTop: space.xs },
  treatment: { paddingBottom: space.sm },
  treatmentProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingBottom: space.sm,
  },
});
