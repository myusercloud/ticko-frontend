'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  Link as ChakraLink,
} from '@chakra-ui/react';
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

function LoginFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') ?? '/';
  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
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
    <Container maxW="md" py={12} px={4}>
      <Card bg="white" boxShadow="md">
        <CardBody p={8}>
          <Heading size="lg" mb={2} textAlign="center">
            Log in to Ticko
          </Heading>

          <Text color="gray.600" textAlign="center" mb={6}>
            Enter your credentials
          </Text>

          {loginError && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {(loginError as Error).message}
            </Alert>
          )}

          <form onSubmit={onSubmit}>
            <VStack spacing={4} align="stretch">
              <FormInput<LoginFormValues>
                name="email"
                control={form.control}
                label="Email"
                type="email"
              />
              <FormInput<LoginFormValues>
                name="password"
                control={form.control}
                label="Password"
                type="password"
              />
              <Button
                type="submit"
                colorScheme="brand"
                width="full"
                isLoading={isLoggingIn}
                loadingText="Signing in..."
              >
                Log in
              </Button>
            </VStack>
          </form>

          <Text mt={4} textAlign="center" fontSize="sm" color="gray.600">
            Don&apos;t have an account?{' '}
            <ChakraLink as={Link} href="/auth/register" color="brand.600">
              Sign up
            </ChakraLink>
          </Text>
        </CardBody>
      </Card>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Container maxW="md" py={12} px={4}>
          <Text textAlign="center">Loading...</Text>
        </Container>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
