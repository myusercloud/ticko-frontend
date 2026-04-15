'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import {
  Box,
  Container,
  Button,
  Text,
  Heading,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import Link from 'next/link';
import { useToast } from '@chakra-ui/react';

/* ── animations ─────────────────────────────────────────── */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
`;

/* ── helpers ─────────────────────────────────────────────── */

function formatCurrency(amount: number | string | undefined) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

function StatusPill({ status }: { status?: string }) {
  if (!status) return null;
  const isPaid = status.toLowerCase() === 'paid';
  const isPending = status.toLowerCase() === 'pending';
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="6px"
      px={3}
      h="24px"
      borderRadius="2px"
      bg={isPaid ? 'rgba(74,222,128,0.1)' : isPending ? 'rgba(212,140,40,0.12)' : 'rgba(245,239,230,0.06)'}
      border={`1px solid ${isPaid ? 'rgba(74,222,128,0.3)' : isPending ? 'rgba(212,140,40,0.35)' : 'rgba(245,239,230,0.14)'}`}
    >
      <Box
        w="5px" h="5px" borderRadius="50%"
        bg={isPaid ? '#4ade80' : isPending ? '#d48c28' : 'rgba(245,239,230,0.3)'}
      />
      <Text
        fontFamily="'DM Sans', sans-serif"
        fontSize="10px"
        fontWeight="500"
        letterSpacing="0.14em"
        textTransform="uppercase"
        color={isPaid ? '#4ade80' : isPending ? '#d48c28' : 'rgba(245,239,230,0.4)'}
      >
        {status}
      </Text>
    </Box>
  );
}

/* ── page ────────────────────────────────────────────────── */

export default function CheckoutPage() {
  
  const token = localStorage.getItem('token');
  const { orderId } = useParams();
  const router = useRouter();
  const toast = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if(!token) {
          toast({ title: 'Unauthorized', description: 'Please log in to view your order', status: 'error' });
          router.push('/auth/login');
          return;
        }
        setOrder(res.data);
      } catch {
        toast({ title: 'Failed to load order', status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const fakePayment = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 2000));
    const success = Math.random() > 0.2;
    if (success) {
      setPaid(true);
      toast({ title: 'Payment successful', status: 'success' });
      setTimeout(() => router.push('/tickets'), 1500);
    } else {
      toast({ title: 'Payment failed', description: 'Try again', status: 'error' });
    }
    setPaying(false);
  };

  /* ── loading ── */
  if (loading) {
    return (
      <Box
        minH="100vh" bg="#0a0908"
        display="flex" alignItems="center" justifyContent="center"
        flexDirection="column" gap={4}
      >
        <Box
          w="28px" h="28px"
          border="2px solid rgba(245,239,230,0.1)"
          borderTopColor="#d48c28"
          borderRadius="50%"
          animation={`${spin} 0.7s linear infinite`}
        />
        <Text
          fontFamily="'DM Serif Display', Georgia, serif"
          fontStyle="italic"
          fontSize="16px"
          color="rgba(245,239,230,0.3)"
        >
          Loading checkout…
        </Text>
      </Box>
    );
  }

  /* ── success state ── */
  if (paid) {
    return (
      <Box
        minH="100vh" bg="#0a0908"
        display="flex" alignItems="center" justifyContent="center"
        px={4}
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0, left: '50%', transform: 'translateX(-50%)',
          w: '600px', h: '300px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      >
        <Box
          textAlign="center"
          animation={`${scaleIn} 0.4s ease both`}
          maxW="360px"
        >
          {/* tick circle */}
          <Box
            w="64px" h="64px" mx="auto" mb={6}
            borderRadius="50%"
            bg="rgba(74,222,128,0.1)"
            border="1px solid rgba(74,222,128,0.3)"
            display="flex" alignItems="center" justifyContent="center"
            fontSize="26px"
          >
            ✓
          </Box>
          <Heading
            fontFamily="'DM Serif Display', Georgia, serif"
            fontStyle="italic"
            fontWeight="400"
            fontSize="32px"
            color="#4ade80"
            letterSpacing="-0.02em"
            mb={2}
          >
            You're in!
          </Heading>
          <Text
            fontFamily="'DM Sans', sans-serif"
            fontSize="14px"
            fontWeight="300"
            color="rgba(245,239,230,0.45)"
            mb={6}
          >
            Payment confirmed. Redirecting to your tickets…
          </Text>
          <ChakraLink
            as={Link}
            href="/tickets"
            fontFamily="'DM Sans', sans-serif"
            fontSize="12px"
            fontWeight="500"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="#4ade80"
            border="1px solid rgba(74,222,128,0.3)"
            borderRadius="2px"
            px={5}
            h="36px"
            display="inline-flex"
            alignItems="center"
            _hover={{ bg: 'rgba(74,222,128,0.08)', textDecoration: 'none' }}
            transition="all 0.15s"
          >
            View my tickets
          </ChakraLink>
        </Box>
      </Box>
    );
  }

  /* ── main checkout ── */
  return (
    <Box
      minH="100vh" bg="#0a0908"
      display="flex" alignItems="center" justifyContent="center"
      px={4} py={12}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0, left: '50%', transform: 'translateX(-50%)',
        w: '600px', h: '300px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(212,140,40,0.11) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
    >
      <Container maxW="420px" animation={`${fadeUp} 0.45s ease both`}>

        {/* wordmark */}
        <Box textAlign="center" mb={10}>
          <ChakraLink
            as={Link}
            href="/"
            fontFamily="'DM Serif Display', Georgia, serif"
            fontStyle="italic"
            fontSize="26px"
            fontWeight="400"
            color="#f5efe6"
            letterSpacing="-0.02em"
            _hover={{ color: '#d48c28', textDecoration: 'none' }}
            transition="color 0.15s"
          >
            Ticko
          </ChakraLink>
        </Box>

        {/* card */}
        <Box
          bg="rgba(245,239,230,0.04)"
          border="1px solid rgba(245,239,230,0.1)"
          borderRadius="4px"
          overflow="hidden"
        >
          <Box h="1px" bg="rgba(212,140,40,0.5)" />

          <Box px={{ base: 6, sm: 7 }} pt={7} pb={8}>

            {/* heading */}
            <Box mb={7} pb={6} borderBottom="1px solid rgba(245,239,230,0.08)">
              <Text
                fontFamily="'DM Sans', sans-serif"
                fontSize="10px"
                fontWeight="500"
                letterSpacing="0.18em"
                textTransform="uppercase"
                color="rgba(245,239,230,0.3)"
                mb={2}
              >
                Order #{typeof orderId === 'string' ? orderId.slice(-8).toUpperCase() : orderId}
              </Text>
              <Heading
                as="h1"
                fontFamily="'DM Serif Display', Georgia, serif"
                fontWeight="400"
                fontStyle="italic"
                fontSize="26px"
                color="#f5efe6"
                letterSpacing="-0.02em"
                mb={3}
              >
                Complete your order
              </Heading>
              <StatusPill status={order?.status} />
            </Box>

            {/* order breakdown */}
            <Box mb={7}>
              {order?.items?.length > 0 ? (
                <>
                  {order.items.map((item: any, i: number) => (
                    <Box
                      key={i}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="baseline"
                      py="10px"
                      borderBottom="1px solid rgba(245,239,230,0.06)"
                    >
                      <Box>
                        <Text fontFamily="'DM Sans', sans-serif" fontSize="14px" fontWeight="400" color="rgba(245,239,230,0.75)">
                          {item.name ?? item.ticketType?.name ?? 'Ticket'}
                        </Text>
                        {item.quantity > 1 && (
                          <Text fontFamily="'DM Sans', sans-serif" fontSize="11px" fontWeight="300" color="rgba(245,239,230,0.35)" mt="2px">
                            {item.quantity} × {formatCurrency(item.unitPrice ?? item.price)}
                          </Text>
                        )}
                      </Box>
                      <Text fontFamily="'DM Sans', sans-serif" fontSize="14px" fontWeight="500" color="#f5efe6">
                        {formatCurrency(item.subtotal ?? (item.quantity ?? 1) * (item.unitPrice ?? item.price ?? 0))}
                      </Text>
                    </Box>
                  ))}
                </>
              ) : (
                /* fallback: just show total from order object */
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="baseline"
                  py="10px"
                  borderBottom="1px solid rgba(245,239,230,0.06)"
                >
                  <Text fontFamily="'DM Sans', sans-serif" fontSize="14px" fontWeight="400" color="rgba(245,239,230,0.75)">
                    Event tickets
                  </Text>
                  <Text fontFamily="'DM Sans', sans-serif" fontSize="14px" fontWeight="500" color="#f5efe6">
                    {formatCurrency(order?.amount)}
                  </Text>
                </Box>
              )}

              {/* total row */}
              <Box display="flex" justifyContent="space-between" alignItems="baseline" pt={4}>
                <Text
                  fontFamily="'DM Sans', sans-serif"
                  fontSize="11px"
                  fontWeight="500"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                  color="rgba(245,239,230,0.35)"
                >
                  Total due
                </Text>
                <Text
                  fontFamily="'DM Serif Display', Georgia, serif"
                  fontStyle="italic"
                  fontSize="28px"
                  fontWeight="400"
                  color="#f5c842"
                  letterSpacing="-0.02em"
                  lineHeight="1"
                  sx={{
                    background: 'linear-gradient(90deg, #d48c28 0%, #f5c842 50%, #d48c28 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: `${shimmer} 3s linear infinite`,
                  }}
                >
                  {formatCurrency(order?.amount)}
                </Text>
              </Box>
            </Box>

            {/* mock payment notice */}
            <Box
              mb={5}
              px={4} py={3}
              bg="rgba(212,140,40,0.07)"
              border="1px solid rgba(212,140,40,0.2)"
              borderRadius="2px"
            >
              <Text
                fontFamily="'DM Sans', sans-serif"
                fontSize="12px"
                fontWeight="300"
                color="rgba(245,239,230,0.45)"
                letterSpacing="0.02em"
                lineHeight="1.55"
              >
                This is a <Box as="span" color="#d48c28" fontWeight="500">mock payment</Box> — no real charges will be made. 80% success rate simulated.
              </Text>
            </Box>

            {/* pay button */}
            <Button
              onClick={fakePayment}
              isLoading={paying}
              isDisabled={paid}
              loadingText="Processing…"
              variant="unstyled"
              w="full"
              h="48px"
              fontFamily="'DM Sans', sans-serif"
              fontSize="12px"
              fontWeight="500"
              letterSpacing="0.14em"
              textTransform="uppercase"
              color="#0a0908"
              bg="#d48c28"
              borderRadius="2px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{ bg: '#f5c842' }}
              _active={{ bg: '#ba7517' }}
              _loading={{ bg: '#d48c28', opacity: 0.7 }}
              transition="background 0.15s"
            >
              Pay {formatCurrency(order?.amount)}
            </Button>

            {/* security note */}
            <Text
              mt={4}
              fontFamily="'DM Sans', sans-serif"
              fontSize="11px"
              fontWeight="300"
              color="rgba(245,239,230,0.2)"
              textAlign="center"
              letterSpacing="0.04em"
            >
              Secure checkout · Instant QR code on payment
            </Text>

          </Box>
        </Box>

        {/* back link */}
        <Box textAlign="center" mt={6}>
          <ChakraLink
            as={Link}
            href="/"
            fontFamily="'DM Sans', sans-serif"
            fontSize="12px"
            fontWeight="400"
            letterSpacing="0.08em"
            color="rgba(245,239,230,0.22)"
            _hover={{ color: 'rgba(245,239,230,0.5)', textDecoration: 'none' }}
            transition="color 0.15s"
          >
            ← Back to events
          </ChakraLink>
        </Box>

      </Container>
    </Box>
  );
}