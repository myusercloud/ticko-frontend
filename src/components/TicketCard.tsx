'use client';

import { Box, Card, CardBody, Heading, Text, Badge, Flex } from '@chakra-ui/react';
import { QRCodeSVG } from 'qrcode.react';
import type { Ticket } from '@/lib/types';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const event = ticket.event;
  const ticketType = ticket.ticketType;
  const qrPayload = ticket.qrCode || ticket.id;
  const isUsed = ticket.status === 'used';
  const isCancelled = ticket.status === 'cancelled';

  return (
    <Card bg="white" overflow="hidden" borderWidth="1px">
      <CardBody p={4}>
        <Flex align="flex-start" gap={4} direction={{ base: 'column', sm: 'row' }}>
          <Box
            flexShrink={0}
            p={3}
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
          >
            <QRCodeSVG value={qrPayload} size={120} level="M" />
          </Box>
          <Box flex={1} minW={0}>
            <Badge
              colorScheme={
                isCancelled ? 'red' : isUsed ? 'orange' : 'green'
              }
              mb={2}
            >
              {ticket.status}
            </Badge>
            <Heading size="sm" mb={1}>
              {event?.name ?? 'Event'}
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {ticketType?.name ?? 'Ticket'} • {event?.venue ?? '—'}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {event?.date ? formatDate(event.date) : '—'}
            </Text>
            {ticket.purchasedAt && (
              <Text fontSize="xs" color="gray.400" mt={1}>
                Purchased {formatDate(ticket.purchasedAt)}
              </Text>
            )}
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
}
