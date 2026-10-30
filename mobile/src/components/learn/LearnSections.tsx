import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import Svg, { Circle } from 'react-native-svg';

import {
  Button,
  Chip,
  Icon,
  ListRow,
  PressableScale,
  Section,
  SegmentedControl,
  Sheet,
  Text,
} from '@/components/ui';
import { decorative } from '@/components/ui/a11y';
import { HABITS, MAX_TRACKED, type Habit } from '@/constants/habits';
import { useFocus } from '@/hooks/useFocus';
import { useHabitPlan } from '@/hooks/useHabits';
import type { GuideStatus } from '@/hooks/useSelfChecks';
import { formatShortDate, formatShortMonthDay } from '@/lib/dates';
import {
  BODY_SYSTEMS,
  bodySystemForCancer,
  iconForCancer,
  iconForPreventionTip,
  type BodySystem,
} from '@/lib/learn';
import { openWebPage } from '@/lib/links';
import { habitWeek, type Smoker } from '@/lib/habits';
import { haptics } from '@/lib/haptics';
import { useHabitsStore } from '@/stores/habitsStore';
import { showToast } from '@/stores/toastStore';
import type { Palette } from '@/theme/palette';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { CancerType } from '@/types/cancerType';
import type { PreventionTip } from '@/types/preventionTip';

// Learn's three lists in the redesign (docs/redesign/03-phase-3-today-and-learn.md).

const openGuide = (id: string) => router.push({ pathname: '/learn/check/[id]', params: { id } });
const openCancer = (id: string) => router.push({ pathname: '/learn/cancer/[id]', params: { id } });

/** One self-check guide: a "Due" tag at the right when it's due, else a check and the next date. */
export function GuideRow({ status }: { status: GuideStatus }) {
  const { guide, isDue, label, lastDone } = status;
  const done = !isDue && lastDone ? `Done ${formatShortDate(lastDone)}` : null;
  // Short enough not to wrap beside the status: "Nov 28", and a plain "Due" tag with
  // when it's due ("Due today") in this line.
  const subtitle = isDue
    ? `${guide.frequency} · ${label}`
    : `${guide.frequency} · Next ${formatShortMonthDay(status.due)}`;
  return (
    <ListRow
      icon={iconForCancer(guide.cancerType)}
      iconTone="action"
      title={guide.title}
      subtitle={subtitle}
      status={
        isDue ? { kind: 'due', label: 'Due' } : done ? { kind: 'done', label: done } : undefined
      }
      accessibilityLabel={[guide.title, isDue ? label : done, subtitle].filter(Boolean).join(', ')}
      onPress={() => openGuide(guide.id)}
    />
  );
}

/** Soonest due first. */
const byDue = (a: GuideStatus, b: GuideStatus) => a.due.getTime() - b.due.getTime();

/** The person's checks split into due now and up to date, then the rest on request. */
export function CheckYourself({ mine, all }: { mine: GuideStatus[]; all: GuideStatus[] }) {
  const [showAll, setShowAll] = useState(false);
  const own = [...mine].sort(byDue);
  const due = own.filter((status) => status.isDue);
  const upToDate = own.filter((status) => !status.isDue);
  const others = all
    .filter((item) => !mine.some((check) => check.guide.id === item.guide.id))
    .sort(byDue);
  // Someone who follows no checks yet sees them all at once.
  const showOthers = showAll || !own.length;
  const row = (status: GuideStatus) => <GuideRow key={status.guide.id} status={status} />;
  return (
    <>
      {due.length ? <Section title="Due now">{due.map(row)}</Section> : null}
      {upToDate.length ? <Section title="Up to date">{upToDate.map(row)}</Section> : null}
      {others.length ? (
        <Section title={own.length ? 'More checks' : 'All checks'}>
          {showOthers ? others.map(row) : null}
          {showOthers ? null : (
            <ListRow
              title={`Show ${others.length} more`}
              titleTone="action"
              onPress={() => setShowAll(true)}
            />
          )}
        </Section>
      ) : null}
    </>
  );
}

export function GuideResults({ statuses }: { statuses: GuideStatus[] }) {
  return (
    <Section title="Self-checks">
      {statuses.map((status) => (
        <GuideRow key={status.guide.id} status={status} />
      ))}
    </Section>
  );
}

