'use client';

import { Box, Heading, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import Link from 'next/link';
import type { Event } from '@/lib/types';

function formatDate(dateStr: string) {
  const parsed = new Date(dateStr);

  if (Number.isNaN(parsed.getTime())) {
    return {
      weekday: '--',
      day: '--',
      month: 'DATE',
      year: '',
      time: '',
    };
  }

  return {
    weekday: parsed
      .toLocaleDateString(undefined, { weekday: 'short' })
      .toUpperCase(),
    day: parsed.toLocaleDateString(undefined, { day: 'numeric' }),
    month: parsed.toLocaleDateString(undefined, { month: 'short' }),
    year: parsed.getFullYear().toString(),
    time: parsed.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function getVenueLabel(venue?: Event['venue']) {
  if (!venue) return 'Venue TBA';
  if (typeof venue === 'string') return venue;
  return venue.city ? `${venue.name}, ${venue.city}` : venue.name;
}

interface EventCardProps {
  event: Event;
}

const arrowSlide = keyframes`
  from { transform: translateX(0); opacity: 0.5; }
  to   { transform: translateX(4px); opacity: 1; }
`;

export function EventCard({ event }: EventCardProps) {
  const { weekday, day, month, year, time } = formatDate(event.startTime);

  return (
    <Link
      href={`/events/${event.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <Box
        role="group"
        position="relative"
        bg="rgba(245,239,230,0.04)"
        border="1px solid rgba(245,239,230,0.1)"
        borderRadius="4px"
        overflow="hidden"
        transition="border-color 0.2s, background 0.2s, transform 0.2s"
        _hover={{
          borderColor: 'rgba(212,140,40,0.5)',
          bg: 'rgba(245,239,230,0.07)',
          transform: 'translateY(-2px)',
        }}
        display="flex"
        flexDirection="row"
        minH="100px"
      >
        <Box
          flexShrink={0}
          w="72px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap="2px"
          borderRight="1px solid rgba(245,239,230,0.08)"
          py={4}
          px={2}
          bg="rgba(212,140,40,0.06)"
          transition="background 0.2s"
          _groupHover={{ bg: 'rgba(212,140,40,0.1)' }}
        >
          <Text
            fontFamily="'DM Sans', sans-serif"
            fontSize="9px"
            fontWeight="500"
            letterSpacing="0.16em"
            color="#d48c28"
            textTransform="uppercase"
          >
            {weekday}
          </Text>

          <Text
            fontFamily="'DM Serif Display', Georgia, serif"
            fontSize="22px"
            fontWeight="400"
            color="#f5efe6"
            lineHeight="1"
          >
            {day}
          </Text>

          <Text
            fontFamily="'DM Sans', sans-serif"
            fontSize="10px"
            fontWeight="400"
            letterSpacing="0.06em"
            color="rgba(245,239,230,0.45)"
          >
            {month}
          </Text>
        </Box>

        <Box
          flex={1}
          minW={0}
          px={4}
          py={3}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap="4px"
        >
          <Heading
            as="h3"
            fontFamily="'DM Serif Display', Georgia, serif"
            fontWeight="400"
            fontSize="15px"
            color="#f5efe6"
            lineHeight="1.25"
            noOfLines={2}
            letterSpacing="-0.01em"
          >
            {event.name}
          </Heading>

          <Text
            fontFamily="'DM Sans', sans-serif"
            fontSize="12px"
            fontWeight="400"
            color="rgba(245,239,230,0.45)"
            noOfLines={1}
            letterSpacing="0.02em"
          >
            {getVenueLabel(event.venue)}
          </Text>

          <Text
            fontFamily="'DM Sans', sans-serif"
            fontSize="11px"
            fontWeight="400"
            color="rgba(245,239,230,0.3)"
            letterSpacing="0.04em"
          >
            {time} &nbsp;·&nbsp; {year}
          </Text>
        </Box>

        <Box flexShrink={0} display="flex" alignItems="center" pr={4} pl={2}>
          <Box
            as="span"
            fontFamily="'DM Sans', sans-serif"
            fontSize="18px"
            color="rgba(245,239,230,0.2)"
            transition="color 0.2s"
            _groupHover={{
              color: '#d48c28',
              animation: `${arrowSlide} 0.25s ease forwards`,
            }}
            lineHeight="1"
          >
            →
          </Box>
        </Box>

        <Box
          position="absolute"
          left="0"
          top="0"
          bottom="0"
          w="2px"
          bg="#d48c28"
          transform="scaleY(0)"
          transformOrigin="bottom"
          transition="transform 0.2s ease"
          _groupHover={{ transform: 'scaleY(1)' }}
        />
      </Box>
    </Link>
  );
}
