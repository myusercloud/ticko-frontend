'use client';

import { use, useState, useEffect } from 'react';
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
import type { Event, TicketType } from '@/lib/types';

const ticketTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name required'),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
});

const schema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  venue: z.string().min(1, 'Venue is required'),
  date: z.string().min(1, 'Date is required'),
  ticketTypes: z.array(ticketTypeSchema).min(1, 'Add at least one ticket type'),
});

type EditEventForm = z.infer<typeof schema>;

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

  const form = useForm<EditEventForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      venue: '',
      date: '',
      ticketTypes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ticketTypes',
  });

  useEffect(() => {
    if (!event) return;
    const dateStr = event.date?.slice(0, 16);
    form.reset({
      name: event.name,
      description: event.description ?? '',
      venue: event.venue,
      date: dateStr ?? '',
      ticketTypes:
        event.ticketTypes?.map((tt) => ({
          id: tt.id,
          name: tt.name,
          price: tt.price,
          quantity: tt.quantity,
        })) ?? [],
    });
  }, [event, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        venue: data.venue,
        date: data.date,
        ticketTypes: data.ticketTypes.map((tt) => ({
          id: (tt as { id?: string }).id,
          name: tt.name,
          price: Number(tt.price),
          quantity: Number(tt.quantity),
        })),
      };
      await updateEvent.mutateAsync(payload as never);
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
        <HStack mb={6} spacing={4} wrap="wrap">
          <Button as={Link} href="/dashboard" size="sm" variant="ghost">
            ← Dashboard
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
                        <FormLabel>Description (optional)</FormLabel>
                        <Textarea {...form.register('description')} rows={3} />
                      </FormControl>
                      <FormControl isInvalid={!!form.formState.errors.venue}>
                        <FormLabel>Venue</FormLabel>
                        <Input {...form.register('venue')} />
                      </FormControl>
                      <FormControl isInvalid={!!form.formState.errors.date}>
                        <FormLabel>Date & time</FormLabel>
                        <Input {...form.register('date')} type="datetime-local" />
                      </FormControl>
                      <Box w="100%">
                        <FormLabel>Ticket types</FormLabel>
                        <VStack align="stretch" spacing={3} mt={2}>
                          {fields.map((field, index) => (
                            <HStack key={field.id} align="flex-end" spacing={2} p={3} bg="gray.50" borderRadius="md">
                              <FormControl flex={2}>
                                <FormLabel fontSize="sm">Name</FormLabel>
                                <Input size="sm" {...form.register(`ticketTypes.${index}.name`)} />
                              </FormControl>
                              <FormControl flex={1}>
                                <FormLabel fontSize="sm">Price ($)</FormLabel>
                                <Input
                                  size="sm"
                                  type="number"
                                  step="0.01"
                                  {...form.register(`ticketTypes.${index}.price`, { valueAsNumber: true })}
                                />
                              </FormControl>
                              <FormControl flex={1}>
                                <FormLabel fontSize="sm">Qty</FormLabel>
                                <Input
                                  size="sm"
                                  type="number"
                                  {...form.register(`ticketTypes.${index}.quantity`, { valueAsNumber: true })}
                                />
                              </FormControl>
                              <IconButton
                                aria-label="Remove"
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
                                id: `new-${Date.now()}`,
                                name: '',
                                price: 0,
                                quantity: 10,
                              } as EditEventForm['ticketTypes'][0])
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
