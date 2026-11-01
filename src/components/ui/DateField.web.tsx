import { createElement } from 'react';
import { View } from 'react-native';

import type { DateFieldProps } from './DateField';

const pad = (value: number) => String(value).padStart(2, '0');
const toInputValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toTimeValue = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** Web version: the browser's native date input, laid invisibly over the display. */
export function DateField({
  value,
  onChange,
  minimumDate,
  maximumDate,
  accessibilityLabel,
  mode = 'date',
  children,
}: DateFieldProps) {
  const time = mode === 'time';
  return (
    <View>
      {children}
      {createElement('input', {
        type: time ? 'time' : 'date',
        'aria-label': accessibilityLabel,
        value: time ? toTimeValue(value) : toInputValue(value),
        min: !time && minimumDate ? toInputValue(minimumDate) : undefined,
        max: !time && maximumDate ? toInputValue(maximumDate) : undefined,
        // Open the calendar wherever the field is clicked, not only on its icon.
        onClick: (event: { currentTarget: { showPicker?: () => void } }) =>
          event.currentTarget.showPicker?.(),
        onChange: (event: { target: { value: string } }) => {
          if (time) {
            const [hours, minutes] = event.target.value.split(':').map(Number);
            if (Number.isInteger(hours) && Number.isInteger(minutes)) {
              const next = new Date(value);
              next.setHours(hours, minutes, 0, 0);
              onChange(next);
            }
            return;
          }
          const [year, month, day] = event.target.value.split('-').map(Number);
          if (year && month && day) onChange(new Date(year, month - 1, day, 12));
        },
        style: {
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
        },
      })}
    </View>
  );
}
