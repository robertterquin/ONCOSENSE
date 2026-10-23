import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStartJourney } from '@/hooks/useJourney';
import { confirm } from '@/lib/confirm';
import { addDays, formatLongDate, isSameDay } from '@/lib/dates';
import { showToast } from '@/stores/toastStore';
import { brand, gradients } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AppText } from '../AppText';
import { PinkSwitch } from '../PinkSwitch';
import { DateField } from '../DateField';
import { MaterialIcon } from '../MaterialIcon';

// One flow for both Flutter screens: journey_onboarding_screen.dart (after
// registering, with Skip) and journey_setup_screen.dart (inside the Journey tab).

type Mode = 'onboarding' | 'setup';
type JourneyType = 'patient' | 'survivor';

const GREEN = '#4CAF50';

const QUICK_DATES: { label: string; daysAgo: number; onboardingOnly?: boolean }[] = [
  { label: 'Today', daysAgo: 0 },
  { label: '1 week ago', daysAgo: 7 },
  { label: '1 month ago', daysAgo: 30 },
  { label: '3 months ago', daysAgo: 90 },
  { label: '6 months ago', daysAgo: 180, onboardingOnly: true },
  { label: '1 year ago', daysAgo: 365, onboardingOnly: true },
];

export function JourneySetupFlow({ mode }: { mode: Mode }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const start = useStartJourney();
  const [page, setPage] = useState(0);
  // Not saved anywhere yet (same as Flutter); it only personalizes the wording.
  const [journeyType, setJourneyType] = useState<JourneyType>('patient');
  const [startDate, setStartDate] = useState(() => new Date());
  const [isCancerFree, setIsCancerFree] = useState(false);
  const [cancerFreeDate, setCancerFreeDate] = useState<Date | null>(null);
  const today = new Date();
  const onboarding = mode === 'onboarding';
  const muted = isDark ? 'rgba(255,255,255,0.6)' : '#757575';

  const skip = async () => {
    const ok = await confirm({
      title: 'Skip Setup?',
      message:
        'You can always set up your journey later from the Journey tab. Some features will be limited until you complete the setup.',
      confirmText: 'Skip',
      cancelText: 'Continue Setup',
    });
    if (ok) router.replace('/home');
  };

  const finish = () =>
    start.mutate(
      { diagnosisDate: startDate, cancerFreeDate: isCancerFree ? cancerFreeDate : null },
      {
        onSuccess: () => {
          if (onboarding) {
            showToast("🎉 Your journey has begun! Let's do this together!", 'success');
            router.replace('/home');
          }
          // In the Journey tab the screen switches to the tracker by itself.
        },
        onError: (error) => showToast(`Error starting journey: ${error.message}`, 'error'),
      },
    );

  const next = () => (page < 2 ? setPage(page + 1) : finish());

  const card = [
    styles.card,
    { backgroundColor: isDark ? colors.card : brand.white },
    !isDark && styles.shadow,
  ];

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <MaterialIcon name="auto_graph" size={28} color={brand.white} />
          <AppText variant="titleLarge" color={brand.white} style={[styles.flex, styles.bold]}>
            {onboarding ? 'Your Cancer Journey' : 'Start Your Journey'}
          </AppText>
          {onboarding ? (
            <Pressable accessibilityRole="button" onPress={skip} hitSlop={8}>
              <AppText variant="label" color="rgba(255,255,255,0.9)">
                Skip
              </AppText>
            </Pressable>
          ) : null}
        </View>
        <AppText variant="bodySmall" color="rgba(255,255,255,0.9)">
          Let&apos;s personalize your experience
        </AppText>
        <View style={styles.progress} accessibilityLabel={`Step ${page + 1} of 3`}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.progressBar,
                { backgroundColor: index <= page ? brand.white : 'rgba(255,255,255,0.3)' },
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.page}>
        {page === 0 ? (
          <>
            <AppText variant="headlineMedium" style={styles.centered}>
              {onboarding ? 'Tell us about yourself' : 'Who is this journey for?'}
            </AppText>
            <AppText color={muted} style={styles.centered}>
              This helps us personalize your experience
            </AppText>
            {(
              [
                [
                  'patient',
                  'person',
                  "I'm a Patient",
                  'Currently undergoing treatment or monitoring',
                ],
                [
                  'survivor',
                  'favorite',
                  "I'm a Survivor",
                  'Completed treatment, in remission or cancer-free',
                ],
              ] as const
            ).map(([value, icon, title, subtitle]) => {
              const selected = journeyType === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setJourneyType(value)}
                  style={[
                    ...card,
                    styles.option,
                    {
                      borderColor: selected
                        ? brand.headerPink
                        : isDark
                          ? 'rgba(255,255,255,0.12)'
                          : '#EEEEEE',
                      backgroundColor: selected
                        ? 'rgba(216,27,96,0.1)'
                        : isDark
                          ? colors.card
                          : brand.white,
                    },
                  ]}>
                  <View
                    style={[
                      styles.optionIcon,
                      {
                        backgroundColor: selected
                          ? 'rgba(216,27,96,0.2)'
                          : isDark
                            ? 'rgba(255,255,255,0.1)'
                            : '#F5F5F5',
                      },
                    ]}>
                    <MaterialIcon
                      name={icon}
                      size={28}
                      color={selected ? brand.headerPink : '#9E9E9E'}
                    />
                  </View>
                  <View style={styles.flex}>
                    <AppText
                      variant="titleMedium"
                      color={selected ? brand.headerPink : colors.text}>
                      {title}
                    </AppText>
                    <AppText variant="bodySmall" color={muted}>
                      {subtitle}
                    </AppText>
                  </View>
                  {selected ? (
                    <MaterialIcon name="check_circle" size={24} color={brand.headerPink} />
                  ) : null}
                </Pressable>
              );
            })}
            {onboarding ? (
              <View style={styles.privacy}>
                <MaterialIcon name="info_outline" size={20} color="#2196F3" />
                <AppText
                  variant="bodySmall"
                  color={isDark ? 'rgba(255,255,255,0.7)' : '#616161'}
                  style={styles.flex}>
                  Your information is private and only used to personalize your experience.
                </AppText>
              </View>
            ) : null}
          </>
        ) : page === 1 ? (
          <>
            <AppText variant="headlineMedium" style={styles.centered}>
              When did your journey begin?
            </AppText>
            <AppText color={muted} style={styles.centered}>
              This could be your diagnosis date or when you started treatment
            </AppText>
            <DateField
              value={startDate}
              onChange={setStartDate}
              maximumDate={today}
              accessibilityLabel="Journey start date">
              <View style={[...card, styles.dateCard, { borderColor: 'rgba(216,27,96,0.3)' }]}>
                <View style={styles.dateIcon}>
                  <MaterialIcon name="calendar_today" size={32} color={brand.headerPink} />
                </View>
                <AppText variant="headlineMedium">{formatLongDate(startDate)}</AppText>
                <AppText variant="bodySmall" color={muted}>
                  {onboarding ? 'Tap to change date' : 'Tap to change'}
                </AppText>
              </View>
            </DateField>
            <AppText variant="label" color={isDark ? 'rgba(255,255,255,0.7)' : '#616161'}>
              Quick options
            </AppText>
            <View style={styles.chips}>
              {QUICK_DATES.filter((quick) => onboarding || !quick.onboardingOnly).map((quick) => {
                const date = addDays(today, -quick.daysAgo);
                const selected = isSameDay(startDate, date);
                return (
                  <Pressable
                    key={quick.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setStartDate(date)}
                    style={[
                      styles.chip,
                      { backgroundColor: selected ? brand.headerPink : 'rgba(216,27,96,0.1)' },
                    ]}>
                    <AppText
                      variant="bodySmall"
                      color={selected ? brand.white : brand.headerPink}
                      style={styles.medium}>
                      {quick.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <AppText variant="headlineMedium" style={styles.centered}>
              Are you cancer-free?
            </AppText>
            <AppText color={muted} style={styles.centered}>
              If so, we&apos;ll help you track and celebrate your cancer-free days!
            </AppText>
            <View style={[...card, styles.option]}>
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor: isCancerFree
                      ? 'rgba(76,175,80,0.2)'
                      : isDark
                        ? 'rgba(255,255,255,0.1)'
                        : '#F5F5F5',
                  },
                ]}>
                <MaterialIcon
                  name={isCancerFree ? 'celebration' : 'help_outline'}
                  size={28}
                  color={isCancerFree ? GREEN : '#9E9E9E'}
                />
              </View>
              <View style={styles.flex}>
                <AppText variant="titleMedium">I am cancer-free</AppText>
                <AppText variant="bodySmall" color={muted}>
                  Track days since remission
                </AppText>
              </View>
              <PinkSwitch
                accessibilityLabel="I am cancer-free"
                value={isCancerFree}
                onValueChange={(value) => {
                  setIsCancerFree(value);
                  if (value && !cancerFreeDate) setCancerFreeDate(new Date());
                }}
              />
            </View>
            {isCancerFree ? (
              <>
                <AppText variant="titleMedium">When were you declared cancer-free?</AppText>
                <DateField
                  value={cancerFreeDate ?? today}
                  onChange={setCancerFreeDate}
                  maximumDate={today}
                  accessibilityLabel="Cancer-free date">
                  <View style={[styles.cancerFreeDate]}>
                    <MaterialIcon name="event_available" size={32} color={GREEN} />
                    <View style={styles.flex}>
                      <AppText variant="titleMedium" color={GREEN}>
                        {formatLongDate(cancerFreeDate ?? today)}
                      </AppText>
                      <AppText variant="bodySmall" color={muted}>
                        Tap to change date
                      </AppText>
                    </View>
                  </View>
                </DateField>
                <View style={styles.privacy}>
                  <MaterialIcon name="celebration" size={20} color={GREEN} />
                  <AppText
                    variant="bodySmall"
                    color={isDark ? 'rgba(255,255,255,0.7)' : '#616161'}
                    style={styles.flex}>
                    {onboarding
                      ? "We'll celebrate your milestones: 7, 30, 90, 180, 365 days and beyond! 🎉"
                      : "You'll be able to track your cancer-free milestone days: 7, 30, 90, 180, 365 days and more!"}
                  </AppText>
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 16 + (onboarding ? insets.bottom : 90) }]}>
        {page > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setPage(page - 1)}
            style={[styles.footerButton, styles.backButton]}>
            <AppText variant="button" color={brand.headerPink}>
              Back
            </AppText>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={start.isPending}
          onPress={next}
          style={[
            styles.footerButton,
            styles.nextButton,
            { flex: page > 0 ? 1 : 2 },
            start.isPending && styles.dimmed,
          ]}>
          <AppText variant="button" color={brand.white}>
            {start.isPending
              ? 'Saving…'
              : page === 2
                ? onboarding
                  ? 'Start My Journey'
                  : 'Start Journey'
                : 'Continue'}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  bold: { fontFamily: 'Poppins_700Bold' },
  medium: { fontFamily: 'Poppins_500Medium' },
  centered: { textAlign: 'center' },
  dimmed: { opacity: 0.6 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: radius.header,
    borderBottomRightRadius: radius.header,
    gap: 8,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progress: { flexDirection: 'row', gap: 6, marginTop: 12 },
  progressBar: { flex: 1, height: 4, borderRadius: 2 },
  page: {
    padding: 24,
    gap: 16,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  card: { borderRadius: radius.large, padding: 20, borderWidth: 2, borderColor: 'transparent' },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  option: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  optionIcon: { padding: 12, borderRadius: 12 },
  privacy: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: radius.medium,
    backgroundColor: 'rgba(33,150,243,0.1)',
  },
  dateCard: { alignItems: 'center', gap: 8 },
  dateIcon: {
    padding: 16,
    borderRadius: 40,
    backgroundColor: 'rgba(216,27,96,0.1)',
    marginBottom: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  cancerFreeDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingTop: 12 },
  footerButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: { borderWidth: 1, borderColor: brand.headerPink },
  nextButton: { backgroundColor: brand.headerPink },
});
