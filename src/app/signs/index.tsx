import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { SeeADoctor } from '@/components/learn/SeeADoctor';
import {
  BottomActionBar,
  Button,
  EmptyState,
  Icon,
  ListRow,
  Screen,
  Section,
  Text,
} from '@/components/ui';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { signsId, SIGNS_EVERY_MONTHS, type CancerKey } from '@/lib/screening';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';

// The signs check (design refresh Phase 24; one page per cancer in Phase 23): every
// followed cancer with no self-check or test for this person, on one screen, with one
// question every 3 months. "Yes" asks which, then shows the same next steps as a
// self-check that noted a change.

const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));

export default function SignsCheckScreen() {
  const { signs } = useSelfChecks();
  const markDone = useSelfCheckStore((state) => state.markDone);
  const [step, setStep] = useState<'ask' | 'which' | 'noticed'>('ask');
  const [picked, setPicked] = useState<CancerKey[]>([]);

  const record = (changed: CancerKey[]) => {
    const now = new Date();
    for (const item of signs)
      markDone(signsId(item.cancerKey), now, changed.includes(item.cancerKey));
  };
  const allFine = () => {
    record([]);
    showToast(`Thanks. We'll ask again in ${SIGNS_EVERY_MONTHS} months.`, 'success');
    back();
  };
  const noticed = (keys: CancerKey[]) => {
    record(keys);
    setStep('noticed');
  };
  const toggle = (key: CancerKey) =>
    setPicked((list) =>
      list.includes(key) ? list.filter((item) => item !== key) : [...list, key],
    );

  const bottomBar =
    step === 'noticed' ? (
      <BottomActionBar>
        <Button title="Done" onPress={back} />
      </BottomActionBar>
    ) : step === 'which' ? (
      <BottomActionBar>
        <Button
          title="Back"
          variant="secondary"
          onPress={() => setStep('ask')}
          style={styles.flex1}
        />
        <Button
          title="Continue"
          disabled={!picked.length}
          onPress={() => noticed(picked)}
          style={styles.flex2}
        />
      </BottomActionBar>
    ) : signs.length ? (
      <BottomActionBar>
        <Button title="No, all fine" variant="secondary" onPress={allFine} style={styles.flex1} />
        <Button
          title="Yes, I've noticed one"
          variant="secondary"
          // With one cancer there's nothing to choose.
          onPress={() => (signs.length === 1 ? noticed([signs[0].cancerKey]) : setStep('which'))}
          style={styles.flex1}
        />
      </BottomActionBar>
    ) : undefined;

  return (
    <Screen
      back={{ label: 'Back', onPress: back }}
      title="Signs check"
      subtitle={`Every ${SIGNS_EVERY_MONTHS} months, for the cancers you follow with no test for you.`}
      bottomBar={bottomBar}>
      {step === 'noticed' ? (
        <SeeADoctor />
      ) : !signs.length ? (
        <EmptyState
          icon="info"
          title="No signs check"
          message="Each cancer you follow has a self-check or a test, so there's nothing to ask here."
          action={{ label: 'Your cancers', onPress: () => router.push('/checks') }}
        />
      ) : step === 'which' ? (
        <>
          <Text variant="section">Which ones have you noticed?</Text>
          <Section>
            {signs.map((item) => (
              <ListRow
                key={item.cancerKey}
                title={item.cancer?.name ?? item.cancerKey}
                accessibilityLabel={`${item.cancer?.name ?? item.cancerKey}, ${
                  picked.includes(item.cancerKey) ? 'selected' : 'not selected'
                }`}
                accessory={
                  <Icon
                    name={picked.includes(item.cancerKey) ? 'circle-check' : 'circle'}
                    size={26}
                    tone={picked.includes(item.cancerKey) ? 'action' : 'muted'}
                  />
                }
                onPress={() => toggle(item.cancerKey)}
              />
            ))}
          </Section>
        </>
      ) : (
        <>
          <Text variant="reading">
            These cancers have no screening test for you, so knowing their signs is how they&apos;re
            found early.
          </Text>
          <Text variant="section">Any of these lasting 2 weeks or more?</Text>
          {signs.map((item) => (
            <Section
              key={item.cancerKey}
              title={item.cancer?.name ?? item.cancerKey}
              divided={false}>
              {(item.cancer?.symptoms ?? []).map((sign) => (
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
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  sign: { flexDirection: 'row', gap: space.sm, paddingVertical: space.xs },
});
