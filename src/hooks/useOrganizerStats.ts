'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { OrganizerStats } from '@/lib/types';

export function useOrganizerStats() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['organizer-stats', user?.id],
    queryFn: async () => {
      const res = await dashboardApi.organizerStats();
      return res.data as OrganizerStats;
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 60_000,
    retry: false,
  });
}
