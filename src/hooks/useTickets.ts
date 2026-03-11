'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/lib/api';
import type { Ticket } from '@/lib/types';

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const res = await ticketsApi.list();
      return (res.data ?? []) as Ticket[];
    },
  });
}

export function useScanTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { ticketId: string; qrPayload?: string }) =>
      ticketsApi.scan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
