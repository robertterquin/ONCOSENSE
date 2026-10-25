import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Chip, ListRow, Section, Sheet, Tag, Text, TopicTile } from '@/components/ui';
import type { GuideStatus } from '@/hooks/useSelfChecks';
import { formatShortDate } from '@/lib/dates';
import { iconForCancer } from '@/lib/learn';
import { openWebPage } from '@/lib/links';
import { useDesign } from '@/theme/useTheme';
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

/** Cancer types, A to Z, as a two-column grid (one column at Larger text). */
export function CancerTypes({ cancers }: { cancers: CancerType[] }) {
  const { textSize } = useDesign();
  const sorted = [...cancers].sort((a, b) => a.name.localeCompare(b.name));
  const columns = textSize === 'larger' ? 1 : 2;
  const rows = Array.from({ length: Math.ceil(sorted.length / columns) }, (_, index) =>
    sorted.slice(index * columns, index * columns + columns),
  );
  return (
    <Section title="Cancer types" subtitle="Early signs, risks and how each is found" look="plain">
      {rows.map((row) => (
        <View key={row[0].id} style={styles.gridRow}>
          {row.map((cancer) => (
            <TopicTile
              key={cancer.id}
              icon={iconForCancer(cancer.name)}
              title={cancer.name}
              subtitle={
                cancer.symptoms.length ? `${cancer.symptoms.length} early signs` : undefined
              }
              onPress={() => openCancer(cancer.id)}
            />
          ))}
          {row.length < columns ? <View style={styles.gridFiller} /> : null}
        </View>
      ))}
    </Section>
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  gridRow: { flexDirection: 'row', gap: space.sm },
  gridFiller: { flex: 1 },
});
