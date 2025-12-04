import { QueryClient } from '@tanstack/react-query';

// Configuração do React Query para ATUALIZAÇÃO EM TEMPO REAL
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados são considerados "stale" imediatamente para forçar refetch
      staleTime: 0,
      // Manter dados em cache por 5 minutos
      gcTime: 5 * 60 * 1000,
      // Retry inteligente: não fazer retry em erros 4xx (cliente)
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: 1000,
      // SEMPRE refetch ao voltar para a aba
      refetchOnWindowFocus: true,
      // SEMPRE refetch ao reconectar
      refetchOnReconnect: true,
      // SEMPRE refetch ao montar componente
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query Keys centralizados para invalidação eficiente
export const queryKeys = {
  estabelecimentos: {
    all: ['estabelecimentos'] as const,
    lists: () => [...queryKeys.estabelecimentos.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.estabelecimentos.lists(), filters] as const,
    details: () => [...queryKeys.estabelecimentos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.estabelecimentos.details(), id] as const,
  },
  cupons: {
    all: ['cupons'] as const,
    lists: () => [...queryKeys.cupons.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.cupons.lists(), userId] as const,
    detail: (id: string) => [...queryKeys.cupons.all, 'detail', id] as const,
  },
  favoritos: {
    all: ['favoritos'] as const,
    list: (userId: string) => [...queryKeys.favoritos.all, userId] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    establishment: (id: string) => [...queryKeys.analytics.all, 'establishment', id] as const,
  },
} as const;