/** Cancer types categorized by body systems (Option 2), with filter chips and clean grouped list. */
export function CancerTypes({ cancers }: { cancers: CancerType[] }) {
  const [selectedSystem, setSelectedSystem] = useState<BodySystem>('All');
  const sorted = [...cancers].sort((a, b) => a.name.localeCompare(b.name));
  const filtered =
    selectedSystem === 'All'
      ? sorted
      : sorted.filter((c) => bodySystemForCancer(c.name) === selectedSystem);

  return (
    <View style={styles.sectionGap}>
      <Section
        title="Cancer types"
        subtitle="Early signs, risks and how each is found"
        look="plain">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.systems}
          accessibilityRole="radiogroup"
          accessibilityLabel="Body system">
          {BODY_SYSTEMS.map((system) => {
            const count =
              system === 'All'
                ? sorted.length
                : sorted.filter((c) => bodySystemForCancer(c.name) === system).length;
            if (system !== 'All' && count === 0) return null;
            return (
              <Chip
                key={system}
                kind="radio"
                label={system === 'All' ? `All (${count})` : `${system} (${count})`}
                selected={selectedSystem === system}
                onPress={() => setSelectedSystem(system)}
              />
            );
          })}
        </ScrollView>
      </Section>
      <Section look="card">
        {filtered.map((cancer) => (
          <ListRow
            key={cancer.id}
            icon={iconForCancer(cancer.name)}
            iconTone="action"
            title={cancer.name}
            subtitle={cancer.symptoms.length ? `${cancer.symptoms.length} early signs` : undefined}
            onPress={() => openCancer(cancer.id)}
          />
        ))}
      </Section>
    </View>
  );
}

const sentenceCase = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function categoryTone(category: string): { background: keyof Palette; color: keyof Palette } {
  const cat = category.toLowerCase();
  switch (cat) {
    case 'diet':
      return { background: 'raised', color: 'action' };
    case 'exercise':
    case 'hydration':
      return { background: 'helpTint', color: 'help' };
    case 'lifestyle':
      return { background: 'raised', color: 'action' };
    case 'weight':
      return { background: 'sun', color: 'sunInk' };
    case 'screening':
      return { background: 'raised', color: 'action' };
    case 'prevention':
      return { background: 'helpTint', color: 'help' };
    default:
      return { background: 'raised', color: 'action' };
  }
}

/**
 * One habit as a Reminders-style row: the circle marks it done (today, or for good when
 * `once`), and tapping again undoes it; the rest of the row opens the details.
 */
export function HabitRow({
  tip,
  onPress,
  once = false,
}: {
  tip: PreventionTip;
  onPress: () => void;
  once?: boolean;
}) {
  const isDone = useHabitsStore((state) =>
    once ? state.isDoneEver(tip.id) : state.isDone(tip.id),
  );
  const toggleDone = useHabitsStore((state) => state.toggleDone);
  const toggleOnce = useHabitsStore((state) => state.toggleOnce);
  return (
    <ListRow
      title={tip.title}
      titleTone={isDone ? 'muted' : 'ink'}
      subtitle={isDone ? (once ? 'Done' : 'Done today') : tip.description}
      subtitleTone={isDone ? 'help' : 'muted'}
      onPress={onPress}
      accessibilityHint="Opens the details"
      leading={
        <PressableScale
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isDone }}
          accessibilityLabel={once ? `${tip.title}, done` : `${tip.title}, done today`}
          onPress={() => {
            haptics.selection();
            if (once) toggleOnce(tip.id);
            else toggleDone(tip.id);
          }}
          style={styles.check}>
          <Icon
            name={isDone ? 'circle-check' : 'circle'}
            size={28}
            tone={isDone ? 'help' : 'muted'}
          />
        </PressableScale>
      }
    />
  );
}

/** A habit that only opens its details (search results, the wellbeing ones). */
export function HabitInfoRow({ tip, onPress }: { tip: PreventionTip; onPress: () => void }) {
  return (
    <ListRow
      icon={iconForPreventionTip(tip)}
      title={tip.title}
      subtitle={tip.description}
      onPress={onPress}
    />
  );
}

