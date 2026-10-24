import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { AddToJourneySheet } from '@/components/journey/AddToJourneySheet';
import {
  JournalEntryCard,
  MilestoneCard,
  NoEntryCard,
  StatCard,
  TodayEntryCard,
  TreatmentProgressCard,
  WeeklyOverview,
} from '@/components/journey/JourneyCards';
import { JourneySetupFlow } from '@/components/journey/JourneySetupFlow';
import { MaterialIcon } from '@/components/MaterialIcon';
import { TAB_BAR_CLEARANCE } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import {
  useJourneyEntries,
  useJourneySetup,
  useMilestones,
  useTreatments,
} from '@/hooks/useJourney';
import { currentStreak, daysSince, entryForDate } from '@/lib/journey';
import { useIsSignedIn } from '@/stores/authStore';
import { brand, gradients } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

// Port of lib/screens/journey/journey_screen.dart

const TABS = ['Dashboard', 'Journal', 'Treatment', 'Milestones'] as const;
type Tab = (typeof TABS)[number];

export default function JourneyTab() {
  const signedIn = useIsSignedIn();
  const { journeyStarted } = useJourneySetup();
  const { colors } = useTheme();

  if (!signedIn) {
    // Guests have no account to save a journey to.
    return (
      <View style={[styles.fill, styles.centered, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="auto_graph"
          title="Track your journey"
          message="Sign in to log how you feel, track treatments and celebrate milestones."
        />
        <Button title="Sign in" onPress={() => router.push('/login')} style={styles.signIn} />
      </View>
    );
  }
  if (!journeyStarted) return <JourneySetupFlow mode="setup" />;
  return <JourneyTracker />;
}

function JourneyTracker() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { cancerFreeDate } = useJourneySetup();
  const entries = useJourneyEntries();
  const treatments = useTreatments();
  const milestones = useMilestones();
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [adding, setAdding] = useState(false);

  const loading = entries.isPending || treatments.isPending || milestones.isPending;
  // Offline or a failed request: say so instead of showing an empty journey.
  const failed = [entries, treatments, milestones].some((query) => query.isError && !query.data);
  const refreshing = entries.isRefetching || treatments.isRefetching || milestones.isRefetching;
  const refresh = () => {
    entries.refetch();
    treatments.refetch();
    milestones.refetch();
  };

  const entryList = entries.data ?? [];
  const treatmentList = treatments.data ?? [];
  const milestoneList = milestones.data ?? [];

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <MaterialIcon name="auto_graph" size={28} color={brand.white} />
          <AppText variant="titleLarge" color={brand.white} style={[styles.flex, styles.bold]}>
            My Journey
          </AppText>
          {cancerFreeDate ? (
            <View style={styles.daysFree}>
              <MaterialIcon name="celebration" size={16} color={brand.white} />
              <AppText variant="bodySmall" color={brand.white} style={styles.semiBold}>
                {daysSince(cancerFreeDate)} days free
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText variant="bodySmall" color="rgba(255,255,255,0.9)">
          Track your progress, celebrate milestones
        </AppText>
        <View style={styles.tabs} accessibilityRole="tablist">
          {TABS.map((name) => {
            const selected = tab === name;
            return (
              <Pressable
                key={name}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setTab(name)}
                style={[styles.tab, selected && styles.tabSelected]}>
                <AppText
                  numberOfLines={1}
                  style={[styles.tabText, { color: selected ? brand.headerPink : brand.white }]}>
                  {name}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: TAB_BAR_CLEARANCE + 60 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={brand.primaryPink}
            colors={[brand.primaryPink]}
          />
        }>
        {loading ? (
          <LoadingState />
        ) : failed ? (
          <ErrorState
            message="Couldn't load your journey. Check your connection and try again."
            onRetry={refresh}
          />
        ) : tab === 'Dashboard' ? (
          <>
            <View style={styles.stats}>
              <StatCard
                icon="local_fire_department"
                color="#FF9800"
                value={currentStreak(entryList)}
                label="Day Streak"
              />
              <StatCard
                icon="emoji_events"
                color="#FFC107"
                value={milestoneList.length}
                label="Milestones"
              />
              <StatCard icon="edit_note" color="#2196F3" value={entryList.length} label="Entries" />
            </View>
            <Section title="Today's Check-in">
              {(() => {
                const today = entryForDate(entryList, new Date());
                return today ? <TodayEntryCard entry={today} /> : <NoEntryCard />;
              })()}
            </Section>
            <Section title="Weekly Overview">
              <WeeklyOverview entries={entryList} />
            </Section>
            {treatmentList.some((t) => t.isActive) ? (
              <Section title="Active Treatments">
                {treatmentList
                  .filter((t) => t.isActive)
                  .slice(0, 2)
                  .map((treatment) => (
                    <TreatmentProgressCard key={treatment.id} treatment={treatment} />
                  ))}
              </Section>
            ) : null}
            {milestoneList.length > 0 ? (
              <Section title="Recent Milestones">
                {milestoneList.slice(0, 3).map((milestone) => (
                  <MilestoneCard key={milestone.id} milestone={milestone} compact />
                ))}
              </Section>
            ) : null}
          </>
        ) : tab === 'Journal' ? (
          entryList.length === 0 ? (
            <Empty
              icon="edit_note"
              title="No journal entries yet"
              message="Start tracking your daily progress"
              action="Add First Entry"
              onPress={() => router.push('/journey/check-in')}
            />
          ) : (
            entryList.map((entry) => <JournalEntryCard key={entry.id} entry={entry} />)
          )
        ) : tab === 'Treatment' ? (
          treatmentList.length === 0 ? (
            <Empty
              icon="medical_services"
              title="No treatments added"
              message="Track your treatment progress here"
              action="Add Treatment"
              onPress={() => router.push('/journey/treatment')}
            />
          ) : (
            treatmentList.map((treatment) => (
              <TreatmentProgressCard key={treatment.id} treatment={treatment} />
            ))
          )
        ) : milestoneList.length === 0 ? (
          <Empty
            icon="emoji_events"
            title="No milestones yet"
            message="Keep tracking to unlock achievements!"
          />
        ) : (
          milestoneList.map((milestone) => (
            <MilestoneCard key={milestone.id} milestone={milestone} />
          ))
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add to journey"
        onPress={() => setAdding(true)}
        style={[styles.fab, { bottom: TAB_BAR_CLEARANCE + insets.bottom }]}>
        <LinearGradient
          colors={[brand.headerPink, brand.darkPink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabInner}>
          <MaterialIcon name="add" size={32} color={brand.white} />
        </LinearGradient>
      </Pressable>
      <AddToJourneySheet visible={adding} onClose={() => setAdding(false)} />
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="titleMedium" style={styles.bold}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

function Empty({
  icon,
  title,
  message,
  action,
  onPress,
}: {
  icon: string;
  title: string;
  message: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <EmptyState icon={icon} title={title} message={message} />
      {action && onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress} style={styles.emptyButton}>
          <MaterialIcon name="add" size={20} color={brand.white} />
          <AppText variant="label" color={brand.white}>
            {action}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  centered: { justifyContent: 'center', padding: 24 },
  signIn: { alignSelf: 'center', minWidth: 200 },
  bold: { fontFamily: 'Poppins_700Bold' },
  semiBold: { fontFamily: 'Poppins_600SemiBold' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 4,
    borderBottomLeftRadius: radius.header,
    borderBottomRightRadius: radius.header,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  daysFree: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabSelected: { backgroundColor: brand.white },
  tabText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
  content: {
    padding: 16,
    gap: 12,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  stats: { flexDirection: 'row', gap: 12 },
  section: { gap: 12, marginTop: 8 },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.medium,
    backgroundColor: brand.headerPink,
  },
  fab: {
    position: 'absolute',
    right: 20,
    borderRadius: 30,
    shadowColor: brand.headerPink,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
