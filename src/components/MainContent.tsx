'use client';

import { Box } from '@chakra-ui/react';

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <Box as="main" minH="calc(100vh - 56px)" pb={8}>
      {children}
    </Box>
  );
}
