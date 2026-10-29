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
  ListRow,
  Screen,
  Section,
  Text,
} from '@/components/ui';
import { useCancerType } from '@/hooks/useCancerInfo';
import { useSelfCheckGuides } from '@/hooks/usePrevention';
import { queryKeys } from '@/hooks/queryKeys';
import { bodySystemForCancer, firstSentence, guideForCancer, iconForCancer } from '@/lib/learn';
import { space } from '@/theme/tokens';
import type { CancerType } from '@/types/cancerType';

// A cancer type in Learn (redesign Phase 3, header from design refresh Phase 8): the
// header names the cancer and its body system; its fact rows count what's on the page and
// jump there, and open the related self-check. Then signs, risks, how it's found and
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

/** "6 signs to watch for"; a section with nothing in it gets no row. */
const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function CancerDetails({ cancer }: { cancer: CancerType }) {
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
            <Icon name={iconForCancer(cancer.name)} size={24} tone="rose" />
            <Text variant="caption" tone="muted">
              {system}
            </Text>
          </View>
        ) : null}
        <Text variant="display" accessibilityRole="header">
          {cancer.name}
        </Text>
        {statistic ? (
          <Text variant="body" tone="rose">
            {statistic}
          </Text>
        ) : null}
      </View>

      <Section>
        {cancer.symptoms.length ? (
          <ListRow
            title={plural(cancer.symptoms.length, 'sign to watch for', 'signs to watch for')}
            onPress={() => jump('signs')}
          />
        ) : null}
        {cancer.riskFactors.length ? (
          <ListRow
            title={plural(
              cancer.riskFactors.length,
              'thing that raises risk',
              'things that raise risk',
            )}
            onPress={() => jump('risk')}
          />
        ) : null}
        {cancer.screeningMethods.length ? (
          <ListRow
            title={plural(cancer.screeningMethods.length, 'way it’s found', 'ways it’s found')}
            onPress={() => jump('found')}
          />
        ) : null}
        {guide ? (
          <ListRow
            title={guide.title}
            subtitle={`${guide.frequency} self-check, about 10 minutes`}
            titleTone="rose"
            onPress={() => router.push({ pathname: '/learn/check/[id]', params: { id: guide.id } })}
          />
        ) : null}
      </Section>

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
  header: { gap: space.sm },
  system: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  // Lines up with the text above; the pill's padding sits outside it.
  link: { alignSelf: 'flex-start', marginLeft: -space.lg },
  topic: { gap: space.sm, paddingTop: space.sm },
  bullet: { flexDirection: 'row', gap: space.sm },
  afterList: { marginTop: space.sm },
  footer: { paddingTop: space.lg },
});
