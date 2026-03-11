'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { QueryProvider } from '@/providers/QueryProvider';
import theme from '@/lib/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </QueryProvider>
  );
}
