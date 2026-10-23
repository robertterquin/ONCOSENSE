import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useCelebrateMilestone, useIncrementSession } from '@/hooks/useJourney';
import { averageMood, averagePain, moodTrend } from '@/lib/journey';
import { isSameDay } from '@/lib/dates';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import {
  journeyEntryFormattedDate,
  moodEmoji,
  moodLabel,
  type JourneyEntry,
} from '@/types/journeyEntry';
import { milestoneFormattedDate, type Milestone } from '@/types/milestone';
import { treatmentProgress, treatmentTypeLabel, type Treatment } from '@/types/treatment';

import { AppText } from '../AppText';
import { MaterialIcon } from '../MaterialIcon';

// Cards from journey_screen.dart.

const ORANGE = '#FF9800';
const AMBER = '#FFC107';
const BLUE = '#2196F3';
const GREEN = '#4CAF50';
const RED = '#F44336';
const PURPLE = '#9C27B0';

const MOOD_COLORS: Record<number, string> = {
  1: RED,
  2: ORANGE,
  3: '#FBC02D',
  4: '#8BC34A',
  5: GREEN,
};

function useMuted() {
  const { isDark } = useTheme();
  return isDark ? 'rgba(255,255,255,0.6)' : '#757575';
}

/** White (or dark) rounded card used throughout the journey screens. */
export function JourneyCard({ children, style }: { children: ReactNode; style?: object }) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? colors.card : brand.white },
        !isDark && styles.shadow,
        style,
      ]}>
      {children}
    </View>
  );
}

export function StatCard({
  icon,
  color,
  value,
  label,
}: {
  icon: string;
  color: string;
  value: number;
  label: string;
}) {
  const muted = useMuted();
  return (
    <JourneyCard style={styles.stat}>
      <MaterialIcon name={icon} size={28} color={color} />
      <AppText variant="headlineMedium" style={styles.bold}>
        {value}
      </AppText>
      <AppText variant="bodySmall" color={muted}>
        {label}
      </AppText>
    </JourneyCard>
  );
}

function SymptomChips({ symptoms }: { symptoms: string[] }) {
  return (
    <View style={styles.chips}>
      {symptoms.map((symptom) => (
        <View key={symptom} style={styles.symptom}>
          <AppText style={styles.symptomText}>{symptom}</AppText>
        </View>
      ))}
    </View>
  );
}

const editEntry = (entry: JourneyEntry) =>
  router.push({ pathname: '/journey/add-entry', params: { id: entry.id } });

export function TodayEntryCard({ entry }: { entry: JourneyEntry }) {
  const muted = useMuted();
  return (
    <JourneyCard style={styles.gap12}>
      <View style={styles.row}>
        <AppText style={styles.bigEmoji}>{moodEmoji(entry.moodLevel)}</AppText>
        <View style={styles.flex}>
          <AppText variant="titleMedium">Feeling {moodLabel(entry.moodLevel)}</AppText>
          <AppText variant="bodySmall" color={muted}>
            Pain: {entry.painLevel}/10 • Energy: {entry.energyLevel}/10
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit today's entry"
          hitSlop={8}
          onPress={() => editEntry(entry)}>
          <MaterialIcon name="edit" size={20} color={brand.headerPink} />
        </Pressable>
      </View>
      {entry.symptoms.length > 0 ? <SymptomChips symptoms={entry.symptoms.slice(0, 4)} /> : null}
    </JourneyCard>
  );
}

