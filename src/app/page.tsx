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
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

export default function HomePage() {
  const { data: events, isLoading, error } = useEvents();

  return (
    <Box minH="100vh" bg="#0a0908" fontFamily="'DM Serif Display', Georgia, serif">
      <Box
        position="relative"
        overflow="hidden"
        pt={{ base: '72px', md: '96px' }}
        pb={{ base: '64px', md: '88px' }}
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,140,40,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="1px"
          bg="rgba(212,140,40,0.35)"
        />
        <Box
          position="absolute"
          top="3px"
          left="0"
          right="0"
          height="1px"
          bg="rgba(212,140,40,0.12)"
        />

        <Container maxW="7xl" px={{ base: 6, md: 10 }}>
          <Text
            fontFamily="'DM Sans', sans-serif"
            fontSize="11px"
            fontWeight="500"
            letterSpacing="0.2em"
            color="#d48c28"
            textTransform="uppercase"
            mb={5}
            animation={`${fadeUp} 0.5s ease both`}
          >
            Live Experiences&nbsp;&nbsp;·&nbsp;&nbsp;Nairobi &amp; Beyond
          </Text>

          <Heading
            as="h1"
            fontSize={{ base: '52px', md: '80px', lg: '96px' }}
            fontFamily="'DM Serif Display', Georgia, serif"
            fontStyle="italic"
            fontWeight="400"
            color="#f5efe6"
            lineHeight="0.95"
            letterSpacing="-0.02em"
            maxW="720px"
            mb={6}
            animation={`${fadeUp} 0.55s 0.08s ease both`}
          >
            Discover events&nbsp;
            <Box
              as="span"
              display="inline-block"
              sx={{
                background:
                  'linear-gradient(90deg, #d48c28 0%, #f5c842 50%, #d48c28 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: `${shimmer} 3s linear infinite`,
              }}
            >
              near you
            </Box>
          </Heading>

          <Text
            fontFamily="'DM Sans', sans-serif"
            fontWeight="300"
            fontSize={{ base: '16px', md: '19px' }}
            color="rgba(245,239,230,0.65)"
            maxW="480px"
            lineHeight="1.65"
            animation={`${fadeUp} 0.55s 0.16s ease both`}
          >
            Buy tickets securely. Get instant QR codes. Walk in, enjoy the show.
          </Text>
        </Container>

        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="1px"
          bg="rgba(245,239,230,0.1)"
        />
      </Box>

      <Container maxW="7xl" px={{ base: 6, md: 10 }} py={{ base: 10, md: 14 }}>
        <Box
          display="flex"
          alignItems="baseline"
          justifyContent="space-between"
          mb={8}
          pb={4}
          borderBottom="1px solid rgba(245,239,230,0.1)"
        >
          <Heading
            as="h2"
            fontFamily="'DM Serif Display', Georgia, serif"
            fontWeight="400"
            fontSize={{ base: '22px', md: '26px' }}
            color="#f5efe6"
            letterSpacing="-0.01em"
          >
            Upcoming events
          </Heading>

          {!isLoading && events && events.length > 0 && (
            <Text
              fontFamily="'DM Sans', sans-serif"
              fontSize="13px"
              fontWeight="400"
              color="rgba(245,239,230,0.4)"
              letterSpacing="0.04em"
            >
              {events.length} showing
            </Text>
          )}
        </Box>

        {error && (
          <Alert
            status="error"
            borderRadius="4px"
            mb={6}
            bg="rgba(163,45,45,0.2)"
            border="1px solid rgba(163,45,45,0.5)"
            color="#f5efe6"
          >
            <AlertIcon color="#e24b4a" />
            {(error as Error).message}
          </Alert>
        )}

        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                height="160px"
                borderRadius="4px"
                startColor="rgba(245,239,230,0.06)"
                endColor="rgba(245,239,230,0.12)"
              />
            ))}
          </SimpleGrid>
        ) : events && events.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {events.map((event, idx) => (
              <Box
                key={event.id}
                animation={`${fadeUp} 0.45s ${idx * 0.06}s ease both`}
              >
                <EventCard event={event} />
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Box
            py={20}
            textAlign="center"
            borderRadius="4px"
            border="1px dashed rgba(245,239,230,0.12)"
          >
            <Text
              fontFamily="'DM Serif Display', Georgia, serif"
              fontStyle="italic"
              fontSize="20px"
              color="rgba(245,239,230,0.35)"
            >
              No events yet - check back soon
            </Text>
          </Box>
        )}
      </Container>

      <Box
        borderTop="1px solid rgba(245,239,230,0.08)"
        py={8}
        textAlign="center"
      >
        <Text
          fontFamily="'DM Sans', sans-serif"
          fontSize="12px"
          letterSpacing="0.12em"
          textTransform="uppercase"
          color="rgba(245,239,230,0.2)"
        >
          Secure checkout &nbsp;·&nbsp; Instant QR &nbsp;·&nbsp; Real experiences
        </Text>
      </Box>
    </Box>
  );
}
