import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export interface OrganizerStats {
  totalTicketsSold: number;
  totalRevenue: number;
  checkInRate: number | null; // percentage, last completed event
}

async function fetchOrganizerStats(): Promise<OrganizerStats> {
  const res = await fetch('/api/organizer/stats');
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export function useOrganizerStats() {
  const { user } = useAuth();

  return useQuery<OrganizerStats>({
    queryKey: ['organizer-stats', user?.id],
    queryFn: fetchOrganizerStats,
    enabled: !!user,
    staleTime: 60_000,
  });
}