export function NoEntryCard() {
  const muted = useMuted();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Log today's check-in"
      onPress={() => router.push('/journey/add-entry')}>
      <JourneyCard style={[styles.row, styles.dashed]}>
        <View style={styles.pinkIcon}>
          <MaterialIcon name="add_circle_outline" size={28} color={brand.headerPink} />
        </View>
        <View style={styles.flex}>
          <AppText variant="titleMedium">How are you feeling today?</AppText>
          <AppText variant="bodySmall" color={muted}>
            Tap to log your daily check-in
          </AppText>
        </View>
        <MaterialIcon name="arrow_forward_ios" size={16} color={brand.headerPink} />
      </JourneyCard>
    </Pressable>
  );
}

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function WeeklyOverview({ entries }: { entries: JourneyEntry[] }) {
  const { colors, isDark } = useTheme();
  const muted = useMuted();
  const now = new Date();
  const trend = moodTrend(entries, 7, now);
  const loggedDays = trend.filter((point) => point.mood > 0).length;

  return (
    <JourneyCard style={styles.gap12}>
      <View style={styles.week}>
        {trend.map((point) => {
          const today = isSameDay(point.date, now);
          return (
            <View key={point.date.toDateString()} style={styles.day}>
              <AppText
                variant="bodySmall"
                color={today ? brand.headerPink : muted}
                style={styles.semiBold}>
                {WEEKDAY_LETTERS[point.date.getDay()]}
              </AppText>
              <View
                style={[
                  styles.dayCircle,
                  {
                    backgroundColor:
                      point.mood > 0
                        ? `${MOOD_COLORS[point.mood]}33`
                        : isDark
                          ? 'rgba(255,255,255,0.1)'
                          : '#F5F5F5',
                    borderColor: today ? brand.headerPink : 'transparent',
                  },
                ]}>
                <AppText style={point.mood > 0 ? styles.dayEmoji : { color: muted }}>
                  {point.mood > 0 ? moodEmoji(point.mood) : '—'}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      <View style={styles.overviewStats}>
        <OverviewStat
          label="Avg Mood"
          value={averageMood(entries, 7, now).toFixed(1)}
          suffix="/5"
          color={BLUE}
        />
        <OverviewStat
          label="Avg Pain"
          value={averagePain(entries, 7, now).toFixed(1)}
          suffix="/10"
          color={ORANGE}
        />
        <OverviewStat label="Entries" value={String(loggedDays)} suffix="/7" color={GREEN} />
      </View>
    </JourneyCard>
  );
}

function OverviewStat({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: string;
  suffix: string;
  color: string;
}) {
  const muted = useMuted();
  return (
    <View style={styles.overviewStat}>
      <AppText>
        <AppText variant="titleLarge" color={color} style={styles.bold}>
          {value}
        </AppText>
        <AppText variant="bodySmall" color={muted}>
          {suffix}
        </AppText>
      </AppText>
      <AppText variant="bodySmall" color={muted}>
        {label}
      </AppText>
    </View>
  );
}

export function JournalEntryCard({ entry }: { entry: JourneyEntry }) {
  const { isDark } = useTheme();
  const muted = useMuted();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Edit entry from ${journeyEntryFormattedDate(entry)}`}
      onPress={() => editEntry(entry)}>
      <JourneyCard style={styles.gap12}>
        <View style={styles.row}>
          <AppText style={styles.mediumEmoji}>{moodEmoji(entry.moodLevel)}</AppText>
          <View style={styles.flex}>
            <AppText variant="titleMedium">{journeyEntryFormattedDate(entry)}</AppText>
            <AppText variant="bodySmall" color={muted}>
              Mood: {moodLabel(entry.moodLevel)}
            </AppText>
          </View>
          {entry.hasAppointment ? (
            <View style={styles.appointment}>
              <MaterialIcon name="event" size={14} color={BLUE} />
              <AppText style={styles.appointmentText}>Appt</AppText>
            </View>
          ) : null}
        </View>
        <View style={styles.miniStats}>
          <MiniStat label="Pain" value={`${entry.painLevel}/10`} color={RED} />
          <MiniStat label="Energy" value={`${entry.energyLevel}/10`} color={GREEN} />
          <MiniStat label="Sleep" value={`${entry.sleepQuality}/5`} color={PURPLE} />
        </View>
        {entry.symptoms.length > 0 ? <SymptomChips symptoms={entry.symptoms} /> : null}
        {entry.notes ? (
          <AppText variant="bodySmall" color={isDark ? 'rgba(255,255,255,0.7)' : '#616161'}>
            {entry.notes}
          </AppText>
        ) : null}
      </JourneyCard>
    </Pressable>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  const muted = useMuted();
  return (
    <View>
      <AppText style={[styles.miniLabel, { color: muted }]}>{label}</AppText>
      <AppText variant="label" color={color}>
        {value}
      </AppText>
    </View>
  );
}

export function TreatmentProgressCard({ treatment }: { treatment: Treatment }) {
  const { isDark } = useTheme();
  const muted = useMuted();
  const increment = useIncrementSession();
  const progress = treatmentProgress(treatment);

  return (
    <JourneyCard style={styles.gap12}>
      <View style={styles.row}>
        <View style={styles.pinkIcon}>
          <MaterialIcon name="medical_services" size={24} color={brand.headerPink} />
        </View>
        <View style={styles.flex}>
          <AppText variant="titleMedium">{treatment.name}</AppText>
          <AppText variant="bodySmall" color={muted}>
            {treatmentTypeLabel(treatment.type)}
          </AppText>
        </View>
        {treatment.isActive ? (
          <View style={styles.active}>
            <AppText style={styles.activeText}>Active</AppText>
          </View>
        ) : null}
      </View>
      {treatment.totalSessions > 0 ? (
        <>
          <View style={styles.row}>
            <View style={styles.flex}>
              <AppText variant="bodySmall" color={muted}>
                Progress: {treatment.completedSessions}/{treatment.totalSessions} sessions
              </AppText>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#EEEEEE' },
                ]}
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
            <AppText variant="titleMedium" color={brand.headerPink} style={styles.bold}>
              {Math.trunc(progress)}%
            </AppText>
          </View>
          {treatment.completedSessions < treatment.totalSessions ? (
            <Pressable
              accessibilityRole="button"
              disabled={increment.isPending}
              onPress={() =>
                increment.increment(treatment, {
                  onError: (error) => showToast(`Error: ${error.message}`, 'error'),
                })
              }
              style={[styles.sessionButton, increment.isPending && styles.dimmed]}>
              <MaterialIcon name="check" size={18} color={brand.headerPink} />
              <AppText variant="label" color={brand.headerPink}>
                Complete Session
              </AppText>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </JourneyCard>
  );
}

export function MilestoneCard({
  milestone,
  compact = false,
}: {
  milestone: Milestone;
  compact?: boolean;
}) {
  const muted = useMuted();
  const celebrate = useCelebrateMilestone();
  return (
    <JourneyCard
      style={[
        styles.row,
        !milestone.isCelebrated && styles.uncelebrated,
        compact && styles.compact,
      ]}>
      <View style={[styles.trophy, compact && styles.trophyCompact]}>
        <MaterialIcon name="emoji_events" size={compact ? 20 : 28} color="#FFA000" />
      </View>
      <View style={styles.flex}>
        <AppText variant={compact ? 'label' : 'titleMedium'}>{milestone.title}</AppText>
        {!compact ? (
          <AppText variant="bodySmall" color={muted}>
            {milestone.description}
          </AppText>
        ) : null}
        <AppText style={[styles.miniLabel, { color: muted }]}>
          {milestoneFormattedDate(milestone)}
        </AppText>
      </View>
      {!milestone.isCelebrated && !compact ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Celebrate milestone"
          hitSlop={8}
          onPress={() =>
            celebrate.mutate(milestone, {
              onSuccess: () => showToast('🎉 Celebrated!', 'success'),
              onError: (error) => showToast(`Error: ${error.message}`, 'error'),
            })
          }>
          <MaterialIcon name="celebration" size={24} color={AMBER} />
        </Pressable>
      ) : null}
    </JourneyCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontFamily: 'Poppins_700Bold' },
  semiBold: { fontFamily: 'Poppins_600SemiBold' },
  dimmed: { opacity: 0.6 },
  gap12: { gap: 12 },
  card: { borderRadius: radius.large, padding: 16 },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 16 },
  bigEmoji: { fontSize: 32, lineHeight: 40 },
  mediumEmoji: { fontSize: 28, lineHeight: 36 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  symptom: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,152,0,0.1)',
  },
  symptomText: { fontSize: 11, color: '#E65100', fontFamily: 'Poppins_500Medium' },
  dashed: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(216,27,96,0.3)' },
  pinkIcon: { padding: 10, borderRadius: 12, backgroundColor: 'rgba(216,27,96,0.1)' },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 8 },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayEmoji: { fontSize: 18, lineHeight: 24 },
  divider: { height: 1 },
  overviewStats: { flexDirection: 'row', justifyContent: 'space-around' },
  overviewStat: { alignItems: 'center' },
  appointment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(33,150,243,0.1)',
  },
  appointmentText: { fontSize: 11, color: BLUE, fontFamily: 'Poppins_600SemiBold' },
  miniStats: { flexDirection: 'row', gap: 16 },
  miniLabel: { fontSize: 11 },
  active: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  activeText: { fontSize: 11, color: GREEN, fontFamily: 'Poppins_600SemiBold' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: brand.headerPink },
  sessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: brand.headerPink,
  },
  uncelebrated: { borderWidth: 1, borderColor: 'rgba(255,193,7,0.5)' },
  compact: { paddingVertical: 12 },
  trophy: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,193,7,0.2)' },
  trophyCompact: { padding: 8 },
});
