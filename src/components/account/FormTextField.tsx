import type { ComponentProps } from 'react';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

import { TextField } from '@/components/ui';

// The redesign's TextField connected to a react-hook-form field, showing its error.

type FormTextFieldProps<T extends FieldValues> = Omit<
  ComponentProps<typeof TextField>,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> & {
  control: Control<T>;
  name: Path<T>;
};

export function FormTextField<T extends FieldValues>({
  control,
  name,
  ...props
}: FormTextFieldProps<T>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <TextField
      {...props}
      value={field.value ?? ''}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message ?? null}
    />
  );
}
