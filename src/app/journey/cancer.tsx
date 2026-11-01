import { router } from 'expo-router';

import { ErrorState, Icon, ListRow, LoadingState, Screen, Section, Text } from '@/components/ui';
import { useCancerTypes } from '@/hooks/useCancerInfo';
import { useFocus, useMyCancerId, useSaveMyCancer } from '@/hooks/useFocus';
import { forFocus } from '@/lib/focus';
import { haptics } from '@/lib/haptics';
import { showToast } from '@/stores/toastStore';

// "Which cancer?" (a sheet): asked after "What brings you here?" for Treatment,
// Finished and Caring, and from Learn › Cancers to change it. Its guide goes first.

const back = () => (router.canGoBack() ? router.back() : router.replace('/learn'));

export default function WhichCancerScreen() {
  const focus = useFocus();
  const current = useMyCancerId();
  const cancers = useCancerTypes();
  const save = useSaveMyCancer();

  const pick = (id: string) => {
    haptics.selection();
    save.mutate(id, {
      onSuccess: back,
      onError: (error) => showToast(`Couldn't save: ${error.message}`, 'error'),
    });
  };
  const check = (id: string) =>
    current === id ? <Icon name="check" size={22} tone="action" bold /> : <></>;
  const sorted = [...(cancers.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Screen sheet={{ title: 'Which cancer?', onCancel: back }}>
      <Text variant="supporting" tone="muted">
        {forFocus(
          focus,
          "We'll put its guide first in Learn. You can change this any time.",
          "Which cancer does the person you care for have? We'll put its guide first in Learn.",
        )}
      </Text>
      {cancers.isPending ? (
        <LoadingState variant="list" message="Loading cancers" />
      ) : cancers.isError ? (
        <ErrorState message={cancers.error.message} onRetry={() => cancers.refetch()} />
      ) : (
        <>
          <Section>
            {sorted.map((cancer) => (
              <ListRow
                key={cancer.id}
                title={cancer.name}
                accessory={check(cancer.id)}
                accessibilityLabel={current === cancer.id ? `${cancer.name}, selected` : cancer.name}
                onPress={() => pick(cancer.id)}
              />
            ))}
          </Section>
          <Section>
            <ListRow
              title="Not listed, or I'd rather not say"
              accessory={check('none')}
              onPress={() => pick('none')}
            />
          </Section>
        </>
      )}
    </Screen>
  );
}
