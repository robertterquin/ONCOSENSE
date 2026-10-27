import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Chip, ListRow, Section, Sheet, Tag, Text } from '@/components/ui';
import type { GuideStatus } from '@/hooks/useSelfChecks';
import { formatShortDate } from '@/lib/dates';
import { iconForCancer } from '@/lib/learn';
import { openWebPage } from '@/lib/links';
import { space } from '@/theme/tokens';
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

/** Prevention tips as chips; each opens a sheet with the detail and its source. */
export function LowerYourRisk({ tips }: { tips: PreventionTip[] }) {
  const [open, setOpen] = useState<PreventionTip | null>(null);
  return (
    <Section
      title="Lower your risk"
      subtitle="Everyday habits backed by health agencies"
      look="plain">
      <View style={styles.chips}>
        {tips.map((tip) => (
          <Chip
            key={tip.id}
            label={tip.title}
            selected={false}
            kind="radio"
            onPress={() => setOpen(tip)}
          />
        ))}
      </View>
      <Sheet visible={open !== null} onClose={() => setOpen(null)} title={open?.title ?? ''}>
        {open ? (
          <>
            <Text variant="reading">{open.description}</Text>
            {open.detailedInfo ? <Text variant="reading">{open.detailedInfo}</Text> : null}
            <Button
              title={`Source: ${open.sourceName}`}
              icon="external-link"
              variant="quiet"
              fullWidth={false}
              onPress={() => openWebPage(open.sourceUrl)}
            />
          </>
        ) : null}
      </Sheet>
    </Section>
  );
}

const styles = StyleSheet.create({
  sectionGap: { gap: space.md },
  systems: { gap: space.sm, paddingRight: space.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
