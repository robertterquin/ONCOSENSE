import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Button,
  Chip,
  Icon,
  ListRow,
  PressableScale,
  Section,
  Sheet,
  Tag,
  Text,
} from '@/components/ui';
import type { GuideStatus } from '@/hooks/useSelfChecks';
import { formatShortDate } from '@/lib/dates';
import {
  BODY_SYSTEMS,
  bodySystemForCancer,
  iconForCancer,
  iconForPreventionTip,
  shortenSourceName,
  type BodySystem,
} from '@/lib/learn';
import { openWebPage } from '@/lib/links';
import { haptics } from '@/lib/haptics';
import { useHabitsStore } from '@/stores/habitsStore';
import type { Palette } from '@/theme/palette';
import { elevation, pressedCard } from '@/theme/elevation';
import { useTransition } from '@/theme/motion';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { CancerType } from '@/types/cancerType';
import type { PreventionTip } from '@/types/preventionTip';

// Learn's three lists in the redesign (docs/redesign/03-phase-3-today-and-learn.md).

const openGuide = (id: string) => router.push({ pathname: '/learn/check/[id]', params: { id } });
const openCancer = (id: string) => router.push({ pathname: '/learn/cancer/[id]', params: { id } });

/** One self-check guide: a "Due" tag when it's due, else when it was last done. */
export function GuideRow({ status }: { status: GuideStatus }) {
  const { guide, isDue, label, lastDone } = status;
  const done = !isDue && lastDone ? `Done ${formatShortDate(lastDone)}` : null;
  const subtitle = isDue ? guide.frequency : `${guide.frequency} · ${label}`;
  return (
    <ListRow
      icon={iconForCancer(guide.cancerType)}
      iconTone="action"
      title={guide.title}
      subtitle={subtitle}
      badge={
        isDue ? <Tag tone="due" label={label} /> : done ? <Tag tone="done" label={done} /> : null
      }
      accessibilityLabel={[guide.title, isDue ? label : done, subtitle].filter(Boolean).join(', ')}
      onPress={() => openGuide(guide.id)}
    />
  );
}

/** Soonest due first. */
const byDue = (a: GuideStatus, b: GuideStatus) => a.due.getTime() - b.due.getTime();

/** The person's guides first, then the rest on request. */
export function CheckYourself({ mine, all }: { mine: GuideStatus[]; all: GuideStatus[] }) {
  const [showAll, setShowAll] = useState(false);
  const others = all
    .filter((item) => !mine.some((own) => own.guide.id === item.guide.id))
    .sort(byDue);
  return (
    <Section title="Check yourself" subtitle="Short, guided checks you can do at home">
      {[...mine].sort(byDue).map((status) => (
        <GuideRow key={status.guide.id} status={status} />
      ))}
      {showAll ? others.map((status) => <GuideRow key={status.guide.id} status={status} />) : null}
      {others.length && !showAll ? (
        <ListRow
          title={`See all ${all.length} guides`}
          titleTone="action"
          onPress={() => setShowAll(true)}
        />
      ) : null}
    </Section>
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

const CARD_WIDTH = 256;

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

export function PreventionTipCard({ tip, onPress }: { tip: PreventionTip; onPress: () => void }) {
  const { palette, isDark } = useDesign();
  const tone = categoryTone(tip.category);
  const icon = iconForPreventionTip(tip);
  const source = shortenSourceName(tip.sourceName);
  const isDone = useHabitsStore((state) => state.isDone(tip.id));
  const toggleDone = useHabitsStore((state) => state.toggleDone);
  const colorTransition = useTransition('base', ['backgroundColor', 'borderColor']);

  return (
    <PressableScale
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: palette.surface },
        elevation('resting', palette, isDark),
        // Done today keeps a teal edge in both themes.
        isDone && { borderWidth: 1.5, borderColor: palette.help, borderTopColor: palette.help },
        pressed && pressedCard,
      ]}
      onPress={() => {
        haptics.lightImpact();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${tip.title}, ${tip.category}. ${isDone ? 'Completed today.' : ''} ${tip.description}. Source: ${tip.sourceName}`}>
      <View style={styles.cardHeader}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: palette[tone.background] }]}>
            <Text variant="caption" tone={tone.color}>
              {sentenceCase(tip.category)}
            </Text>
          </View>
          <PressableScale
            hitSlop={8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isDone }}
            accessibilityLabel={`Mark ${tip.title} as completed today`}
            onPress={(e) => {
              e.stopPropagation();
              toggleDone(tip.id);
            }}
            style={[
              styles.actionPill,
              colorTransition,
              isDone
                ? { backgroundColor: palette.helpTint, borderColor: palette.help }
                : { backgroundColor: palette.raised, borderColor: palette.line },
            ]}>
            <Icon
              name={isDone ? 'check' : 'circle'}
              size={16}
              tone={isDone ? 'help' : 'muted'}
              bold={isDone}
            />
            <Text variant="caption" tone={isDone ? 'help' : 'muted'}>
              {isDone ? 'Done' : 'Today'}
            </Text>
          </PressableScale>
        </View>
        <View style={[styles.cardIconTile, { backgroundColor: palette.raised }]}>
          <Icon name={icon} size={20} tone={tone.color} />
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text variant="row" numberOfLines={2}>
          {tip.title}
        </Text>
        <Text variant="supporting" tone="muted" numberOfLines={2}>
          {tip.description}
        </Text>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: palette.line }]}>
        <Text variant="caption" tone="muted" numberOfLines={1} style={styles.cardSource}>
          {source}
        </Text>
        <View style={styles.cardActionRow}>
          <Text variant="caption" tone="action">
            View guide
          </Text>
          <Icon name="chevron-right" size={18} tone="action" />
        </View>
      </View>
    </PressableScale>
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

/** Prevention tips as a swipeable horizontal cards carousel; each opens a sheet with details and source. */
export function LowerYourRisk({ tips }: { tips: PreventionTip[] }) {
  const [open, setOpen] = useState<PreventionTip | null>(null);

  const completedToday = useHabitsStore((state) => state.completedCount());

  const subtitle =
    completedToday > 0
      ? `Everyday habits backed by health agencies · ${completedToday} done today`
      : 'Everyday habits backed by health agencies';

  return (
    <Section title="Lower your risk" subtitle={subtitle} look="plain">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        style={styles.carouselScroll}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + space.md}
        snapToAlignment="start">
        {tips.map((tip) => (
          <PreventionTipCard key={tip.id} tip={tip} onPress={() => setOpen(tip)} />
        ))}
      </ScrollView>
      <PreventionDetailSheet tip={open} onClose={() => setOpen(null)} />
    </Section>
  );
}

const styles = StyleSheet.create({
  sectionGap: { gap: space.md },
  systems: { gap: space.sm, paddingRight: space.xl },
  carouselScroll: {
    marginHorizontal: -space.xl,
  },
  carouselContainer: {
    paddingHorizontal: space.xl,
    gap: space.md,
    paddingTop: space.xs,
    paddingBottom: space.md,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 188,
    borderRadius: radii.section,
    padding: space.lg,
    justifyContent: 'space-between',
    gap: space.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radii.round,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radii.round,
    borderWidth: 1,
  },
  cardIconTile: {
    width: 36,
    height: 36,
    borderRadius: radii.tile - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    gap: space.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space.sm,
    borderTopWidth: 1,
  },
  cardSource: {
    flex: 1,
    marginRight: space.xs,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
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
