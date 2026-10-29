import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { ResourceRow } from '@/components/help/ResourceRow';
import {
  ErrorState,
  LoadingState,
  Button,
  Chip,
  IconButton,
  ListRow,
  Screen,
  Section,
  Text,
} from '@/components/ui';
import { CRISIS_LINE } from '@/constants/crisis';
import { useAllResources } from '@/hooks/useResources';
import { HELP_SECTIONS, isNear, REGIONS, type HelpSection, type Region } from '@/lib/help';
import { callPhone } from '@/lib/links';
import { space } from '@/theme/tokens';
import type { Resource } from '@/types/resource';

// The Help tab (redesign Phase 5): the crisis line first, then hotlines, screening
// centers, help with costs and support groups, filtered by region. Learn opens it at
// screening centers (`?section=screening`).

/** Rows shown in a section before "Show N more". */
const FIRST_ROWS = 3;

export default function HelpTab() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const resources = useAllResources();
  const [region, setRegion] = useState<Region | null>(null);
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const reduceMotion = useReducedMotion();
  const [offsets, setOffsets] = useState<Record<string, number>>({});

  // On every visit with `?section=` (the tab stays mounted), once the sections are laid out.
  useFocusEffect(
    useCallback(() => {
      const y = section ? offsets[section] : undefined;
      if (y !== undefined)
        scrollRef.current?.scrollTo({ y: Math.max(0, y - space.md), animated: !reduceMotion });
    }, [section, offsets, reduceMotion]),
  );

  return (
    <Screen
      inTabs
      tab="help"
      title="Get help"
      subtitle="Hotlines, screening centers and support across the Philippines"
      titleAside={
        <IconButton
          icon="search"
          accessibilityLabel="Search OncoSense"
          look="tinted"
          onPress={() => router.push('/search')}
        />
      }
      onRefresh={() => resources.refetch()}
      refreshing={resources.isRefetching}
      scrollRef={scrollRef}>
      <CrisisPanel />

      <View style={styles.near}>
        <Text variant="row">Near</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          accessibilityRole="radiogroup"
          accessibilityLabel="Near">
          {[null, ...REGIONS].map((option) => (
            <Chip
              key={option ?? 'all'}
              kind="radio"
              tone="help"
              label={option ?? 'All of the Philippines'}
              selected={region === option}
              onPress={() => setRegion(option)}
            />
          ))}
        </ScrollView>
      </View>

      {resources.isPending ? (
        <LoadingState variant="help" message="Loading help contacts" />
      ) : resources.isError ? (
        <ErrorState
          message="Couldn't load help contacts. Check your connection and try again."
          onRetry={() => resources.refetch()}
        />
      ) : (
        HELP_SECTIONS.map((helpSection) => (
          <View
            key={helpSection.key}
            onLayout={(event) => {
              const y = event.nativeEvent.layout.y;
              setOffsets((current) =>
                current[helpSection.key] === y ? current : { ...current, [helpSection.key]: y },
              );
            }}>
            <ResourceSection
              section={helpSection}
              resources={resources.data[helpSection.list].filter((r) => isNear(r, region))}
            />
          </View>
        ))
      )}
    </Screen>
  );
}

/** "Feeling overwhelmed?" with one big call button that works offline. */
function CrisisPanel() {
  return (
    <Section look="tinted" tint="help" divided={false}>
      <View style={styles.crisis}>
        <Text variant="section" tone="surface" accessibilityRole="header">
          Feeling overwhelmed?
        </Text>
        <Text variant="body" tone="surface">
          Talk to someone now. The {CRISIS_LINE.name} is free and open 24 hours.
        </Text>
        <Button
          title={`Call ${CRISIS_LINE.display}`}
          icon="phone"
          variant="onHelp"
          accessibilityHint={`Calls the ${CRISIS_LINE.name}`}
          onPress={() => callPhone(CRISIS_LINE.dial)}
        />
      </View>
    </Section>
  );
}

function ResourceSection({ section, resources }: { section: HelpSection; resources: Resource[] }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? resources : resources.slice(0, FIRST_ROWS);
  const hidden = resources.length - shown.length;
  return (
    <Section title={section.title}>
      {resources.length === 0 ? (
        <ListRow title={section.empty} titleTone="muted" />
      ) : (
        shown.map((resource) => <ResourceRow key={resource.id} resource={resource} />)
      )}
      {hidden > 0 ? (
        <ListRow
          title={`Show ${hidden} more`}
          titleTone="action"
          onPress={() => setShowAll(true)}
        />
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  near: { gap: space.sm },
  chips: { gap: space.sm, paddingRight: space.xl },
  crisis: { gap: space.md },
});
