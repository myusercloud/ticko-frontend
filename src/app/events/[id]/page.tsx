'use client';

import { useEffect, useMemo, useState } from 'react';
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
  HStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEvent } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { TicketTypeSelector } from '@/components/TicketTypeSelector';
import { ordersApi } from '@/lib/api';
import type { TicketType } from '@/lib/types';

const DATE_LOCALE = 'en-KE';
const DATE_TIME_ZONE = 'Africa/Nairobi';

const quantitiesSchema = z
  .object({ quantities: z.record(z.number().min(0).int()) })
  .refine(
    (data) => Object.values(data.quantities ?? {}).some((q) => q > 0),
    { message: 'Select at least one ticket to continue.' }
  );

type QuantitiesForm = z.infer<typeof quantitiesSchema>;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);

  if (Number.isNaN(d.getTime())) {
    return {
      full: dateStr,
      weekday: '--',
      day: '--',
      month: '---',
      year: '',
      time: '',
    };
  }

  return {
    full: d.toLocaleDateString(DATE_LOCALE, {
      timeZone: DATE_TIME_ZONE,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    weekday: d
      .toLocaleDateString(DATE_LOCALE, {
        timeZone: DATE_TIME_ZONE,
        weekday: 'short',
      })
      .toUpperCase(),
    day: d.toLocaleDateString(DATE_LOCALE, {
      timeZone: DATE_TIME_ZONE,
      day: 'numeric',
    }),
    month: d
      .toLocaleDateString(DATE_LOCALE, {
        timeZone: DATE_TIME_ZONE,
        month: 'short',
      })
      .toUpperCase(),
    year: d.toLocaleDateString(DATE_LOCALE, {
      timeZone: DATE_TIME_ZONE,
      year: 'numeric',
    }),
    time: d.toLocaleTimeString(DATE_LOCALE, {
      timeZone: DATE_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
}

function getVenueLabel(venue?: { name: string; city?: string } | string | null) {
  if (!venue) return 'Venue TBA';
  if (typeof venue === 'string') return venue;
  return venue.city ? `${venue.name}, ${venue.city}` : venue.name;
}

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

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

  return (
    <Box
      bg="rgba(245,239,230,0.04)"
      border="1px solid rgba(245,239,230,0.1)"
      borderRadius="4px"
      overflow="hidden"
      position="sticky"
      top="88px"
    >
      <Box h="1px" bg="rgba(212,140,40,0.5)" />
      <Box p={5}>
        <Text
          fontFamily="'DM Sans', sans-serif"
          fontSize="10px"
          fontWeight="500"
          letterSpacing="0.16em"
          textTransform="uppercase"
          color="rgba(245,239,230,0.35)"
          mb={4}
        >
          Order summary
        </Text>

        {lineItems.length === 0 ? (
          <Text
            fontFamily="'DM Sans', sans-serif"
            fontSize="13px"
            fontWeight="300"
            color="rgba(245,239,230,0.25)"
            fontStyle="italic"
            py={2}
          >
            No tickets selected yet.
          </Text>
        ) : (
          <>
            <Flex direction="column" gap={2} mb={4}>
              {lineItems.map((item) => (
                <Flex key={item.id} justify="space-between" align="baseline">
                  <Text
                    fontFamily="'DM Sans', sans-serif"
                    fontSize="13px"
                    fontWeight="300"
                    color="rgba(245,239,230,0.55)"
                  >
                    {item.qty} x {item.name}
                  </Text>
                  <Text
                    fontFamily="'DM Sans', sans-serif"
                    fontSize="13px"
                    fontWeight="500"
                    color="#f5efe6"
                  >
                    {formatCurrency(item.subtotal)}
                  </Text>
                </Flex>
              ))}
            </Flex>

            <Box h="1px" bg="rgba(245,239,230,0.08)" mb={4} />

            <Flex justify="space-between" align="baseline" mb={1}>
              <Text
                fontFamily="'DM Sans', sans-serif"
                fontSize="11px"
                fontWeight="500"
                letterSpacing="0.1em"
                textTransform="uppercase"
                color="rgba(245,239,230,0.35)"
              >
                Total
              </Text>
              <Text
                fontFamily="'DM Serif Display', Georgia, serif"
                fontStyle="italic"
                fontSize="22px"
                fontWeight="400"
                color="#f5c842"
                letterSpacing="-0.02em"
                lineHeight="1"
              >
                {formatCurrency(total)}
              </Text>
            </Flex>
          </>
        )}

        <Box h="1px" bg="rgba(245,239,230,0.08)" my={4} />
        <Text
          fontFamily="'DM Sans', sans-serif"
          fontSize="10px"
          fontWeight="500"
          letterSpacing="0.14em"
          textTransform="uppercase"
          color="rgba(245,239,230,0.25)"
          mb={3}
        >
          Ticket prices
        </Text>
        <Flex direction="column" gap={2}>
          {ticketTypes.map((tt) => (
            <Flex key={tt.id} justify="space-between" align="center">
              <Text
                fontFamily="'DM Sans', sans-serif"
                fontSize="13px"
                fontWeight="300"
                color="rgba(245,239,230,0.5)"
                noOfLines={1}
              >
                {tt.name}
              </Text>
              <Text
                fontFamily="'DM Sans', sans-serif"
                fontSize="12px"
                fontWeight="400"
                color="rgba(245,239,230,0.35)"
              >
                {formatCurrency(Number(tt.price))}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const toast = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  const { data: event, isLoading, error } = useEvent(id);
  const { isAuthenticated } = useAuth();

  const ticketTypes = event?.ticketTypes ?? [];

  const defaultQuantities = useMemo(
    () =>
      ticketTypes.reduce<Record<string, number>>((acc, tt) => {
        acc[tt.id] = 0;
        return acc;
      }, {}),
    [ticketTypes]
  );

  const form = useForm<QuantitiesForm>({
    resolver: zodResolver(quantitiesSchema),
    defaultValues: { quantities: defaultQuantities },
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    form.reset({ quantities: defaultQuantities });
  }, [defaultQuantities, form]);

  const watchedQuantities = form.watch('quantities') ?? {};

  const onSubmit = async (data: QuantitiesForm) => {
    if (!event) return;

    if (!isAuthenticated) {
      toast({ title: 'Please log in to buy tickets', status: 'warning' });
      router.push(`/auth/login?redirect=/events/${event.id}`);
      return;
    }

    const items = Object.entries(data.quantities ?? {})
      .filter(([, qty]) => qty > 0)
      .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

    try {
      const res = await ordersApi.create({ eventId: event.id, items });
      const order = res.data;
      toast({ title: 'Order created!', status: 'success', duration: 2500 });
      if (order?.id) console.log('Created order id:', order.id);
    } catch (err) {
      toast({
        title: 'Could not create order',
        description: (err as Error).message,
        status: 'error',
      });
    }
  };

  if (error) {
    return (
      <Box
        minH="100vh"
        bg="#0a0908"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <Box textAlign="center">
          <Text
            fontFamily="'DM Serif Display', Georgia, serif"
            fontStyle="italic"
            fontSize="22px"
            color="rgba(245,239,230,0.3)"
            mb={6}
          >
            Something went wrong
          </Text>
          <Alert
            status="error"
            borderRadius="2px"
            bg="rgba(163,45,45,0.18)"
            border="1px solid rgba(163,45,45,0.4)"
            color="rgba(245,239,230,0.8)"
            fontSize="13px"
            fontFamily="'DM Sans', sans-serif"
            maxW="400px"
          >
            <AlertIcon color="#e24b4a" boxSize="14px" />
            {(error as Error).message}
          </Alert>
        </Box>
      </Box>
    );
  }

  if (isLoading || !event) {
    return (
      <Box minH="100vh" bg="#0a0908" pt={{ base: 8, md: 12 }}>
        <Container maxW="4xl" px={{ base: 5, md: 10 }}>
          <Skeleton
            h="12px"
            w="120px"
            mb={10}
            startColor="rgba(245,239,230,0.06)"
            endColor="rgba(245,239,230,0.12)"
            borderRadius="2px"
          />
          <Skeleton
            h="52px"
            w="75%"
            mb={4}
            startColor="rgba(245,239,230,0.06)"
            endColor="rgba(245,239,230,0.12)"
            borderRadius="2px"
          />
          <Skeleton
            h="16px"
            w="45%"
            mb={10}
            startColor="rgba(245,239,230,0.06)"
            endColor="rgba(245,239,230,0.12)"
            borderRadius="2px"
          />
          <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
            <Skeleton
              flex={1}
              h="340px"
              startColor="rgba(245,239,230,0.06)"
              endColor="rgba(245,239,230,0.12)"
              borderRadius="4px"
            />
            <Skeleton
              w={{ base: '100%', lg: '260px' }}
              h="280px"
              startColor="rgba(245,239,230,0.06)"
              endColor="rgba(245,239,230,0.12)"
              borderRadius="4px"
              flexShrink={0}
            />
          </Flex>
        </Container>
      </Box>
    );
  }

  const { full, weekday, day, month, year, time } = formatDate(event.startTime);
  const venueName = getVenueLabel(event.venue);
  const eventStart = new Date(event.startTime);
  const isPast =
    hasMounted &&
    !Number.isNaN(eventStart.getTime()) &&
    eventStart.getTime() < Date.now();
  const isDraft = event.isPublished === false;

  return (
    <Box minH="100vh" bg="#0a0908" fontFamily="'DM Sans', sans-serif" position="relative">
      <Box
        position="fixed"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        w="700px"
        h="300px"
        background="radial-gradient(ellipse at 50% 0%, rgba(212,140,40,0.09) 0%, transparent 70%)"
        pointerEvents="none"
        zIndex={0}
      />

      <Container
        maxW="4xl"
        px={{ base: 5, md: 8 }}
        pt={{ base: 8, md: 12 }}
        pb={20}
        position="relative"
        zIndex={1}
      >
        <Box mb={10} animation={`${fadeUp} 0.4s ease both`}>
          <Button
            variant="unstyled"
            fontFamily="'DM Sans', sans-serif"
            fontSize="12px"
            fontWeight="400"
            letterSpacing="0.08em"
            color="rgba(245,239,230,0.25)"
            display="inline-flex"
            alignItems="center"
            h="auto"
            p={0}
            _hover={{ color: 'rgba(245,239,230,0.55)' }}
            transition="color 0.15s"
            onClick={() => router.back()}
          >
            &larr; Events
          </Button>
        </Box>

        <Box
          mb={10}
          pb={8}
          borderBottom="1px solid rgba(245,239,230,0.1)"
          animation={`${fadeUp} 0.45s 0.05s ease both`}
        >
          {(isDraft || isPast) && (
            <HStack spacing={2} mb={3}>
              {isDraft && (
                <Box
                  display="inline-flex"
                  alignItems="center"
                  px={3}
                  h="22px"
                  bg="rgba(212,140,40,0.15)"
                  border="1px solid rgba(212,140,40,0.35)"
                  borderRadius="2px"
                  fontFamily="'DM Sans', sans-serif"
                  fontSize="10px"
                  fontWeight="500"
                  letterSpacing="0.14em"
                  textTransform="uppercase"
                  color="#d48c28"
                >
                  Draft
                </Box>
              )}
              {isPast && (
                <Box
                  display="inline-flex"
                  alignItems="center"
                  px={3}
                  h="22px"
                  bg="rgba(245,239,230,0.06)"
                  border="1px solid rgba(245,239,230,0.12)"
                  borderRadius="2px"
                  fontFamily="'DM Sans', sans-serif"
                  fontSize="10px"
                  fontWeight="500"
                  letterSpacing="0.14em"
                  textTransform="uppercase"
                  color="rgba(245,239,230,0.35)"
                >
                  Past event
                </Box>
              )}
            </HStack>
          )}

          <Heading
            as="h1"
            fontFamily="'DM Serif Display', Georgia, serif"
            fontWeight="400"
            fontStyle="italic"
            fontSize={{ base: '34px', md: '52px' }}
            color="#f5efe6"
            lineHeight="0.95"
            letterSpacing="-0.02em"
            mb={5}
          >
            {event.name}
          </Heading>

          <HStack spacing={0} flexWrap="wrap" gap={3}>
            <Text
              fontSize="14px"
              fontWeight="300"
              color="rgba(245,239,230,0.5)"
              letterSpacing="0.02em"
            >
              {full}
            </Text>
            <Text fontSize="14px" color="rgba(245,239,230,0.2)">
              -
            </Text>
            <Text
              fontSize="14px"
              fontWeight="300"
              color="rgba(245,239,230,0.5)"
              letterSpacing="0.02em"
            >
              {venueName}
            </Text>
          </HStack>
        </Box>

        <Flex
          gap={{ base: 8, lg: 10 }}
          direction={{ base: 'column', lg: 'row' }}
          align="start"
        >
          <Box flex={1} minW={0} animation={`${fadeUp} 0.45s 0.1s ease both`}>
            <Box
              display="grid"
              gridTemplateColumns={{ base: '1fr 1fr', sm: 'repeat(3, 1fr)' }}
              gap={5}
              p={5}
              mb={8}
              bg="rgba(245,239,230,0.03)"
              border="1px solid rgba(245,239,230,0.08)"
              borderRadius="4px"
            >
              <Box>
                <Text
                  fontSize="10px"
                  fontWeight="500"
                  letterSpacing="0.16em"
                  textTransform="uppercase"
                  color="#d48c28"
                  mb="6px"
                >
                  Date
                </Text>
                <Flex align="baseline" gap="5px">
                  <Text
                    fontFamily="'DM Serif Display', Georgia, serif"
                    fontSize="32px"
                    fontWeight="400"
                    color="#f5efe6"
                    lineHeight="1"
                  >
                    {day}
                  </Text>
                  <Box>
                    <Text
                      fontFamily="'DM Sans', sans-serif"
                      fontSize="11px"
                      fontWeight="500"
                      color="rgba(245,239,230,0.5)"
                      letterSpacing="0.06em"
                      display="block"
                    >
                      {month}
                    </Text>
                    <Text
                      fontFamily="'DM Sans', sans-serif"
                      fontSize="11px"
                      fontWeight="300"
                      color="rgba(245,239,230,0.3)"
                      display="block"
                    >
                      {year}
                    </Text>
                  </Box>
                </Flex>
                <Text
                  fontSize="11px"
                  fontWeight="300"
                  color="rgba(245,239,230,0.35)"
                  letterSpacing="0.04em"
                  mt="2px"
                >
                  {weekday}
                </Text>
              </Box>

              <Box>
                <Text
                  fontSize="10px"
                  fontWeight="500"
                  letterSpacing="0.16em"
                  textTransform="uppercase"
                  color="#d48c28"
                  mb="6px"
                >
                  Time
                </Text>
                <Text
                  fontSize="14px"
                  fontWeight="300"
                  color="rgba(245,239,230,0.7)"
                  letterSpacing="0.02em"
                >
                  {time || 'TBA'}
                </Text>
              </Box>

              <Box>
                <Text
                  fontSize="10px"
                  fontWeight="500"
                  letterSpacing="0.16em"
                  textTransform="uppercase"
                  color="#d48c28"
                  mb="6px"
                >
                  Venue
                </Text>
                <Text
                  fontSize="14px"
                  fontWeight="300"
                  color="rgba(245,239,230,0.7)"
                  letterSpacing="0.02em"
                  lineHeight="1.4"
                >
                  {venueName}
                </Text>
              </Box>
            </Box>

            {event.description && (
              <Box mb={8}>
                <Text
                  fontSize="11px"
                  fontWeight="500"
                  letterSpacing="0.16em"
                  textTransform="uppercase"
                  color="rgba(245,239,230,0.3)"
                  mb={4}
                >
                  About this event
                </Text>
                <Text
                  fontFamily="'DM Serif Display', Georgia, serif"
                  fontSize={{ base: '16px', md: '18px' }}
                  fontWeight="400"
                  color="rgba(245,239,230,0.65)"
                  lineHeight="1.75"
                  letterSpacing="0.01em"
                  whiteSpace="pre-wrap"
                >
                  {event.description}
                </Text>
              </Box>
            )}

            <Box
              bg="rgba(245,239,230,0.03)"
              border="1px solid rgba(245,239,230,0.08)"
              borderRadius="4px"
              overflow="hidden"
            >
              <Box h="1px" bg="rgba(212,140,40,0.3)" />
              <Box p={5}>
                <Text
                  fontSize="11px"
                  fontWeight="500"
                  letterSpacing="0.16em"
                  textTransform="uppercase"
                  color="rgba(245,239,230,0.35)"
                  mb={5}
                >
                  {isPast ? 'Ticket sales closed' : 'Select tickets'}
                </Text>

                {isPast ? (
                  <Text
                    fontFamily="'DM Serif Display', Georgia, serif"
                    fontStyle="italic"
                    fontSize="16px"
                    color="rgba(245,239,230,0.3)"
                    py={2}
                  >
                    Ticket sales for this event have closed.
                  </Text>
                ) : (
                  <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                      <TicketTypeSelector ticketTypes={ticketTypes} name="quantities" />

                      {form.formState.errors.quantities && (
                        <Text
                          fontFamily="'DM Sans', sans-serif"
                          fontSize="12px"
                          fontWeight="400"
                          color="#e24b4a"
                          mt={3}
                          letterSpacing="0.02em"
                        >
                          {String(form.formState.errors.quantities.message)}
                        </Text>
                      )}

                      <Box mt={6}>
                        {isAuthenticated ? (
                          <Button
                            type="submit"
                            isLoading={form.formState.isSubmitting}
                            loadingText="Creating order..."
                            variant="unstyled"
                            fontFamily="'DM Sans', sans-serif"
                            fontSize="12px"
                            fontWeight="500"
                            letterSpacing="0.12em"
                            textTransform="uppercase"
                            color="#0a0908"
                            bg="#d48c28"
                            borderRadius="2px"
                            h="44px"
                            px={6}
                            display="inline-flex"
                            alignItems="center"
                            _hover={{ bg: '#f5c842' }}
                            _active={{ bg: '#ba7517' }}
                            _loading={{ bg: '#d48c28', opacity: 0.7 }}
                            transition="background 0.15s"
                          >
                            Create order
                          </Button>
                        ) : (
                          <Button
                            as={Link}
                            href={`/auth/login?redirect=/events/${event.id}`}
                            variant="unstyled"
                            fontFamily="'DM Sans', sans-serif"
                            fontSize="12px"
                            fontWeight="500"
                            letterSpacing="0.12em"
                            textTransform="uppercase"
                            color="#0a0908"
                            bg="#d48c28"
                            borderRadius="2px"
                            h="44px"
                            px={6}
                            display="inline-flex"
                            alignItems="center"
                            _hover={{ bg: '#f5c842', textDecoration: 'none' }}
                            transition="background 0.15s"
                          >
                            Log in to buy tickets
                          </Button>
                        )}
                      </Box>
                    </form>
                  </FormProvider>
                )}
              </Box>
            </Box>
          </Box>

          {!isPast && ticketTypes.length > 0 && (
            <Box
              w={{ base: '100%', lg: '260px' }}
              flexShrink={0}
              animation={`${fadeUp} 0.45s 0.15s ease both`}
            >
              <OrderSummary ticketTypes={ticketTypes} quantities={watchedQuantities} />
            </Box>
          )}
        </Flex>
      </Container>
    </Box>
  );
}
