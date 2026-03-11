'use client';

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
} from '@chakra-ui/react';
import { useController, Control, FieldPath, FieldValues } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'name'> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  type?: string;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  ...inputProps
}: FormInputProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel>{label}</FormLabel>
      <Input {...field} type={type} {...inputProps} />
      <FormErrorMessage>{error?.message}</FormErrorMessage>
    </FormControl>
  );
}
