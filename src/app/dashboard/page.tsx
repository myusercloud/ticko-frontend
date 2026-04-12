'use client';

import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Skeleton,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Progress,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  Icon,
  Divider,
} from '@chakra-ui/react';
import Link from 'next/link';
import { CalendarIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { useEvents } from '@/hooks/useEvents';
import { useOrganizerStats } from '@/hooks/useOrganizerStats';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import type { Event } from '@/lib/types';

function getEventStatus(event: Event): 'upcoming' | 'past' | 'draft' {
  if (event.isPublished === false) return 'draft';
  if (new Date(event.startTime) < new Date()) return 'past';
  return 'upcoming';
}

function formatRelativeDate(dateStr: string): string {
  const diff = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / 86_400_000
  );

  if (diff < 0) return 'Ended';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${diff} days away`;
}

function formatDate(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;

  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}k`;
  return `$${amount.toFixed(0)}`;
}

function getVenueLabel(event: Event): string {
  if (!event.venue) return 'Venue TBA';
  if (typeof event.venue === 'string') return event.venue;
  return event.venue.city
    ? `${event.venue.name}, ${event.venue.city}`
    : event.venue.name;
}

function getTotalCapacity(event: Event): number {
  if (typeof event.totalCapacity === 'number') return event.totalCapacity;

  return (event.ticketTypes ?? []).reduce(
    (sum, tt) => sum + Number(tt.quantity ?? 0),
    0
  );
}

function getTicketsSold(event: Event): number {
  if (typeof event.ticketsSold === 'number') return event.ticketsSold;
  return event._count?.orders ?? 0;
}

const STATUS_BADGE: Record<
  'upcoming' | 'past' | 'draft',
  { label: string; colorScheme: string }
> = {
  upcoming: { label: 'Published', colorScheme: 'green' },
  past: { label: 'Ended', colorScheme: 'gray' },
  draft: { label: 'Draft', colorScheme: 'yellow' },
};

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Stat
      bg="gray.50"
      borderRadius="md"
      px={4}
      py={3}
    >
      <StatLabel fontSize="xs" color="gray.500">
        {label}
      </StatLabel>
      <StatNumber fontSize="2xl">{value}</StatNumber>
      <StatHelpText mb={0} fontSize="xs" color="gray.400">
        {sub}
      </StatHelpText>
    </Stat>
  );
}

function EventCardEnhanced({ event }: { event: Event }) {
  const status = getEventStatus(event);
  const badge = STATUS_BADGE[status];
  const sold = getTicketsSold(event);
  const capacity = getTotalCapacity(event);
  const pct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  const relDate = formatRelativeDate(event.startTime);

  return (
    <Card variant="outline" overflow="hidden">
      <CardBody p={4}>
        <Flex justify="space-between" align="flex-start" gap={2} mb={2}>
          <Heading size="sm" lineHeight="short" noOfLines={2}>
            {event.name}
          </Heading>
          <Badge
            colorScheme={badge.colorScheme}
            borderRadius="full"
            px={2}
            flexShrink={0}
          >
            {badge.label}
          </Badge>
        </Flex>

        <Flex direction="column" gap={1} mb={3}>
          <HStack spacing={1} color="gray.500" fontSize="xs">
            <CalendarIcon boxSize={3} />
            <Text>
              {formatDate(event.startTime)}
              {status === 'upcoming' && ` · ${relDate}`}
            </Text>
          </HStack>

          <HStack spacing={1} color="gray.500" fontSize="xs">
            <Icon viewBox="0 0 24 24" boxSize={3}>
              <path
                fill="currentColor"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
              />
            </Icon>
            <Text>{getVenueLabel(event)}</Text>
          </HStack>
        </Flex>

        <Divider mb={3} />

        {status !== 'draft' && (
          <>
            <SimpleGrid columns={3} spacing={2} mb={3} textAlign="center">
              <Box>
                <Text fontWeight="500" fontSize="md">
                  {sold.toLocaleString()}
                </Text>
                <Text fontSize="10px" color="gray.400">
                  {status === 'past' ? 'attended' : 'sold'}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="500" fontSize="md">
                  {capacity.toLocaleString()}
                </Text>
                <Text fontSize="10px" color="gray.400">
                  capacity
                </Text>
              </Box>

              <Box>
                <Text fontWeight="500" fontSize="md">
                  {event.revenue != null ? formatCurrency(event.revenue) : '—'}
                </Text>
                <Text fontSize="10px" color="gray.400">
                  revenue
                </Text>
              </Box>
            </SimpleGrid>

            {status === 'upcoming' && (
              <Box mb={3}>
                <Flex
                  justify="space-between"
                  fontSize="10px"
                  color="gray.400"
                  mb={1}
                >
                  <Text>Capacity</Text>
                  <Text>{pct}%</Text>
                </Flex>
                <Progress
                  value={pct}
                  size="xs"
                  colorScheme={
                    pct >= 90 ? 'red' : pct >= 70 ? 'orange' : 'brand'
                  }
                  borderRadius="full"
                />
              </Box>
            )}
          </>
        )}

        {status === 'draft' && (
          <Text fontSize="xs" color="gray.400" mb={3}>
            This event is still in draft and can be completed before publishing.
          </Text>
        )}

        <Button
          as={Link}
          href={`/dashboard/events/${event.id}`}
          size="sm"
          variant="outline"
          width="full"
        >
          {status === 'draft'
            ? 'Continue editing'
            : status === 'past'
            ? 'View report'
            : 'Manage'}
        </Button>
      </CardBody>
    </Card>
  );
}

