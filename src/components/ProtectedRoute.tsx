'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    const query = searchParams.toString();
    const currentPath = query ? `${pathname}?${query}` : pathname;

    router.replace(
      `/auth/login?redirect=${encodeURIComponent(currentPath)}`
    );
  }, [isAuthenticated, isLoading, pathname, router, searchParams]);

  if (isLoading) {
    return (
      <Center minH="40vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
