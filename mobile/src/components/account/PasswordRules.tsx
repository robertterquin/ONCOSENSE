import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon, Text } from '@/components/ui';
import { PASSWORD_REQUIREMENTS } from '@/constants/validation';
import { DURATION } from '@/theme/motion';
import { space } from '@/theme/tokens';

// Live list of new-password rules (Create account, Change password). Each rule shows
// a check or an empty circle, so state isn't told by color alone.

const TICK = FadeIn.duration(DURATION.base);

export function PasswordRules({ password }: { password: string }) {
  return (
    <View style={styles.list} accessibilityLabel="Password rules">
      {PASSWORD_REQUIREMENTS.map((rule) => {
        const met = rule.test(password);
        return (
          <View
            key={rule.label}
            style={styles.row}
            accessible
            accessibilityLabel={`${rule.label}, ${met ? 'done' : 'not yet'}`}>
            {/* Keyed on the state, so the tick fades in when a rule is met. */}
            <Animated.View key={String(met)} entering={TICK}>
              <Icon
                name={met ? 'circle-check' : 'circle'}
                size={18}
                tone={met ? 'help' : 'muted'}
              />
            </Animated.View>
            <Text variant="supporting" tone={met ? 'ink' : 'muted'}>
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