export function PreventionDetailSheet({
  tip,
  onClose,
}: {
  tip: Habit | null;
  onClose: () => void;
}) {
  const { palette } = useDesign();
  const openTone = tip ? categoryTone(tip.category) : null;
  const openIcon = tip ? iconForPreventionTip(tip) : null;
  const once = tip?.kind === 'once';
  const isDone = useHabitsStore((state) =>
    tip ? (once ? state.isDoneEver(tip.id) : state.isDone(tip.id)) : false,
  );
  const isBookmarked = useHabitsStore((state) => (tip ? state.isBookmarked(tip.id) : false));
  const toggleDone = useHabitsStore((state) => state.toggleDone);
  const toggleOnce = useHabitsStore((state) => state.toggleOnce);
  const toggleBookmark = useHabitsStore((state) => state.toggleBookmark);

  return (
    <Sheet visible={tip !== null} onClose={onClose} title={tip?.title ?? ''}>
      {tip && openTone && openIcon ? (
        <View style={styles.sheetContent}>
          <View style={styles.sheetMetaRow}>
            <View style={[styles.badge, { backgroundColor: palette[openTone.background] }]}>
              <Text variant="caption" tone={openTone.color}>
                {sentenceCase(tip.category)}
              </Text>
            </View>
            <View style={[styles.cardIconTile, { backgroundColor: palette.raised }]}>
              <Icon name={openIcon} size={18} tone={openTone.color} />
            </View>
          </View>
          <Text variant="reading">{tip.description}</Text>
          {tip.detailedInfo ? <Text variant="reading">{tip.detailedInfo}</Text> : null}
          <View style={styles.sheetActions}>
            {tip.kind === 'wellbeing' ? null : (
              <Button
                title={
                  once
                    ? isDone
                      ? 'Done'
                      : 'Mark as done'
                    : isDone
                      ? 'Completed today'
                      : 'Mark as completed today'
                }
                icon={isDone ? 'check' : 'circle'}
                variant={isDone ? 'help' : 'primary'}
                onPress={() => (once ? toggleOnce(tip.id) : toggleDone(tip.id))}
              />
            )}
            <Button
              title={isBookmarked ? 'Saved in bookmarks' : 'Save habit to bookmarks'}
              icon="bookmark"
              variant="secondary"
              onPress={() => toggleBookmark(tip.id)}
            />
            <Button
              title={`Source: ${tip.sourceName}`}
              icon="external-link"
              variant="quiet"
              small
              onPress={() => openWebPage(tip.sourceUrl)}
            />
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}

/** Habits found by a search: rows that open their details. */
export function HabitResults({ habits }: { habits: Habit[] }) {
  const [open, setOpen] = useState<Habit | null>(null);
  return (
    <Section title="Habits">
      {habits.map((habit) => (
        <HabitInfoRow key={habit.id} tip={habit} onPress={() => setOpen(habit)} />
      ))}
      <PreventionDetailSheet tip={open} onClose={() => setOpen(null)} />
    </Section>
  );
}

/**
 * Learn › Habits: the daily habits someone tracks under a ring and their week, then the
 * once-only list and the wellbeing ones. Treatment shows gentle "feel better" habits.
 */
export function LowerYourRisk() {
  const plan = useHabitPlan();
  const inTreatment = useFocus() === 'treatment';
  const [open, setOpen] = useState<Habit | null>(null);
  const [choosing, setChoosing] = useState(false);
  const trackedIds = plan.tracked.map((habit) => habit.id);
  const completedByDate = useHabitsStore((state) => state.completedByDate);
  const done = useHabitsStore((state) => trackedIds.filter((id) => state.isDone(id)).length);
  const week = habitWeek(completedByDate, trackedIds);
  const left = plan.tracked.length - done;

  return (
    <View style={styles.sectionGap}>
      <Section>
        <View
          accessible
          accessibilityLabel={`${done} of ${plan.tracked.length} habits done today`}
          style={styles.progress}>
          <ProgressRing done={done} total={plan.tracked.length} />
          <View style={styles.progressText}>
            <Text variant="strong">
              {inTreatment ? 'Feel a bit better today' : 'Your daily habits'}
            </Text>
            <Text variant="supporting" tone="muted">
              {left === 0
                ? 'All done today'
                : left === 1
                  ? 'One more to finish today'
                  : inTreatment
                    ? 'Small things that help during treatment'
                    : 'Small steps that lower your risk'}
            </Text>
          </View>
        </View>
        <View
          accessible
          accessibilityLabel={`${week.filter((day) => day.done).length} of the last 7 days complete`}
          style={styles.week}>
          {week.map((day) => (
            <View key={day.key} style={styles.day}>
              <Text variant="caption" tone={day.isToday ? 'ink' : 'muted'}>
                {day.label}
              </Text>
              <WeekDot done={day.done} today={day.isToday} />
            </View>
          ))}
        </View>
      </Section>

      <Section>
        {plan.tracked.map((habit) => (
          <HabitRow key={habit.id} tip={habit} onPress={() => setOpen(habit)} />
        ))}
        {inTreatment ? null : (
          <ListRow title="Change habits" titleTone="action" onPress={() => setChoosing(true)} />
        )}
      </Section>
      {inTreatment ? (
        <Text variant="supporting" tone="muted" style={styles.footnote}>
          Even short walks can ease treatment tiredness. Ask your care team what&apos;s right for
          you.
        </Text>
      ) : null}

      {plan.once.length ? (
        <Section title="Protect yourself" subtitle="Once, not every day">
          {plan.once.map((habit) => (
            <HabitRow key={habit.id} tip={habit} once onPress={() => setOpen(habit)} />
          ))}
        </Section>
      ) : null}

      <Section
        title="Feel well"
        subtitle={inTreatment ? undefined : 'Good for you, not proven to lower cancer risk'}>
        {plan.wellbeing.map((habit) => (
          <HabitInfoRow key={habit.id} tip={habit} onPress={() => setOpen(habit)} />
        ))}
      </Section>

      <PreventionDetailSheet tip={open} onClose={() => setOpen(null)} />
      <ChooseHabits
        visible={choosing}
        onClose={() => setChoosing(false)}
        options={plan.options}
        tracked={trackedIds}
      />
    </View>
  );
}

function WeekDot({ done, today }: { done: boolean; today: boolean }) {
  const { palette } = useDesign();
  return (
    <View
      style={[
        styles.dot,
        { backgroundColor: done ? palette.help : palette.raised },
        today && !done && { borderWidth: 1.5, borderColor: palette.help },
      ]}
    />
  );
}

/** Pick up to three daily habits, and say once whether you smoke. */
function ChooseHabits({
  visible,
  onClose,
  options,
  tracked,
}: {
  visible: boolean;
  onClose: () => void;
  options: Habit[];
  tracked: string[];
}) {
  const smoker = useHabitsStore((state) => state.smoker);
  const setSmoker = useHabitsStore((state) => state.setSmoker);
  const setChosen = useHabitsStore((state) => state.setChosenHabits);
  const toggle = (id: string) => {
    if (tracked.includes(id)) {
      // At least one, so the ring always has something to fill.
      if (tracked.length > 1) setChosen(tracked.filter((item) => item !== id));
    } else if (tracked.length < MAX_TRACKED) {
      setChosen([...tracked, id]);
    } else {
      showToast(`Pick up to ${MAX_TRACKED}. Untick one first.`);
    }
  };
  return (
    <Sheet visible={visible} onClose={onClose} title="Your habits">
      <Text variant="body" tone="muted">
        Pick up to {MAX_TRACKED}. A few habits you keep beat many you don&apos;t.
      </Text>
      <Section>
        {options.map((habit) => {
          const on = tracked.includes(habit.id);
          return (
            <ListRow
              key={habit.id}
              title={habit.title}
              subtitle={habit.description}
              accessibilityLabel={`${habit.title}, ${on ? 'tracked' : 'not tracked'}`}
              onPress={() => toggle(habit.id)}
              accessory={
                <Icon
                  name={on ? 'circle-check' : 'circle'}
                  size={26}
                  tone={on ? 'action' : 'muted'}
                />
              }
            />
          );
        })}
      </Section>
      <Text variant="section" accessibilityRole="header">
        Do you smoke or vape?
      </Text>
      <SegmentedControl<Smoker>
        accessibilityLabel="Do you smoke or vape?"
        value={smoker ?? 'no'}
        onChange={(value) => {
          setSmoker(value);
          // Smoke-free goes first for smokers; their other picks fill the rest.
          const smokeFree = HABITS.find((habit) => habit.smokersOnly)?.id;
          if (smokeFree && value === 'yes' && !tracked.includes(smokeFree)) {
            setChosen([smokeFree, ...tracked].slice(0, MAX_TRACKED));
          }
        }}
        options={[
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' },
        ]}
      />
      <Text variant="supporting" tone="muted">
        If you do, a smoke-free day is added to your habits.
      </Text>
    </Sheet>
  );
}

const RING = 56;
const RING_STROKE = 5;

/** How many of today's habits are done, as a ring that fills clockwise. */
export function ProgressRing({ done, total }: { done: number; total: number }) {
  const { palette } = useDesign();
  const radius = (RING - RING_STROKE) / 2;
  const length = 2 * Math.PI * radius;
  const share = total ? done / total : 0;
  return (
    <View style={styles.ring}>
      <Svg width={RING} height={RING} style={StyleSheet.absoluteFill} {...decorative}>
        <Circle
          cx={RING / 2}
          cy={RING / 2}
          r={radius}
          stroke={palette.border}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <Circle
          cx={RING / 2}
          cy={RING / 2}
          r={radius}
          stroke={palette.help}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${length * share} ${length}`}
          // Starts at the top, like a clock.
          transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
          fill="none"
        />
      </Svg>
      <Text variant="strong">{`${done}/${total}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionGap: { gap: space.md },
  systems: { gap: space.sm, paddingRight: space.xl },
  badge: {
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radii.round,
  },
  cardIconTile: {
    width: 36,
    height: 36,
    borderRadius: radii.tile - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  day: { alignItems: 'center', gap: space.xs, minWidth: 28 },
  dot: { width: 14, height: 14, borderRadius: radii.round },
  footnote: { paddingHorizontal: space.xs },
  check: { minWidth: 32, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingVertical: space.lg,
  },
  progressText: { flex: 1, gap: 2 },
  ring: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  sheetContent: {
    gap: space.md,
  },
  sheetActions: {
    gap: space.sm,
    marginTop: space.xs,
  },
  sheetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
