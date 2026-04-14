'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setToken, clearToken, getToken } from '@/lib/auth';
import type { User } from '@/lib/types';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setTokenState(getToken());
    setHasHydrated(true);
  }, []);

  const {
    data: user,
    isLoading: isLoadingUser,
    isFetched,
  } = useQuery({
    queryKey: ['me', token],
    queryFn: async () => {
      const res = await authApi.me();
      return res.data as User;
    },
    enabled: hasHydrated && !!token,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await authApi.login(data);
      return res.data as { token: string; user: User };
    },
    onSuccess: (data) => {
      setToken(data.token);
      setTokenState(data.token);
      queryClient.setQueryData(['me', data.token], data.user);
      queryClient.setQueryData(['me'], data.user);
      router.push('/');
      router.refresh();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      name?: string;
    }) => {
      const res = await authApi.register(data);
      return res.data as { token: string; user: User };
    },
    onSuccess: (data) => {
      setToken(data.token);
      setTokenState(data.token);
      queryClient.setQueryData(['me', data.token], data.user);
      queryClient.setQueryData(['me'], data.user);
      router.push('/');
      router.refresh();
    },
  });

  const logout = () => {
    clearToken();
    setTokenState(null);
    queryClient.removeQueries({ queryKey: ['me'] });
    router.push('/');
    router.refresh();
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: !hasHydrated || (!!token && !isFetched && isLoadingUser),
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout,
  };
}
