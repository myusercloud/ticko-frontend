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

export function TicketTypeSelector({
  ticketTypes,
  name = 'quantities',
}: TicketTypeSelectorProps) {
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
          const max = tt.available ?? tt.quantity ?? tt.capacity ?? 10;
          const value = quantities?.[key] ?? 0;

          return (
            <FormControl key={tt.id}>
              <FormLabel fontSize="sm">
                {tt.name} - Ksh{Number(tt.price).toFixed(2)}
                {max > 0 && (
                  <Text as="span" fontWeight="normal" color="gray.500" ml={2}>
                    ({max} left)
                  </Text>
                )}
              </FormLabel>

              <NumberInput
                min={0}
                max={max}
                value={value}
                clampValueOnBlur
                onChange={(_, valueAsNumber) => {
                  setValue(
                    `${name}.${key}`,
                    Number.isNaN(valueAsNumber) ? 0 : valueAsNumber,
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    }
                  );
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
                  <NumberIncrementStepper color="#f5efe6" bg="rgba(245,239,230,0.05)" />
                  <NumberDecrementStepper color="#f5efe6" bg="rgba(245,239,230,0.1)" />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          );
        })}
      </Flex>
    </Box>
  );
}
