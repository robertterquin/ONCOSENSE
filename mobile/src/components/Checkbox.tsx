import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { brand } from '@/theme/colors';

import { AppText } from './AppText';
import { MaterialIcon } from './MaterialIcon';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Plain text, or custom content such as styled links. */
  label: ReactNode;
  accessibilityLabel?: string;
};

/** Pink checkbox with a tappable label. */
export function Checkbox({ checked, onChange, label, accessibilityLabel }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel ?? (typeof label === 'string' ? label : undefined)}
      onPress={() => onChange(!checked)}
      hitSlop={6}
      style={styles.row}>
      <View style={[styles.box, checked && styles.checked]}>
        {checked ? <MaterialIcon name="check" size={16} color={brand.white} /> : null}
      </View>
      {typeof label === 'string' ? <AppText style={styles.label}>{label}</AppText> : label}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#757575',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: brand.primaryPink,
    borderColor: brand.primaryPink,
  },
  label: {
    flexShrink: 1,
  },
});
