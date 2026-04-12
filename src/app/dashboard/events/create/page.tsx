'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  IconButton,
  HStack,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useCreateEvent } from '@/hooks/useEvents';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Name required'),
  price: z.number().min(0, 'Price must be >= 0'),
  quantity: z.number().int().min(1, 'Quantity must be >= 1'),
});

const schema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  venueName: z.string().min(1, 'Venue name is required'),
  venueCity: z.string().optional(),
  startTime: z.string().min(1, 'Start date is required'),
  endTime: z.string().optional(),
  ticketTypes: z.array(ticketTypeSchema).min(1, 'Add at least one ticket type'),
});

type CreateEventForm = z.infer<typeof schema>;

const defaultTicketType: CreateEventForm['ticketTypes'][0] = {
  name: 'General Admission',
  price: 0,
  quantity: 100,
};

export default function CreateEventPage() {
  const router = useRouter();
  const toast = useToast();
  const createEvent = useCreateEvent();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateEventForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      venueName: '',
      venueCity: '',
      startTime: '',
      endTime: '',
      ticketTypes: [{ ...defaultTicketType }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ticketTypes',
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitError(null);

    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        startTime: new Date(data.startTime).toISOString(),
        endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
        venue: {
          name: data.venueName,
          city: data.venueCity || undefined,
        },
        ticketTypes: data.ticketTypes.map((tt) => ({
          name: tt.name,
          price: Number(tt.price),
          quantity: Number(tt.quantity),
        })),
      };

      await createEvent.mutateAsync(payload);

      toast({ title: 'Event created', status: 'success' });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  });

  return (
    <ProtectedRoute>
      <Container maxW="2xl" py={8} px={4}>
        <Heading size="lg" mb={2}>
          Create event
        </Heading>
        <Text color="gray.600" mb={6}>
          Fill in the details and add ticket types
        </Text>

        {submitError && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {submitError}
          </Alert>
        )}

        <Card bg="white">
          <CardBody p={6}>
            <form onSubmit={onSubmit}>
              <VStack spacing={5} align="stretch">
                <FormControl isInvalid={!!form.formState.errors.name}>
                  <FormLabel>Event name</FormLabel>
                  <Input
                    {...form.register('name')}
                    placeholder="Summer Concert 2026"
                  />
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {form.formState.errors.name?.message}
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Description (optional)</FormLabel>
                  <Textarea
                    {...form.register('description')}
                    placeholder="Describe your event..."
                    rows={3}
                  />
                </FormControl>

                <FormControl isInvalid={!!form.formState.errors.venueName}>
                  <FormLabel>Venue name</FormLabel>
                  <Input
                    {...form.register('venueName')}
                    placeholder="Central Park Arena"
                  />
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {form.formState.errors.venueName?.message}
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Venue city (optional)</FormLabel>
                  <Input
                    {...form.register('venueCity')}
                    placeholder="Nairobi"
                  />
                </FormControl>

                <FormControl isInvalid={!!form.formState.errors.startTime}>
                  <FormLabel>Start date & time</FormLabel>
                  <Input
                    {...form.register('startTime')}
                    type="datetime-local"
                  />
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {form.formState.errors.startTime?.message}
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel>End date & time (optional)</FormLabel>
                  <Input
                    {...form.register('endTime')}
                    type="datetime-local"
                  />
                </FormControl>

                <Box w="100%">
                  <FormLabel>Ticket types</FormLabel>
                  <VStack align="stretch" spacing={3} mt={2}>
                    {fields.map((field, index) => (
                      <HStack
                        key={field.id}
                        align="flex-end"
                        spacing={2}
                        p={3}
                        bg="gray.50"
                        borderRadius="md"
                      >
                        <FormControl
                          flex={2}
                          isInvalid={
                            !!form.formState.errors.ticketTypes?.[index]?.name
                          }
                        >
                          <FormLabel fontSize="sm">Name</FormLabel>
                          <Input
                            size="sm"
                            {...form.register(`ticketTypes.${index}.name`)}
                            placeholder="e.g. VIP"
                          />
                        </FormControl>

                        <FormControl
                          flex={1}
                          isInvalid={
                            !!form.formState.errors.ticketTypes?.[index]?.price
                          }
                        >
                          <FormLabel fontSize="sm">Price ($)</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            step="0.01"
                            {...form.register(`ticketTypes.${index}.price`, {
                              valueAsNumber: true,
                            })}
                          />
                        </FormControl>

                        <FormControl
                          flex={1}
                          isInvalid={
                            !!form.formState.errors.ticketTypes?.[index]?.quantity
                          }
                        >
                          <FormLabel fontSize="sm">Qty</FormLabel>
                          <Input
                            size="sm"
                            type="number"
                            {...form.register(`ticketTypes.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                          />
                        </FormControl>

                        <IconButton
                          aria-label="Remove ticket type"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => remove(index)}
                          isDisabled={fields.length <= 1}
                        />
                      </HStack>
                    ))}

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      leftIcon={<AddIcon />}
                      onClick={() =>
                        append({
                          name: '',
                          price: 0,
                          quantity: 10,
                        })
                      }
                    >
                      Add ticket type
                    </Button>
                  </VStack>

                  {typeof form.formState.errors.ticketTypes?.message === 'string' && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {form.formState.errors.ticketTypes.message}
                    </Text>
                  )}
                </Box>

                <HStack w="100%" justify="flex-end" pt={4}>
                  <Button as={Link} href="/dashboard" variant="ghost">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    isLoading={createEvent.isPending}
                    loadingText="Creating..."
                  >
                    Create event
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Container>
    </ProtectedRoute>
  );
}
