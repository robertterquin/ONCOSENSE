import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { useDesign } from '@/theme/useTheme';

export type DateFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  accessibilityLabel: string;
  /** Pick a day (default) or a time of day; the other part of `value` is kept. */
  mode?: 'date' | 'time';
  /** What to show; tapping it opens the picker. */
  children: ReactNode;
};

/**
 * Tappable date or time display that opens the platform picker. On iOS the picker opens
 * under the display (a calendar for dates, a wheel for times) and tapping the display
 * again closes it; Android shows its dialog. The web version is in DateField.web.tsx.
 */
export function DateField({
  value,
  onChange,
  minimumDate,
  maximumDate,
  accessibilityLabel,
  mode = 'date',
  children,
}: DateFieldProps) {
  const { palette, isDark } = useDesign();
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'ios') {
    // The compact picker only opens from its own small label, so the whole display is
    // the button and the full picker appears below it.
    return (
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ expanded: open }}
          accessibilityHint={open ? 'Closes the picker' : 'Opens the picker'}
          onPress={() => setOpen(!open)}>
          {children}
        </Pressable>
        {open ? (
          <DateTimePicker
            value={value}
            mode={mode}
            display={mode === 'time' ? 'spinner' : 'inline'}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            accentColor={palette.action}
            themeVariant={isDark ? 'dark' : 'light'}
            onChange={(_event, date) => date && onChange(date)}
          />
        ) : null}
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
          mode,
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
