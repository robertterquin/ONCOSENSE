import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { PASSWORD_REQUIREMENTS } from '@/constants/validation';
import { space } from '@/theme/tokens';

// Live list of new-password rules (Create account, Change password). Each rule shows
// a check or an empty circle, so state isn't told by color alone.

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
            <Icon name={met ? 'circle-check' : 'circle'} size={18} tone={met ? 'help' : 'muted'} />
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
