'use client';

import { use, useEffect, useMemo } from 'react';
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
  Divider,
  Badge,
  HStack,
  Icon,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from '@chakra-ui/icons';
import { useEvent } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { TicketTypeSelector } from '@/components/TicketTypeSelector';
// import { ordersApi } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  capacity: number;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const quantitiesSchema = z
  .object({
    quantities: z.record(z.number().min(0).int()),
  })
  .refine(
    (data) => Object.values(data.quantities ?? {}).some((q) => q > 0),
    { message: 'Select at least one ticket to continue.' }
  );

type QuantitiesForm = z.infer<typeof quantitiesSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// ─── Order summary sidebar ────────────────────────────────────────────────────

function OrderSummary({
  ticketTypes,
  quantities,
}: {
  ticketTypes: TicketType[];
  quantities: Record<string, number>;
}) {
  const lineItems = ticketTypes
    .map((tt) => ({
      ...tt,
      qty: quantities[tt.id] ?? 0,
      subtotal: (quantities[tt.id] ?? 0) * Number(tt.price),
    }))
    .filter((item) => item.qty > 0);

  const total = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  const hasItems = lineItems.length > 0;

  return (
    <Card variant="outline" position="sticky" top="6">
      <CardBody p={5}>
        <Text fontWeight="500" fontSize="sm" mb={3}>
          Order summary
        </Text>

        {!hasItems ? (
          <Text fontSize="sm" color="gray.400" py={2}>
            No tickets selected yet.
          </Text>
        ) : (
          <>
            <Flex direction="column" gap={2} mb={3}>
              {lineItems.map((item) => (
                <Flex key={item.id} justify="space-between" fontSize="sm">
                  <Text color="gray.600">
                    {item.qty} × {item.name}
                  </Text>
                  <Text fontWeight="500">{formatCurrency(item.subtotal)}</Text>
                </Flex>
              ))}
            </Flex>
            <Divider mb={3} />
            <Flex justify="space-between" fontWeight="500">
              <Text>Total</Text>
              <Text>{formatCurrency(total)}</Text>
            </Flex>
          </>
        )}

        {/* Ticket type price list (always visible) */}
        <Divider my={4} />
        <Text fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="wide">
          Ticket prices
        </Text>
        <Flex direction="column" gap={1}>
          {ticketTypes.map((tt) => (
            <Flex key={tt.id} justify="space-between" fontSize="sm">
              <Text color="gray.600" noOfLines={1}>
                {tt.name}
              </Text>
              <Text color="gray.500">{formatCurrency(Number(tt.price))}</Text>
            </Flex>
          ))}
        </Flex>
      </CardBody>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Correctly unwrap the params promise
  const { id } = use(params);

  const router = useRouter();
  const toast = useToast();
  const { data: event, isLoading, error } = useEvent(id);
  const { isAuthenticated } = useAuth();

  // Build stable default quantities whenever ticketTypes change
  const defaultQuantities = useMemo(
    () =>
      (event?.ticketTypes ?? []).reduce<Record<string, number>>(
        (acc, tt) => ({ ...acc, [tt.id]: 0 }),
        {}
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event?.id]
  );

  const form = useForm<QuantitiesForm>({
    resolver: zodResolver(quantitiesSchema),
    defaultValues: { quantities: defaultQuantities },
  });

  // Reset form when event loads (avoids stale defaults)
  useEffect(() => {
    form.reset({ quantities: defaultQuantities });
  }, [defaultQuantities, form]);

  // Watch quantities for the live order summary
  const watchedQuantities = form.watch('quantities') ?? {};

  // ── Submit ── create one order for all selected ticket types
  const onSubmit = async (data: QuantitiesForm) => {
    if (!event) return;

    if (!isAuthenticated) {
      toast({ title: 'Please log in to buy tickets', status: 'warning' });
      return;
    }

    const items = Object.entries(data.quantities ?? {})
      .filter(([, qty]) => qty > 0)
      .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

    try {
      const order = await ordersApi.create({ eventId: event.id, items });
      toast({
        title: 'Order created',
        description: 'Redirecting to checkout…',
        status: 'success',
        duration: 2000,
      });
      router.push(`/checkout/${order.id}`);
    } catch (err) {
      toast({
        title: 'Could not create order',
        description: (err as Error).message,
        status: 'error',
      });
    }
  };

  // ── Error state ──────────────────────────────────────────────────────────
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

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading || !event) {
    return (
      <Container maxW="4xl" py={8}>
        <Skeleton height="40px" borderRadius="md" mb={4} width="60%" />
        <Skeleton height="20px" borderRadius="md" mb={8} width="40%" />
        <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
          <Skeleton flex={1} height="360px" borderRadius="lg" />
          <Skeleton w={{ base: '100%', lg: '280px' }} height="260px" borderRadius="lg" flexShrink={0} />
        </Flex>
      </Container>
    );
  }

  const venueName = typeof event.venue === 'string'
    ? event.venue
    : `${event.venue?.name}, ${event.venue?.city}`;

  const isPast = new Date(event.startTime) < new Date();

  return (
    <Container maxW="4xl" py={8} px={4}>

      {/* Event header */}
      <Box mb={8}>
        <HStack mb={2} gap={2}>
          {!event.isPublished && (
            <Badge colorScheme="yellow">Draft</Badge>
          )}
          {isPast && (
            <Badge colorScheme="gray">Past event</Badge>
          )}
        </HStack>

        <Heading size="xl" mb={3}>
          {event.name}
        </Heading>

        <Flex direction="column" gap={1}>
          <HStack color="gray.500" fontSize="md" spacing={2}>
            <CalendarIcon boxSize={4} />
            <Text>{formatDate(event.startTime)}</Text>
          </HStack>
          <HStack color="gray.500" fontSize="md" spacing={2}>
            <Icon viewBox="0 0 24 24" boxSize={4}>
              <path
                fill="currentColor"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
              />
            </Icon>
            <Text>{venueName}</Text>
          </HStack>
        </Flex>
      </Box>

      <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>

        {/* Left column */}
        <Box flex={1} minW={0}>
          {event.description && (
            <Card variant="outline" mb={4}>
              <CardBody>
                <Text color="gray.700" lineHeight="tall" whiteSpace="pre-wrap">
                  {event.description}
                </Text>
              </CardBody>
            </Card>
          )}

          {isPast ? (
            <Card variant="outline" bg="gray.50">
              <CardBody>
                <Text color="gray.500" textAlign="center" py={4}>
                  Ticket sales for this event have closed.
                </Text>
              </CardBody>
            </Card>
          ) : (
            <Card variant="outline">
              <CardBody>
                <Heading size="sm" mb={4}>
                  Select tickets
                </Heading>

                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                    <TicketTypeSelector
                      ticketTypes={event.ticketTypes ?? []}
                      name="quantities"
                    />

                    {form.formState.errors.quantities && (
                      <Text color="red.500" fontSize="sm" mt={3}>
                        {String(form.formState.errors.quantities.message)}
                      </Text>
                    )}

                    <Flex mt={6} gap={3} align="center">
                      {isAuthenticated ? (
                        <Button
                          type="submit"
                          colorScheme="brand"
                          loadingText="Creating order…"
                          isLoading={form.formState.isSubmitting}
                        >
                          Proceed to checkout
                        </Button>
                      ) : (
                        <Button
                          as={Link}
                          href={`/auth/login?redirect=/events/${event.id}`}
                          colorScheme="brand"
                        >
                          Log in to buy tickets
                        </Button>
                      )}
                    </Flex>
                  </form>
                </FormProvider>
              </CardBody>
            </Card>
          )}
        </Box>

        {/* Right sidebar — order summary */}
        {!isPast && (event.ticketTypes ?? []).length > 0 && (
          <Box w={{ base: '100%', lg: '280px' }} flexShrink={0}>
            <OrderSummary
              ticketTypes={event.ticketTypes ?? []}
              quantities={watchedQuantities}
            />
          </Box>
        )}
      </Flex>
    </Container>
  );
}