import type { ComponentProps } from 'react';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

import { InputField } from './InputField';

type FormFieldProps<T extends FieldValues> = Omit<
  ComponentProps<typeof InputField>,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> & {
  control: Control<T>;
  name: Path<T>;
};

/** `InputField` connected to a react-hook-form field, showing its validation error. */
export function FormField<T extends FieldValues>({ control, name, ...props }: FormFieldProps<T>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <InputField
      {...props}
      value={field.value ?? ''}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}
