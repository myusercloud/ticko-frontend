'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Skeleton,
  Alert,
  AlertIcon,
  Button,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useTickets } from '@/hooks/useTickets';
import { TicketCard } from '@/components/TicketCard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function TicketsPage() {
  const { data: tickets, isLoading, error } = useTickets();

  return (
    <ProtectedRoute>
      <Container maxW="4xl" py={8} px={4}>
        <Heading size="lg" mb={2}>
          My Tickets
        </Heading>

        <Text color="gray.600" mb={6}>
          Your upcoming events and QR codes for entry
        </Text>

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {(error as Error).message}
          </Alert>
        )}

        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="180px" borderRadius="md" />
            ))}
          </SimpleGrid>
        ) : tickets && tickets.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </SimpleGrid>
        ) : (
          <Box
            bg="gray.50"
            borderRadius="lg"
            p={8}
            textAlign="center"
            borderWidth="1px"
            borderStyle="dashed"
          >
            <Text color="gray.600" mb={4}>
              You don&apos;t have any tickets yet.
            </Text>
            <Button as={Link} href="/" colorScheme="brand">
              Browse events
            </Button>
          </Box>
        )}
      </Container>
    </ProtectedRoute>
  );
}
