'use client';

import { use, useEffect, useMemo, useState } from 'react';
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
  Skeleton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useEvent, useUpdateEvent, useEventStats } from '@/hooks/useEvents';
import { DashboardStats } from '@/components/DashboardStats';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const ticketTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name required'),
  price: z.number().min(0, 'Price must be at least 0'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
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

type EditEventForm = z.infer<typeof schema>;

function toDateTimeLocal(value?: string) {
  if (!value) return '';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  const offset = parsed.getTimezoneOffset();
  const local = new Date(parsed.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function DashboardEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const toast = useToast();
  const { data: event, isLoading, error } = useEvent(id);
  const { data: stats, isLoading: statsLoading } = useEventStats(id);
  const updateEvent = useUpdateEvent(id);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialValues = useMemo<EditEventForm>(() => {
    const venue =
      typeof event?.venue === 'string'
        ? { name: event.venue, city: '' }
        : {
            name: event?.venue?.name ?? '',
            city: event?.venue?.city ?? '',
          };

    return {
      name: event?.name ?? '',
      description: event?.description ?? '',
      venueName: venue.name,
      venueCity: venue.city,
      startTime: toDateTimeLocal(event?.startTime ?? event?.date),
      endTime: toDateTimeLocal(event?.endTime),
      ticketTypes:
        event?.ticketTypes?.map((tt) => ({
          id: tt.id,
          name: tt.name,
          price: Number(tt.price),
          quantity: Number(tt.quantity),
        })) ?? [],
    };
  }, [event]);

  const form = useForm<EditEventForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      venueName: '',
      venueCity: '',
      startTime: '',
      endTime: '',
      ticketTypes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ticketTypes',
  });

  useEffect(() => {
    if (!event) return;
    form.reset(initialValues);
  }, [event, form, initialValues]);

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
          id: tt.id,
          name: tt.name,
          price: Number(tt.price),
          quantity: Number(tt.quantity),
        })),
      };

      await updateEvent.mutateAsync(payload);
      toast({ title: 'Event updated', status: 'success' });
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  });

  if (error) {
    return (
      <ProtectedRoute>
        <Container maxW="4xl" py={8}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {(error as Error).message}
          </Alert>
        </Container>
      </ProtectedRoute>
    );
  }

  if (isLoading || !event) {
    return (
      <ProtectedRoute>
        <Container maxW="2xl" py={8}>
          <Skeleton height="400px" borderRadius="lg" />
        </Container>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Container maxW="4xl" py={8} px={4}>
        <HStack mb={6} spacing={4} flexWrap="wrap">
          <Button as={Link} href="/dashboard" size="sm" variant="ghost">
            Back to dashboard
          </Button>
          <Heading size="lg">{event.name}</Heading>
        </HStack>

        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>Overview & stats</Tab>
            <Tab>Edit event</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0} pt={6}>
              <DashboardStats stats={stats} isLoading={statsLoading} />
            </TabPanel>

            <TabPanel px={0} pt={6}>
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
                        <Input {...form.register('name')} />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea {...form.register('description')} rows={3} />
                      </FormControl>

                      <FormControl isInvalid={!!form.formState.errors.venueName}>
                        <FormLabel>Venue name</FormLabel>
                        <Input {...form.register('venueName')} />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Venue city</FormLabel>
                        <Input {...form.register('venueCity')} />
                      </FormControl>

                      <FormControl isInvalid={!!form.formState.errors.startTime}>
                        <FormLabel>Start date & time</FormLabel>
                        <Input
                          {...form.register('startTime')}
                          type="datetime-local"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>End date & time</FormLabel>
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
                              <FormControl flex={2}>
                                <FormLabel fontSize="sm">Name</FormLabel>
                                <Input
                                  size="sm"
                                  {...form.register(`ticketTypes.${index}.name`)}
                                />
                              </FormControl>

                              <FormControl flex={1}>
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

                              <FormControl flex={1}>
                                <FormLabel fontSize="sm">Qty</FormLabel>
                                <Input
                                  size="sm"
                                  type="number"
                                  {...form.register(
                                    `ticketTypes.${index}.quantity`,
                                    {
                                      valueAsNumber: true,
                                    }
                                  )}
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
                      </Box>

                      <HStack w="100%" justify="flex-end" pt={4}>
                        <Button
                          type="submit"
                          colorScheme="brand"
                          isLoading={updateEvent.isPending}
                          loadingText="Saving..."
                        >
                          Save changes
                        </Button>
                      </HStack>
                    </VStack>
                  </form>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </ProtectedRoute>
  );
}
