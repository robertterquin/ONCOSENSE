import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { SeeADoctor } from '@/components/learn/SeeADoctor';
import {
  BottomActionBar,
  Button,
  ErrorState,
  LoadingState,
  Screen,
  Section,
  Text,
} from '@/components/ui';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { cancerKeyword } from '@/lib/help';
import { signsId } from '@/lib/screening';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';

// Warning signs for a followed cancer with no check or test (design refresh Phase 23):
// its signs, and every 3 months "any of these lasting 2 weeks or more?". "Yes" shows the
// same next steps as a self-check that noted a change.

const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));

export default function WarningSignsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cancers = useCancerTypes();
  const cancer = cancers.data?.find((item) => cancerKeyword(item.name) === id);
  const markDone = useSelfCheckStore((state) => state.markDone);
  const [noticed, setNoticed] = useState(false);

  if (!cancer) {
    return (
      <Screen back={{ label: 'Back', onPress: back }}>
        {cancers.isPending ? (
          <LoadingState message="Loading the signs" />
        ) : (
          <ErrorState message="This cancer isn't in Learn any more." />
        )}
      </Screen>
    );
  }

  const answer = (changed: boolean) => {
    markDone(signsId(id), new Date(), changed);
    if (changed) return setNoticed(true);
    showToast("Thanks. We'll ask again in 3 months.", 'success');
    back();
  };

  return (
    <Screen
      back={{ label: 'Back', onPress: back }}
      title={cancer.name}
      subtitle="Know the warning signs"
      bottomBar={
        noticed ? (
          <BottomActionBar>
            <Button title="Done" onPress={back} />
          </BottomActionBar>
        ) : (
          <BottomActionBar>
            <Button
              title="No, all fine"
              variant="secondary"
              onPress={() => answer(false)}
              style={styles.flex1}
            />
            <Button
              title="Yes, I've noticed one"
              variant="secondary"
              onPress={() => answer(true)}
              style={styles.flex1}
            />
          </BottomActionBar>
        )
      }>
      {noticed ? (
        <SeeADoctor />
      ) : (
        <>
          <Text variant="reading">
            There&apos;s no screening test for most people with this cancer, so knowing its signs is
            how it&apos;s found early.
          </Text>
          <Text variant="section">Any of these lasting 2 weeks or more?</Text>
          <Section divided={false}>
            {cancer.symptoms.map((sign) => (
              <View key={sign} style={styles.sign}>
                <Text variant="body" tone="action" accessibilityElementsHidden>
                  •
                </Text>
                <Text variant="body" style={styles.flex1}>
                  {sign}
                </Text>
              </View>
            ))}
          </Section>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  sign: { flexDirection: 'row', gap: space.sm, paddingVertical: space.xs },
});
