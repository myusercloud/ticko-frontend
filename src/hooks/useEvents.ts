'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { eventsApi, dashboardApi } from '@/lib/api';
import type { Event, EventStats } from '@/lib/types';

export function useEvents(params?: { search?: string }) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      const res = await eventsApi.list(params);
      return (res.data ?? []) as Event[];
    },
  });
}

export function useEvent(id: string | null) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) throw new Error('No event id');
      const res = await eventsApi.get(id);
      return res.data as Event;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Event> & { ticketTypes: Event['ticketTypes'] }) => {
      const res = await eventsApi.create(data);
      return res.data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Event>) => {
      const res = await eventsApi.update(id, data);
      return res.data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useEventStats(eventId: string | null) {
  return useQuery({
    queryKey: ['eventStats', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error('No event id');
      const res = await dashboardApi.eventStats(eventId);
      return res.data as EventStats;
    },
    enabled: !!eventId,
  });
}
