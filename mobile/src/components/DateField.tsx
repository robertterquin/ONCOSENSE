import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { ReactNode } from 'react';
import { Platform, Pressable, View } from 'react-native';

export type DateFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  accessibilityLabel: string;
  /** What to show; tapping it opens the picker. */
  children: ReactNode;
};

/**
 * Tappable date display that opens the platform date picker (Flutter's
 * showDatePicker). iOS shows its compact picker over the content; the web version
 * is in DateField.web.tsx.
 */
export function DateField({
  value,
  onChange,
  minimumDate,
  maximumDate,
  accessibilityLabel,
  children,
}: DateFieldProps) {
  if (Platform.OS === 'ios') {
    return (
      <View accessibilityLabel={accessibilityLabel}>
        {children}
        <DateTimePicker
          value={value}
          mode="date"
          display="compact"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          accentColor="#D81B60"
          onChange={(_event, date) => date && onChange(date)}
          // Invisible, full-size tap target over the custom display.
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.02 }}
        />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() =>
        DateTimePickerAndroid.open({
          value,
          mode: 'date',
          minimumDate,
          maximumDate,
          onChange: (event, date) => {
            if (event.type === 'set' && date) onChange(date);
          },
        })
      }>
      {children}
    </Pressable>
  );
}
