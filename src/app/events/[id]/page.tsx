'use client';

import { use, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Skeleton,
  Alert,
  AlertIcon,
  useToast,
  Flex,
  Card,
  CardBody,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEvent } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { TicketTypeSelector } from '@/components/TicketTypeSelector';
import { paymentsApi } from '@/lib/api';

const quantitiesSchema = z.object({
  quantities: z.record(z.number().min(0)),
}).refine(
  (data) => Object.values(data.quantities ?? {}).some((q) => q > 0),
  { message: 'Select at least one ticket' }
);

type QuantitiesForm = z.infer<typeof quantitiesSchema>;

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const { data: event, isLoading, error } = useEvent(id);
  const { isAuthenticated } = useAuth();

  const form = useForm<QuantitiesForm>({
    resolver: zodResolver(quantitiesSchema),
    defaultValues: {
      quantities: event?.ticketTypes?.reduce((acc, tt) => ({ ...acc, [tt.id]: 0 }), {}) ?? {},
    },
  });

  const onSubmit = async (data: QuantitiesForm) => {
    if (!event || !isAuthenticated) {
      toast({ title: 'Please log in to buy tickets', status: 'warning' });
      return;
    }
    try {
      const quantities = data.quantities ?? {};
      for (const [ticketTypeId, qty] of Object.entries(quantities)) {
        if (qty > 0) {
          await paymentsApi.createIntent({
            eventId: event.id,
            ticketTypeId,
            quantity: qty,
          });
        }
      }
      toast({ title: 'Payment intent created', status: 'info', description: 'Complete payment on the next screen.' });
    } catch (err) {
      toast({ title: (err as Error).message, status: 'error' });
    }
  };

  if (error) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {(error as Error).message}
        </Alert>
      </Container>
    );
  }

  if (isLoading || !event) {
    return (
      <Container maxW="4xl" py={8}>
        <Skeleton height="400px" borderRadius="lg" />
      </Container>
    );
  }

  useEffect(() => {
    const defaultQuantities = event.ticketTypes?.reduce(
      (acc, tt) => ({ ...acc, [tt.id]: 0 }),
      {} as Record<string, number>
    ) ?? {};
    form.reset({ quantities: defaultQuantities });
  }, [event?.id, event?.ticketTypes, form]);

  return (
    <Container maxW="4xl" py={8} px={4}>
      <Box mb={8}>
        <Heading size="xl" mb={2}>
          {event.name}
        </Heading>
        <Text color="gray.600" fontSize="lg">
          {event.venue} · {formatDate(event.date)}
        </Text>
      </Box>

      <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
        <Box flex={1}>
          {event.description && (
            <Card bg="white" mb={6}>
              <CardBody>
                <Text>{event.description}</Text>
              </CardBody>
            </Card>
          )}

          <Card bg="white">
            <CardBody>
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <TicketTypeSelector ticketTypes={event.ticketTypes ?? []} name="quantities" />
                  {form.formState.errors.quantities && (
                    <Text color="red.500" fontSize="sm" mt={2}>
                      {String(form.formState.errors.quantities.message)}
                    </Text>
                  )}
                  <Flex mt={6} gap={3}>
                    {isAuthenticated ? (
                      <Button
                        type="submit"
                        colorScheme="brand"
                        loadingText="Loading..."
                        isLoading={form.formState.isSubmitting}
                      >
                        Buy tickets
                      </Button>
                    ) : (
                      <Button as={Link} href={`/auth/login?redirect=/events/${event.id}`} colorScheme="brand">
                        Log in to buy tickets
                      </Button>
                    )}
                  </Flex>
                </form>
              </FormProvider>
            </CardBody>
          </Card>
        </Box>

        <Box w={{ base: '100%', lg: '280px' }} flexShrink={0}>
          <Card bg="gray.50">
            <CardBody>
              <Text fontWeight="semibold" mb={2}>
                Ticket types
              </Text>
              {(event.ticketTypes ?? []).map((tt) => (
                <Flex key={tt.id} justify="space-between" py={2} borderBottomWidth="1px" borderColor="gray.200" _last={{ borderBottom: 'none' }}>
                  <Text>{tt.name}</Text>
                  <Text fontWeight="medium">${Number(tt.price).toFixed(2)}</Text>
                </Flex>
              ))}
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Container>
  );
}
