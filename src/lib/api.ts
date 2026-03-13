import axios, { AxiosError } from 'axios';
import { getToken, clearToken } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        clearToken();
        window.location.href = '/auth/login';
      }
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// API methods
export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: unknown }>('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const eventsApi = {
  list: (params?: { search?: string }) => api.get<unknown[]>('/events', { params }),
  get: (id: string) => api.get<unknown>(`/events/${id}`),
  create: (data: unknown) => api.post('/events', data),
  update: (id: string, data: unknown) => api.patch(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

export const ticketsApi = {
  list: () => api.get<unknown[]>('/tickets'),
  scan: (data: { ticketId: string; qrPayload?: string }) =>
    api.post<unknown>('/tickets/scan', data),
};

export const paymentsApi = {
  createIntent: (data: { eventId: string; ticketTypeId: string; quantity: number }) =>
    api.post<unknown>('/payments/create-intent', data),
};

export const dashboardApi = {
  eventStats: (eventId: string) =>
    api.get<unknown>(`/dashboard/events/${eventId}/stats`),
};

export const healthApi = {
  check: () => axios.get('http://localhost:4000/health'),
};
