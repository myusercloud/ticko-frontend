'use client';

import { Box, Grid, Heading, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import type { EventStats } from '@/lib/types';

interface DashboardStatsProps {
  stats: EventStats | undefined;
  isLoading?: boolean;
}

function StatCard({
  label,
  value,
  helpText,
}: {
  label: string;
  value: string | number;
  helpText?: string;
}) {
  return (
    <Box bg="white" p={5} borderRadius="lg" boxShadow="sm" borderWidth="1px">
      <Stat>
        <StatLabel color="gray.600">{label}</StatLabel>
        <StatNumber fontSize="2xl">{value}</StatNumber>
        {helpText && <StatHelpText>{helpText}</StatHelpText>}
      </Stat>
    </Box>
  );
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            bg="gray.100"
            p={5}
            borderRadius="lg"
            boxShadow="sm"
            h="24"
          />
        ))}
      </Grid>
    );
  }

  const revenue = stats?.totalRevenue ?? 0;
  const sold = stats?.ticketsSold ?? 0;
  const attendance = stats?.attendance ?? sold;

  return (
    <Box>
      <Heading size="sm" mb={4} color="gray.600">
        Event statistics
      </Heading>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <StatCard
          label="Revenue"
          value={`$${Number(revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          helpText="Total sales"
        />
        <StatCard label="Tickets sold" value={sold} helpText="Total tickets" />
        <StatCard label="Attendance" value={attendance} helpText="Checked in" />
      </Grid>
    </Box>
  );
}