function MetricsSkeleton() {
  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} height="80px" borderRadius="md" />
      ))}
    </SimpleGrid>
  );
}

function GridSkeleton() {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} height="220px" borderRadius="md" />
      ))}
    </SimpleGrid>
  );
}

function EmptyState() {
  return (
    <Card bg="gray.50">
      <CardBody textAlign="center" py={16}>
        <Box
          w={10}
          h={10}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mx="auto"
          mb={4}
        >
          <TriangleUpIcon color="gray.400" />
        </Box>

        <Heading size="sm" mb={2}>
          No events yet
        </Heading>

        <Text color="gray.500" fontSize="sm" maxW="260px" mx="auto" mb={6}>
          Create your first event to start selling tickets and tracking
          attendance.
        </Text>

        <Button
          as={Link}
          href="/dashboard/events/create"
          colorScheme="brand"
          size="sm"
        >
          Create your first event
        </Button>
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: events, isLoading, error } = useEvents();
  const { data: stats, isLoading: statsLoading } = useOrganizerStats();

  const allEvents = events ?? [];
  const upcoming = allEvents.filter((e) => getEventStatus(e) === 'upcoming');
  const past = allEvents.filter((e) => getEventStatus(e) === 'past');
  const drafts = allEvents.filter((e) => getEventStatus(e) === 'draft');

  return (
    <ProtectedRoute>
      <Container maxW="7xl" py={8} px={4}>
        <Flex
          justify="space-between"
          align="flex-start"
          mb={8}
          wrap="wrap"
          gap={4}
        >
          <Box>
            <Heading size="lg">Organizer dashboard</Heading>
            <Text color="gray.500" mt={1}>
              {user?.name
                ? `Welcome back, ${user.name.split(' ')[0]}`
                : 'Manage your events'}
            </Text>
          </Box>

          <Button
            as={Link}
            href="/dashboard/events/create"
            colorScheme="brand"
          >
            + Create event
          </Button>
        </Flex>

        {error && (
          <Alert status="error" borderRadius="md" mb={6}>
            <AlertIcon />
            {(error as Error).message}
          </Alert>
        )}

        {statsLoading ? (
          <MetricsSkeleton />
        ) : (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
            <MetricCard
              label="Total events"
              value={String(allEvents.length)}
              sub={`${upcoming.length} upcoming`}
            />
            <MetricCard
              label="Tickets sold"
              value={(stats?.totalTicketsSold ?? 0).toLocaleString()}
              sub="across all events"
            />
            <MetricCard
              label="Gross revenue"
              value={formatCurrency(stats?.totalRevenue ?? 0)}
              sub="all time"
            />
            <MetricCard
              label="Check-in rate"
              value={
                stats?.checkInRate != null ? `${stats.checkInRate}%` : '—'
              }
              sub="last completed event"
            />
          </SimpleGrid>
        )}

        {isLoading ? (
          <GridSkeleton />
        ) : allEvents.length === 0 ? (
          <EmptyState />
        ) : (
          <Tabs variant="line" colorScheme="brand">
            <TabList mb={6}>
              <Tab fontSize="sm">All ({allEvents.length})</Tab>
              <Tab fontSize="sm">Upcoming ({upcoming.length})</Tab>
              <Tab fontSize="sm">Past ({past.length})</Tab>
              <Tab fontSize="sm">Drafts ({drafts.length})</Tab>
            </TabList>

            {[allEvents, upcoming, past, drafts].map((list, idx) => (
              <TabPanels key={idx}>
                <TabPanel p={0}>
                  {list.length === 0 ? (
                    <Text
                      color="gray.500"
                      fontSize="sm"
                      py={8}
                      textAlign="center"
                    >
                      No events in this category.
                    </Text>
                  ) : (
                    <SimpleGrid
                      columns={{ base: 1, md: 2, lg: 3 }}
                      spacing={4}
                    >
                      {list.map((event) => (
                        <EventCardEnhanced key={event.id} event={event} />
                      ))}
                    </SimpleGrid>
                  )}
                </TabPanel>
              </TabPanels>
            ))}
          </Tabs>
        )}
      </Container>
    </ProtectedRoute>
  );
}
