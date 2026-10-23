import { StyleSheet, View } from 'react-native';

import { PASSWORD_REQUIREMENTS } from '@/constants/validation';
import { useTheme } from '@/theme/useTheme';

import { AppText } from './AppText';
import { MaterialIcon } from './MaterialIcon';

const MET = '#43A047';

/** Live list of new-password rules (register and change-password screens). */
export function PasswordChecklist({ password }: { password: string }) {
  const { isDark } = useTheme();
  return (
    <View
      style={[styles.box, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FAFAFA' }]}
      accessibilityLabel="Password requirements">
      <AppText variant="label" color={isDark ? 'rgba(255,255,255,0.8)' : '#424242'}>
        Password must have:
      </AppText>
      {PASSWORD_REQUIREMENTS.map((rule) => {
        const met = rule.test(password);
        return (
          <View key={rule.label} style={styles.row}>
            <MaterialIcon
              name={met ? 'check_circle' : 'radio_button_unchecked'}
              size={16}
              color={met ? MET : '#BDBDBD'}
            />
            <AppText variant="bodySmall" color={met ? MET : '#757575'}>
              {rule.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 4, padding: 12, borderRadius: 12, marginTop: -4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
