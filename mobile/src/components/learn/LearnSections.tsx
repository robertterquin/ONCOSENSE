import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Chip, Icon, ListRow, Section, Sheet, Tag, Text } from '@/components/ui';
import type { GuideStatus } from '@/hooks/useSelfChecks';
import { formatShortDate } from '@/lib/dates';
import { iconForCancer, iconForPreventionTip, shortenSourceName } from '@/lib/learn';
import { openWebPage } from '@/lib/links';
import type { Palette } from '@/theme/palette';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { CancerType } from '@/types/cancerType';
import type { PreventionTip } from '@/types/preventionTip';

// Learn's three lists in the redesign (docs/redesign/03-phase-3-today-and-learn.md).

const openGuide = (id: string) => router.push({ pathname: '/learn/check/[id]', params: { id } });
const openCancer = (id: string) => router.push({ pathname: '/learn/cancer/[id]', params: { id } });

/** One self-check guide: a rose "Due" tag when it's due, else when it was last done. */
export function GuideRow({ status }: { status: GuideStatus }) {
  const { guide, isDue, label, lastDone } = status;
  const done = !isDue && lastDone ? `Done ${formatShortDate(lastDone)}` : null;
  const subtitle = isDue ? guide.frequency : `${guide.frequency} · ${label}`;
  return (
    <ListRow
      icon={iconForCancer(guide.cancerType)}
      iconTone="rose"
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

const BODY_SYSTEMS = ['All', 'Reproductive', 'Digestive', 'Respiratory', 'Blood', 'Skin'] as const;
type BodySystem = (typeof BODY_SYSTEMS)[number];

function bodySystemForCancer(name: string): BodySystem {
  const lower = name.toLowerCase();
  if (
    lower.includes('breast') ||
    lower.includes('cervical') ||
    lower.includes('ovarian') ||
    lower.includes('prostate') ||
    lower.includes('testicular')
  ) {
    return 'Reproductive';
  }
  if (
    lower.includes('colorectal') ||
    lower.includes('colon') ||
    lower.includes('liver') ||
    lower.includes('stomach') ||
    lower.includes('gastric') ||
    lower.includes('esophag') ||
    lower.includes('pancrea')
  ) {
    return 'Digestive';
  }
  if (lower.includes('lung')) {
    return 'Respiratory';
  }
  if (
    lower.includes('leukemia') ||
    lower.includes('lymphoma') ||
    lower.includes('blood') ||
    lower.includes('myeloma')
  ) {
    return 'Blood';
  }
  if (lower.includes('skin') || lower.includes('melanoma')) {
    return 'Skin';
  }
  return 'All';
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
            subtitle={
              cancer.symptoms.length ? `${cancer.symptoms.length} early signs` : undefined
            }
            onPress={() => openCancer(cancer.id)}
          />
        ))}
      </Section>
    </View>
  );
}

const CARD_WIDTH = 238;

function categoryTone(category: string): { background: keyof Palette; color: keyof Palette } {
  const cat = category.toLowerCase();
  switch (cat) {
    case 'diet':
      return { background: 'raised', color: 'action' };
    case 'exercise':
    case 'hydration':
      return { background: 'helpTint', color: 'help' };
    case 'lifestyle':
      return { background: 'roseTint', color: 'rose' };
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

function PreventionTipCard({
  tip,
  onPress,
}: {
  tip: PreventionTip;
  onPress: () => void;
}) {
  const { palette } = useDesign();
  const tone = categoryTone(tip.category);
  const icon = iconForPreventionTip(tip);
  const source = shortenSourceName(tip.sourceName);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${tip.title}, ${tip.category}. ${tip.description}. Source: ${tip.sourceName}`}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: palette[tone.background] }]}>
          <Text variant="caption" tone={tone.color} style={styles.badgeText}>
            {tip.category.toUpperCase()}
          </Text>
        </View>
        <View style={[styles.cardIconTile, { backgroundColor: palette.raised }]}>
          <Icon name={icon} size={18} tone={tone.color} />
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text variant="row" numberOfLines={2} style={styles.cardTitle}>
          {tip.title}
        </Text>
        <Text variant="supporting" tone="muted" numberOfLines={2} style={styles.cardDescription}>
          {tip.description}
        </Text>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: palette.line }]}>
        <Text variant="caption" tone="muted" numberOfLines={1} style={styles.cardSource}>
          {source}
        </Text>
        <View style={styles.cardActionRow}>
          <Text variant="caption" tone="action" style={styles.cardActionText}>
            View guide
          </Text>
          <Icon name="chevron-right" size={14} tone="action" />
        </View>
      </View>
    </Pressable>
  );
}

/** Prevention tips as a swipeable horizontal cards carousel; each opens a sheet with details and source. */
export function LowerYourRisk({ tips }: { tips: PreventionTip[] }) {
  const [open, setOpen] = useState<PreventionTip | null>(null);
  const { palette } = useDesign();
  const openTone = open ? categoryTone(open.category) : null;
  const openIcon = open ? iconForPreventionTip(open) : null;

  return (
    <Section
      title="Lower your risk"
      subtitle="Everyday habits backed by health agencies"
      look="plain">
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
      <Sheet visible={open !== null} onClose={() => setOpen(null)} title={open?.title ?? ''}>
        {open && openTone && openIcon ? (
          <View style={styles.sheetContent}>
            <View style={styles.sheetMetaRow}>
              <View style={[styles.badge, { backgroundColor: palette[openTone.background] }]}>
                <Text variant="caption" tone={openTone.color} style={styles.badgeText}>
                  {open.category.toUpperCase()}
                </Text>
              </View>
              <View style={[styles.cardIconTile, { backgroundColor: palette.raised }]}>
                <Icon name={openIcon} size={18} tone={openTone.color} />
              </View>
            </View>
            <Text variant="reading">{open.description}</Text>
            {open.detailedInfo ? <Text variant="reading">{open.detailedInfo}</Text> : null}
            <Button
              title={`Source: ${open.sourceName}`}
              icon="external-link"
              variant="quiet"
              fullWidth={false}
              onPress={() => openWebPage(open.sourceUrl)}
            />
          </View>
        ) : null}
      </Sheet>
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
    borderWidth: 1,
    padding: space.lg,
    justifyContent: 'space-between',
    gap: space.md,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.round,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  cardIconTile: {
    width: 32,
    height: 32,
    borderRadius: radii.tile - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    gap: space.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    minHeight: 40,
    justifyContent: 'center',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cardSource: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    marginRight: space.xs,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sheetContent: {
    gap: space.md,
  },
  sheetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
