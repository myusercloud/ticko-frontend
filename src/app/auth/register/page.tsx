'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

const schema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    name: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register: registerUser,
    isRegistering,
    registerError,
    isAuthenticated,
  } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
      router.refresh();
    }
  }, [isAuthenticated, router]);

  const onSubmit = form.handleSubmit(async (data) => {
    await registerUser({
      email: data.email,
      password: data.password,
      name: data.name || undefined,
    });
  });

  return (
    <Container maxW="md" py={12} px={4}>
      <Card bg="white" boxShadow="md">
        <CardBody p={8}>
          <Heading size="lg" mb={2} textAlign="center">
            Create your account
          </Heading>

          <Text color="gray.600" textAlign="center" mb={6}>
            Join Ticko to buy and manage tickets
          </Text>

          {registerError && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {(registerError as Error).message}
            </Alert>
          )}

          <form onSubmit={onSubmit}>
            <VStack spacing={4} align="stretch">
              <FormInput<RegisterFormValues>
                name="name"
                control={form.control}
                label="Name (optional)"
              />
              <FormInput<RegisterFormValues>
                name="email"
                control={form.control}
                label="Email"
                type="email"
              />
              <FormInput<RegisterFormValues>
                name="password"
                control={form.control}
                label="Password"
                type="password"
              />
              <FormInput<RegisterFormValues>
                name="confirmPassword"
                control={form.control}
                label="Confirm password"
                type="password"
              />
              <Button
                type="submit"
                colorScheme="brand"
                width="full"
                isLoading={isRegistering}
                loadingText="Creating account..."
              >
                Sign up
              </Button>
            </VStack>
          </form>

          <Text mt={4} textAlign="center" fontSize="sm" color="gray.600">
            Already have an account?{' '}
            <ChakraLink as={Link} href="/auth/login" color="brand.600">
              Log in
            </ChakraLink>
          </Text>
        </CardBody>
      </Card>
    </Container>
  );
}
