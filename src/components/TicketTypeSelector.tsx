'use client';

import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import type { TicketType } from '@/lib/types';

interface TicketTypeSelectorProps {
  ticketTypes: TicketType[];
  name?: string;
}

export function TicketTypeSelector({ ticketTypes, name = 'quantities' }: TicketTypeSelectorProps) {
  const { register, setValue, watch } = useFormContext();
  const quantities = watch(name) as Record<string, number> | undefined;

  return (
    <Box>
      <Text fontWeight="medium" mb={3}>
        Select quantity per ticket type
      </Text>
      <Flex flexDirection="column" gap={4}>
        {ticketTypes.map((tt) => {
          const key = tt.id;
          const max = tt.available ?? tt.quantity ?? 10;
          const value = quantities?.[key] ?? 0;
          return (
            <FormControl key={tt.id}>
              <FormLabel fontSize="sm">
                {tt.name} — ${Number(tt.price).toFixed(2)}
                {max > 0 && (
                  <Text as="span" fontWeight="normal" color="gray.500" ml={2}>
                    (up to {max} left)
                  </Text>
                )}
              </FormLabel>
              <NumberInput
                min={0}
                max={max}
                value={value}
                onChange={(_, val) => {
                  setValue(`${name}.${key}`, isNaN(val) ? 0 : val, {
                    shouldValidate: true,
                  });
                }}
              >
                <NumberInputField
                  {...register(`${name}.${key}`, {
                    valueAsNumber: true,
                    min: 0,
                    max,
                  })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          );
        })}
      </Flex>
    </Box>
  );
}
