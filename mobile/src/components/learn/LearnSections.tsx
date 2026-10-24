import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Chip, ListRow, Section, Sheet, Text } from '@/components/ui';
import type { GuideStatus } from '@/hooks/useSelfChecks';
import { openWebPage } from '@/lib/links';
import { space } from '@/theme/tokens';
import type { CancerType } from '@/types/cancerType';
import type { PreventionTip } from '@/types/preventionTip';

// Learn's three lists in the redesign (docs/redesign/03-phase-3-today-and-learn.md).

const openGuide = (id: string) => router.push({ pathname: '/learn/check/[id]', params: { id } });
const openCancer = (id: string) => router.push({ pathname: '/learn/cancer/[id]', params: { id } });

/** One self-check guide with when it is next due ("Due today" in rose). */
export function GuideRow({ status }: { status: GuideStatus }) {
  return (
    <ListRow
      icon="calendar-check"
      iconTone={status.isDue ? 'rose' : 'action'}
      title={status.guide.title}
      subtitle={`${status.guide.frequency} · ${status.label}`}
      subtitleTone={status.isDue ? 'rose' : 'muted'}
      onPress={() => openGuide(status.guide.id)}
    />
  );
}

/** The person's guides first, then the rest on request. */
export function CheckYourself({ mine, all }: { mine: GuideStatus[]; all: GuideStatus[] }) {
  const [showAll, setShowAll] = useState(false);
  const others = all.filter((item) => !mine.some((own) => own.guide.id === item.guide.id));
  return (
    <Section title="Check yourself" subtitle="Short, guided checks you can do at home">
      {mine.map((status) => (
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

/** Cancer types, A to Z. */
export function CancerTypes({ cancers }: { cancers: CancerType[] }) {
  const sorted = [...cancers].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Section title="Cancer types" subtitle="Early signs, risks and how each is found">
      {sorted.map((cancer) => (
        <ListRow key={cancer.id} title={cancer.name} onPress={() => openCancer(cancer.id)} />
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
});
