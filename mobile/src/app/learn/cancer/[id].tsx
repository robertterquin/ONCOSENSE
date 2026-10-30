import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import {
  Button,
  ErrorState,
  Icon,
  LoadingState,
  PressableScale,
  Screen,
  Text,
} from '@/components/ui';
import { useCancerType } from '@/hooks/useCancerInfo';
import { useSelfCheckGuides } from '@/hooks/usePrevention';
import { queryKeys } from '@/hooks/queryKeys';
import { bodySystemForCancer, firstSentence, guideForCancer, iconForCancer } from '@/lib/learn';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';
import type { CancerType } from '@/types/cancerType';

// A cancer type in Learn (redesign Phase 3, header from design refresh Phase 8): the
// header names the cancer and its body system; number tiles count what's on the page and
// jump there, and the related self-check gets its own card with Start. Then signs, risks, how it's found and
// when to see a doctor.

const back = () => (router.canGoBack() ? router.back() : router.replace('/learn'));

const GENERAL_DOCTOR_ADVICE =
  'See a doctor if you notice any of these signs, if a change lasts more than two weeks, ' +
  'or if something just feels different for you. Cancer found early is usually easier to treat, and most changes turn out not to be cancer.';

export default function CancerTypeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  // Opened from the list: show the already-loaded row at once, then refresh.
  const fromList = queryClient
    .getQueryData<CancerType[]>(queryKeys.cancerTypes)
    ?.find((cancer) => cancer.id === id);
  const query = useCancerType(id);
  const cancer = query.data ?? fromList;

  if (!cancer) {
    return (
      <Screen back={{ label: 'Learn', onPress: back }}>
        {query.isError ? (
          <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
        ) : (
          <LoadingState message="Loading" />
        )}
      </Screen>
    );
  }
  return <CancerDetails cancer={cancer} />;
}

type SectionKey = 'signs' | 'risk' | 'found' | 'doctor';

/** What each tile counts, singular and plural; a section with nothing in it gets no tile. */
const TILES: { key: SectionKey; one: string; many: string; list: (c: CancerType) => string[] }[] = [
  { key: 'signs', one: 'sign to watch for', many: 'signs to watch for', list: (c) => c.symptoms },
  {
    key: 'risk',
    one: 'thing that raises risk',
    many: 'things that raise risk',
    list: (c) => c.riskFactors,
  },
  { key: 'found', one: 'way it’s found', many: 'ways it’s found', list: (c) => c.screeningMethods },
];

