'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Alert,
  AlertIcon,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react'; 
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { FormInput } from '@/components/forms/FormInput';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof schema>;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

function LoginFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') ?? '/';
  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect);
      router.refresh();
    }
  }, [isAuthenticated, redirect, router]);

  const onSubmit = form.handleSubmit(async (data) => {
    await login(data);
  });

  return (
    <Box
      minH="100vh"
      bg="#0a0908"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(212,140,40,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
    >
      <Container maxW="420px" py={12} animation={`${fadeUp} 0.5s ease both`}>

        {/* wordmark */}
        <Box textAlign="center" mb={10}>
          <ChakraLink
            as={Link}
            href="/"
            fontFamily="'DM Serif Display', Georgia, serif"
            fontStyle="italic"
            fontSize="28px"
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
          position="relative"
        >
          {/* amber top rule */}
          <Box h="1px" bg="rgba(212,140,40,0.5)" />

          <Box px={{ base: 6, sm: 8 }} pt={8} pb={9}>

            {/* heading */}
            <Heading
              as="h1"
              fontFamily="'DM Serif Display', Georgia, serif"
              fontWeight="400"
              fontStyle="italic"
              fontSize="26px"
              color="#f5efe6"
              letterSpacing="-0.02em"
              textAlign="center"
              mb={1}
            >
              Welcome back
            </Heading>
            <Text
              fontFamily="'DM Sans', sans-serif"
              fontSize="13px"
              fontWeight="300"
              color="rgba(245,239,230,0.45)"
              textAlign="center"
              mb={8}
              letterSpacing="0.02em"
            >
              Log in to your Ticko account
            </Text>

            {/* error */}
            {loginError && (
              <Alert
                status="error"
                mb={6}
                borderRadius="2px"
                bg="rgba(163,45,45,0.18)"
                border="1px solid rgba(163,45,45,0.4)"
                color="rgba(245,239,230,0.85)"
                fontSize="13px"
                fontFamily="'DM Sans', sans-serif"
              >
                <AlertIcon color="#e24b4a" boxSize="14px" />
                {(loginError as Error).message}
              </Alert>
            )}

            {/* form */}
            <form onSubmit={onSubmit}>
              <VStack spacing={5} align="stretch">

                {/* email field */}
                <Box>
                  <Text
                    as="label"
                    htmlFor="email"
                    fontFamily="'DM Sans', sans-serif"
                    fontSize="11px"
                    fontWeight="500"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                    color="rgba(245,239,230,0.5)"
                    display="block"
                    mb={2}
                  >
                    Email
                  </Text>
                  <FormInput<LoginFormValues>
                    name="email"
                    control={form.control}
                    label=""
                    type="email"
                    sx={{
                      input: {
                        bg: 'rgba(245,239,230,0.05)',
                        border: '1px solid rgba(245,239,230,0.15)',
                        borderRadius: '2px',
                        color: '#f5efe6',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '14px',
                        fontWeight: '300',
                        letterSpacing: '0.02em',
                        h: '44px',
                        px: 4,
                        _placeholder: { color: 'rgba(245,239,230,0.2)' },
                        _hover: { borderColor: 'rgba(245,239,230,0.3)' },
                        _focus: {
                          borderColor: '#d48c28',
                          boxShadow: '0 0 0 1px #d48c28',
                          bg: 'rgba(212,140,40,0.06)',
                        },
                      },
                    }}
                  />
                </Box>

                {/* password field */}
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Text
                      as="label"
                      htmlFor="password"
                      fontFamily="'DM Sans', sans-serif"
                      fontSize="11px"
                      fontWeight="500"
                      letterSpacing="0.12em"
                      textTransform="uppercase"
                      color="rgba(245,239,230,0.5)"
                    >
                      Password
                    </Text>
                  </Box>
                  <FormInput<LoginFormValues>
                    name="password"
                    control={form.control}
                    label=""
                    type="password"
                    sx={{
                      input: {
                        bg: 'rgba(245,239,230,0.05)',
                        border: '1px solid rgba(245,239,230,0.15)',
                        borderRadius: '2px',
                        color: '#f5efe6',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '14px',
                        fontWeight: '300',
                        letterSpacing: '0.02em',
                        h: '44px',
                        px: 4,
                        _placeholder: { color: 'rgba(245,239,230,0.2)' },
                        _hover: { borderColor: 'rgba(245,239,230,0.3)' },
                        _focus: {
                          borderColor: '#d48c28',
                          boxShadow: '0 0 0 1px #d48c28',
                          bg: 'rgba(212,140,40,0.06)',
                        },
                      },
                    }}
                  />
                </Box>

                {/* submit */}
                <Button
                  type="submit"
                  width="full"
                  isLoading={isLoggingIn}
                  loadingText="Signing in…"
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
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mt={1}
                  _hover={{ bg: '#f5c842' }}
                  _active={{ bg: '#ba7517' }}
                  _loading={{
                    bg: '#d48c28',
                    opacity: 0.7,
                  }}
                  transition="background 0.15s"
                >
                  Log in
                </Button>

              </VStack>
            </form>

            {/* footer link */}
            <Box
              mt={8}
              pt={6}
              borderTop="1px solid rgba(245,239,230,0.08)"
              textAlign="center"
            >
              <Text
                fontFamily="'DM Sans', sans-serif"
                fontSize="13px"
                fontWeight="300"
                color="rgba(245,239,230,0.35)"
                letterSpacing="0.02em"
              >
                No account?{' '}
                <ChakraLink
                  as={Link}
                  href="/auth/register"
                  color="#d48c28"
                  fontWeight="500"
                  _hover={{ color: '#f5c842', textDecoration: 'none' }}
                  transition="color 0.15s"
                >
                  Sign up free
                </ChakraLink>
              </Text>
            </Box>

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
            color="rgba(245,239,230,0.25)"
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box
          minH="100vh"
          bg="#0a0908"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontFamily="'DM Serif Display', Georgia, serif"
            fontStyle="italic"
            fontSize="18px"
            color="rgba(245,239,230,0.3)"
          >
            Loading…
          </Text>
        </Box>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}