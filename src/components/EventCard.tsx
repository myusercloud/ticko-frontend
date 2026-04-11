'use client';

import {
  Box,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Text,
  Button,
  Image,
  useBreakpointValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import type { Event } from '@/lib/types';

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const imageSize = useBreakpointValue({ base: '120px', sm: '140px' });

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
      <Card
        direction="row"
        overflow="hidden"
        variant="outline"
        bg="white"
        _hover={{ shadow: 'md', borderColor: 'brand.200' }}
        transition="all 0.2s"
        flex={{ base: '1 1 100%', md: '1 1 340px' }}
        maxW={{ md: '400px' }}
      >
        <Box
          flexShrink={0}
          w={imageSize}
          h={imageSize}
          bg="gray.200"
          position="relative"
        >
          {/*
          If you want to show an image in the future, uncomment this JSX block.
          Make sure your Event type has an optional `imageUrl?: string` property.
          
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.name}
              objectFit="cover"
              w="100%"
              h="100%"
            />
          ) : (
            <Box
              w="100%"
              h="100%"
              bg="brand.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="3xl" color="brand.600">
                🎫
              </Text>
            </Box>
          )}
          */}
        </Box>

        <CardBody py={3} flex={1} minW={0}>
          <Heading size="sm" noOfLines={2} mb={1}>
            {event.name}
          </Heading>

          <Text fontSize="sm" color="gray.600" noOfLines={1}>
            {event.venue?.name ?? 'Unknown Venue'}
          </Text>

          <Text fontSize="xs" color="gray.500" mt={1}>
            {formatDate(event.startTime)}
          </Text>
        </CardBody>

        <CardFooter py={2} alignSelf="center" flexShrink={0}>
          <Button size="sm" colorScheme="brand" as="span">
            View
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}