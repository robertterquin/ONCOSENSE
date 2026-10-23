import { createElement } from 'react';
import { View } from 'react-native';

import type { DateFieldProps } from './DateField';

const pad = (value: number) => String(value).padStart(2, '0');
const toInputValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Web version: the browser's native date input, laid invisibly over the display. */
export function DateField({
  value,
  onChange,
  minimumDate,
  maximumDate,
  accessibilityLabel,
  children,
}: DateFieldProps) {
  return (
    <View>
      {children}
      {createElement('input', {
        type: 'date',
        'aria-label': accessibilityLabel,
        value: toInputValue(value),
        min: minimumDate ? toInputValue(minimumDate) : undefined,
        max: maximumDate ? toInputValue(maximumDate) : undefined,
        // Open the calendar wherever the field is clicked, not only on its icon.
        onClick: (event: { currentTarget: { showPicker?: () => void } }) =>
          event.currentTarget.showPicker?.(),
        onChange: (event: { target: { value: string } }) => {
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
