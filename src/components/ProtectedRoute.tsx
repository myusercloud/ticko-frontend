'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Center minH="40vh">
        <Spinner size="xl" colorScheme="brand" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
