'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { QueryProvider } from '@/providers/QueryProvider';
import theme from '@/lib/theme';

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider theme={theme}>
      <QueryProvider>{children}</QueryProvider>
    </ChakraProvider>
  );
}
