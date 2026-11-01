import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { haptics } from '@/lib/haptics';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { DateField } from './DateField';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Section } from './Section';
import { Sheet } from './Sheet';
import { Text } from './Text';

// Rows for iOS grouped forms, used inside a `Section` card: a label on the left and the
// value on the right, like Calendar's New Event.

type PickerRowProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** One choice from a list: the row shows it, and a sheet of checkmarked options changes it. */
export function PickerRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: PickerRowProps<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value)?.label ?? '';
  return (
    <>
      <PressableScale
        feedback="fade"
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${current}`}
        accessibilityHint="Opens the choices"
        onPress={() => setOpen(true)}
        style={styles.row}>
        <Text variant="row" style={styles.label}>
          {label}
        </Text>
        <Text variant="row" tone="action" numberOfLines={1} style={styles.value}>
          {current}
        </Text>
        <Icon name="selector" size={18} tone="action" />
      </PressableScale>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <Section>
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <PressableScale
                key={option.value}
                feedback="fade"
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => {
                  haptics.selection();
                  onChange(option.value);
                  setOpen(false);
                }}
                style={styles.row}>
                <Text variant={selected ? 'strong' : 'row'} style={styles.label}>
                  {option.label}
                </Text>
                {selected ? <Icon name="check" size={22} tone="action" bold /> : null}
              </PressableScale>
            );
          })}
        </Section>
      </Sheet>
    </>
  );
}

type DateRowProps = {
  label: string;
  /** The formatted date or time shown in the pill. */
  text: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
  minimumDate?: Date;
  maximumDate?: Date;
};

/** A date or time in a pill; tapping opens the picker under the row. */
export function DateRow({ label, text, ...picker }: DateRowProps) {
  const { palette } = useDesign();
  return (
    <DateField {...picker} accessibilityLabel={`${label}, ${text}`}>
      <View style={styles.row}>
        <Text variant="row" style={styles.label}>
          {label}
        </Text>
        <View style={[styles.pill, { backgroundColor: palette.raised }]}>
          <Text variant="row">{text}</Text>
        </View>
      </View>
    </DateField>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: sizes.button,
    paddingVertical: space.sm,
  },
  label: { flex: 1 },
  value: { flexShrink: 1, textAlign: 'right' },
  pill: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radii.tile - 4,
  },
});
