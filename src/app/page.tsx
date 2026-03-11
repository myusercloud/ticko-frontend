'use client';

import { Box, Container, Heading, Text, SimpleGrid, Skeleton, Alert, AlertIcon } from '@chakra-ui/react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';

export default function HomePage() {
  const { data: events, isLoading, error } = useEvents();

  return (
    <Box>
      <Box bg="brand.600" color="white" py={{ base: 12, md: 16 }} px={4}>
        <Container maxW="7xl" centerContent textAlign="center">
          <Heading size={{ base: 'xl', md: '2xl' }} mb={3}>
            Discover events near you
          </Heading>
          <Text fontSize="lg" opacity={0.9} maxW="2xl">
            Buy tickets securely. Get instant QR codes. Enjoy the show.
          </Text>
        </Container>
      </Box>

      <Container maxW="7xl" py={8} px={4}>
        <Heading size="md" mb={6} color="gray.700">
          Upcoming events
        </Heading>

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {(error as Error).message}
          </Alert>
        )}

        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height="140px" borderRadius="md" />
            ))}
          </SimpleGrid>
        ) : events && events.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </SimpleGrid>
        ) : (
          <Text color="gray.600" py={8}>
            No events yet. Check back soon!
          </Text>
        )}
      </Container>
    </Box>
  );
}
