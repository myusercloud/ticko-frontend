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
} from '@chakra-ui/react';
import Link from 'next/link';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const { data: events, isLoading, error } = useEvents();

  return (
    <ProtectedRoute>
      <Container maxW="7xl" py={8} px={4}>
        <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg">Organizer dashboard</Heading>
            <Text color="gray.600">Manage your events</Text>
          </Box>
          <Button as={Link} href="/dashboard/events/create" colorScheme="brand">
            Create event
          </Button>
        </Flex>

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {(error as Error).message}
          </Alert>
        )}

        <Heading size="sm" mb={4} color="gray.600">
          Your events
        </Heading>

        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="140px" borderRadius="md" />
            ))}
          </SimpleGrid>
        ) : events && events.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {events.map((event) => (
              <Box key={event.id}>
                <EventCard event={event} />
                <Button
                  as={Link}
                  href={`/dashboard/events/${event.id}`}
                  size="sm"
                  variant="outline"
                  mt={2}
                  width="full"
                >
                  Manage
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Card bg="gray.50">
            <CardBody textAlign="center" py={12}>
              <Text color="gray.600" mb={4}>
                You haven&apos;t created any events yet.
              </Text>
              <Button as={Link} href="/dashboard/events/create" colorScheme="brand">
                Create your first event
              </Button>
            </CardBody>
          </Card>
        )}
      </Container>
    </ProtectedRoute>
  );
}
