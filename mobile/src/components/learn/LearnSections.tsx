import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import Svg, { Circle } from 'react-native-svg';

import { Button, Chip, Icon, ListRow, PressableScale, Section, Sheet, Text } from '@/components/ui';
import { decorative } from '@/components/ui/a11y';
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
import { haptics } from '@/lib/haptics';
import { useHabitsStore } from '@/stores/habitsStore';
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
 * One habit as a Reminders-style row: the circle marks it done today (tap again to undo),
 * the rest of the row opens the details.
 */
export function HabitRow({ tip, onPress }: { tip: PreventionTip; onPress: () => void }) {
  const isDone = useHabitsStore((state) => state.isDone(tip.id));
  const toggleDone = useHabitsStore((state) => state.toggleDone);
  return (
    <ListRow
      title={tip.title}
      titleTone={isDone ? 'muted' : 'ink'}
      subtitle={isDone ? 'Done today' : tip.description}
      subtitleTone={isDone ? 'help' : 'muted'}
      onPress={onPress}
      accessibilityHint="Opens the details"
      leading={
        <PressableScale
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isDone }}
          accessibilityLabel={`${tip.title}, done today`}
          onPress={() => {
            haptics.selection();
            toggleDone(tip.id);
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

export function PreventionDetailSheet({
  tip,
  onClose,
}: {
  tip: PreventionTip | null;
  onClose: () => void;
}) {
  const { palette } = useDesign();
  const openTone = tip ? categoryTone(tip.category) : null;
  const openIcon = tip ? iconForPreventionTip(tip) : null;
  const isDone = useHabitsStore((state) => (tip ? state.isDone(tip.id) : false));
  const isBookmarked = useHabitsStore((state) => (tip ? state.isBookmarked(tip.id) : false));
  const toggleDone = useHabitsStore((state) => state.toggleDone);
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
            <Button
              title={isDone ? 'Completed today' : 'Mark as completed today'}
              icon={isDone ? 'check' : 'circle'}
              variant={isDone ? 'help' : 'primary'}
              onPress={() => toggleDone(tip.id)}
            />
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

/** Habits under a ring that fills as they're done today (Apple Fitness), then the rows. */
export function LowerYourRisk({ tips }: { tips: PreventionTip[] }) {
  const [open, setOpen] = useState<PreventionTip | null>(null);
  const done = useHabitsStore((state) => tips.filter((tip) => state.isDone(tip.id)).length);

  return (
    <View style={styles.sectionGap}>
      <Section>
        <View
          accessible
          accessibilityLabel={`${done} of ${tips.length} habits done today`}
          style={styles.progress}>
          <ProgressRing done={done} total={tips.length} />
          <View style={styles.progressText}>
            <Text variant="strong">Today&apos;s habits</Text>
            <Text variant="supporting" tone="muted">
              Small steps that lower your risk, backed by health agencies
            </Text>
          </View>
        </View>
      </Section>
      <Section>
        {tips.map((tip) => (
          <HabitRow key={tip.id} tip={tip} onPress={() => setOpen(tip)} />
        ))}
      </Section>
      <PreventionDetailSheet tip={open} onClose={() => setOpen(null)} />
    </View>
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
