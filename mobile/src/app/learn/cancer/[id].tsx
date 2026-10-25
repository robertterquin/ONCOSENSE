import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { ErrorState, LoadingState, Chip, ListRow, Screen, Section, Text } from '@/components/ui';
import { useCancerType } from '@/hooks/useCancerInfo';
import { useSelfCheckGuides } from '@/hooks/usePrevention';
import { queryKeys } from '@/hooks/queryKeys';
import { guideForCancer, iconForCancer } from '@/lib/learn';
import { space } from '@/theme/tokens';
import type { CancerType } from '@/types/cancerType';

// A cancer type in Learn (redesign Phase 3): signs, risks, how it's found and when to
// see a doctor, with "On this page" links, the related self-check and screening centers.

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

const ON_THIS_PAGE: { key: SectionKey; label: string }[] = [
  { key: 'signs', label: 'Signs' },
  { key: 'risk', label: 'Risks' },
  { key: 'found', label: 'How it’s found' },
  { key: 'doctor', label: 'When to see a doctor' },
];

function CancerDetails({ cancer }: { cancer: CancerType }) {
  const guides = useSelfCheckGuides();
  const guide = guides.data ? guideForCancer(guides.data, cancer) : null;
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
    <Screen
      back={{ label: 'Learn', onPress: back }}
      title={cancer.name}
      titleSize="display"
      background="surface"
      scrollRef={scrollRef}>
      <Text variant="reading">{cancer.description}</Text>

      <View style={styles.onThisPage}>
        <Text variant="caption" tone="muted">
          On this page
        </Text>
        <View style={styles.chips}>
          {ON_THIS_PAGE.map((item) => (
            <Chip
              key={item.key}
              kind="radio"
              label={item.label}
              selected={false}
              onPress={() => jump(item.key)}
            />
          ))}
        </View>
      </View>

      <Section look="plain">
        {guide ? (
          <ListRow
            icon={iconForCancer(guide.cancerType)}
            iconTone="rose"
            title={guide.title}
            subtitle={`${guide.frequency} self-check, about 10 minutes`}
            onPress={() => router.push({ pathname: '/learn/check/[id]', params: { id: guide.id } })}
          />
        ) : null}
        <ListRow
          icon="map-pin"
          iconTone="help"
          title="Find a screening center"
          subtitle="Screening centers near you, in Help"
          onPress={() => router.navigate({ pathname: '/help', params: { section: 'screening' } })}
        />
      </Section>

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
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  onThisPage: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  topic: { gap: space.sm, paddingTop: space.sm },
  bullet: { flexDirection: 'row', gap: space.sm },
  footer: { paddingTop: space.lg },
});
