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
    queryKey: ['events', params?.search ?? ''],
    queryFn: async () => {
      const res = await eventsApi.list(params);
      return res.data.items as Event[];
    },
  });
}

export function useEvent(id: string | null) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('No event id');
      }

      const res = await eventsApi.get(id);
      return res.data as Event;
    },
    enabled: !!id,
  });
}

type EventPayload = {
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  date?: string;
  venue?: string | { name: string; city?: string };
  ticketTypes: Array<{
    id?: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
  }>;
};

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EventPayload) => {
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
    mutationFn: async (data: Partial<EventPayload>) => {
      const res = await eventsApi.update(id, data);
      return res.data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['eventStats', id] });
      queryClient.invalidateQueries({ queryKey: ['organizer-stats'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await eventsApi.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-stats'] });
    },
  });
}

export function useEventStats(eventId: string | null) {
  return useQuery({
    queryKey: ['eventStats', eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error('No event id');
      }

      const res = await dashboardApi.eventStats(eventId);
      return res.data as EventStats;
    },
    enabled: !!eventId,
  });
}