function CancerDetails({ cancer }: { cancer: CancerType }) {
  const { palette } = useDesign();
  const guides = useSelfCheckGuides();
  const guide = guides.data ? guideForCancer(guides.data, cancer) : null;
  const system = bodySystemForCancer(cancer.name);
  const statistic = firstSentence(cancer.statistics);
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const reduceMotion = useReducedMotion();
  const [offsets, setOffsets] = useState<Partial<Record<SectionKey, number>>>({});
  const place = (key: SectionKey) => ({
    onLayout: (event: { nativeEvent: { layout: { y: number } } }) => {
      const y = event.nativeEvent.layout.y;
      setOffsets((current) => (current[key] === y ? current : { ...current, [key]: y }));
    },
  });
  const jump = (key: SectionKey) => {
    const y = offsets[key];
    if (y !== undefined)
      scrollRef.current?.scrollTo({ y: Math.max(0, y - space.md), animated: !reduceMotion });
  };

  return (
    <Screen back={{ label: 'Learn', onPress: back }} background="surface" scrollRef={scrollRef}>
      <View style={styles.header}>
        {system !== 'All' ? (
          <View style={styles.system}>
            <Icon name={iconForCancer(cancer.name)} size={24} tone="action" />
            <Text variant="caption" tone="muted">
              {system}
            </Text>
          </View>
        ) : null}
        <Text variant="display" accessibilityRole="header">
          {cancer.name}
        </Text>
        {statistic ? (
          <Text variant="body" tone="action">
            {statistic}
          </Text>
        ) : null}
      </View>

      <View style={styles.tiles}>
        {TILES.filter((tile) => tile.list(cancer).length).map((tile) => {
          const count = tile.list(cancer).length;
          const label = count === 1 ? tile.one : tile.many;
          return (
            <PressableScale
              key={tile.key}
              accessibilityRole="button"
              accessibilityLabel={`${count} ${label}`}
              accessibilityHint="Scrolls to that part of the page"
              onPress={() => jump(tile.key)}
              style={[styles.tile, { backgroundColor: palette.raised }]}>
              <Text variant="title">{String(count)}</Text>
              <Text variant="caption" tone="muted">
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {guide ? (
        <View style={[styles.selfCheck, { backgroundColor: palette.panel }]}>
          <View style={styles.checkText}>
            <Text variant="strong" tone="onPanel">
              {guide.title}
            </Text>
            <Text variant="caption" tone="onPanelMuted">
              {guide.frequency}, about 10 minutes
            </Text>
          </View>
          <Button
            title="Start"
            variant="onPanel"
            small
            fullWidth={false}
            accessibilityHint={`Opens the ${guide.title} guide`}
            onPress={() => router.push({ pathname: '/learn/check/[id]', params: { id: guide.id } })}
          />
        </View>
      ) : null}

      <Text variant="reading">{cancer.description}</Text>

      <View {...place('signs')}>
        <Topic title="Signs to watch for" items={cancer.symptoms} />
      </View>
      <View {...place('risk')}>
        <Topic title="Who has a higher risk" items={cancer.riskFactors} />
      </View>
      <View {...place('found')}>
        <Topic title="How it’s found" items={cancer.screeningMethods}>
          {cancer.earlyDetectionInfo ? (
            <Text variant="reading">{cancer.earlyDetectionInfo}</Text>
          ) : null}
          <Button
            title="Find a screening center"
            icon="hospital"
            variant="quiet"
            small
            style={styles.link}
            onPress={() => router.navigate({ pathname: '/help', params: { section: 'screening' } })}
          />
        </Topic>
      </View>
      <View {...place('doctor')}>
        <Topic title="When to see a doctor" items={[]}>
          <Text variant="reading">{guide?.whenToSeeDoctor || GENERAL_DOCTOR_ADVICE}</Text>
        </Topic>
      </View>

      <Text variant="supporting" tone="muted" style={styles.footer}>
        This is general information, not medical advice. Talk to a doctor about your own health.
      </Text>
    </Screen>
  );
}

function Topic({
  title,
  items,
  children,
}: {
  title: string;
  items: string[];
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.topic}>
      <Text variant="section" accessibilityRole="header">
        {title}
      </Text>
      {items.map((item) => (
        <View key={item} style={styles.bullet}>
          <Text variant="reading" tone="action" accessibilityElementsHidden>
            •
          </Text>
          <Text variant="reading" style={styles.flex}>
            {item}
          </Text>
        </View>
      ))}
      {/* A paragraph after a list needs more room than between bullets. */}
      {children ? <View style={items.length ? styles.afterList : null}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  checkText: { flex: 1, gap: 2 },
  tiles: { flexDirection: 'row', gap: space.sm },
  // Three across; the number leads and the label wraps under it.
  tile: { flex: 1, gap: 2, padding: space.md, borderRadius: radii.tile },
  selfCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.section,
  },
  header: { gap: space.sm },
  system: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  // Lines up with the text above; the pill's padding sits outside it.
  link: { alignSelf: 'flex-start', marginLeft: -space.lg },
  topic: { gap: space.sm, paddingTop: space.sm },
  bullet: { flexDirection: 'row', gap: space.sm },
  afterList: { marginTop: space.sm },
  footer: { paddingTop: space.lg },
});
