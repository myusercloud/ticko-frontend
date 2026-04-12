import axios, { AxiosError } from 'axios';
import { getToken, clearToken } from './auth';
import type {
  Event,
  EventStats,
  PaymentIntentResponse,
  ScanResult,
  Ticket,
  User,
  OrganizerStats,
} from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;

  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearToken();
      window.location.href = '/auth/login';
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An error occurred';

    return Promise.reject(new Error(message));
  }
);

export interface EventsListResponse {
  items: Event[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateOrderPayload {
  eventId: string;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
  }>;
}

export interface OrderResponse {
  id: string;
  eventId: string;
  status?: string;
  totalAmount?: number;
}

export interface CreateEventPayload {
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
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  me: () => api.get<User>('/auth/me'),
};

export const eventsApi = {
  list: (params?: { search?: string }) =>
    api.get<EventsListResponse>('/events', { params }),

  get: (id: string) => api.get<Event>(`/events/${id}`),

  create: (data: CreateEventPayload) => api.post<Event>('/events', data),

  update: (id: string, data: UpdateEventPayload) =>
    api.patch<Event>(`/events/${id}`, data),

  delete: (id: string) => api.delete(`/events/${id}`),
};

export const ticketsApi = {
  list: () => api.get<Ticket[]>('/tickets'),

  scan: (data: { ticketId: string; qrPayload?: string }) =>
    api.post<ScanResult>('/tickets/scan', data),
};

export const paymentsApi = {
  createIntent: (data: {
    eventId: string;
    ticketTypeId: string;
    quantity: number;
  }) => api.post<PaymentIntentResponse>('/payments/create-intent', data),
};

export const dashboardApi = {
  eventStats: (eventId: string) =>
    api.get<EventStats>(`/dashboard/events/${eventId}/stats`),

  organizerStats: () => api.get<OrganizerStats>('/dashboard/organizer/stats'),
};

export const ordersApi = {
  create: (data: CreateOrderPayload) => api.post<OrderResponse>('/orders', data),
};

export const healthApi = {
  check: () => axios.get('http://localhost:4000/health'),
};
