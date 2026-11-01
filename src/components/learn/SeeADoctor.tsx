import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, ListRow, Section, Text } from '@/components/ui';
import { callPhone } from '@/lib/links';
import { useIsSignedIn } from '@/stores/authStore';
import { space } from '@/theme/tokens';

// After someone notes a change in a self-check or a warning sign (design refresh Phases
// 22 and 23): what to do next. Nothing is sent anywhere.

const DOH_HOTLINE = '1555';

export function SeeADoctor() {
  const signedIn = useIsSignedIn();
  return (
    <View style={styles.view} accessibilityLiveRegion="polite">
      <Text variant="heading" accessibilityRole="header">
        See a doctor soon
      </Text>
      <Text variant="body" tone="muted">
        You noted a change today. Most changes turn out to be harmless, but only a doctor can tell.
        Book a check-up this week, and bring a note of what you noticed and when.
      </Text>
      <Button
        title="Find a screening center"
        icon="hospital"
        variant="help"
        onPress={() => router.navigate({ pathname: '/help', params: { section: 'screening' } })}
      />
      <Button
        title={`Call the DOH hotline, ${DOH_HOTLINE}`}
        icon="phone"
        variant="secondary"
        onPress={() => callPhone(DOH_HOTLINE)}
      />
      {signedIn ? (
        <Section>
          <ListRow
            icon="calendar"
            title="Add an appointment"
            subtitle="We'll remind you the evening before"
            onPress={() => router.push('/journey/appointment')}
          />
        </Section>
      ) : null}
      <Text variant="supporting" tone="muted">
        OncoSense doesn&apos;t send this to anyone. If you&apos;re worried right now, call your
        doctor.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  view: { gap: space.md, paddingTop: space.md },
});
