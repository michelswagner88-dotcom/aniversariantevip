import { QueryClient } from '@tanstack/react-query';

// Configuração otimizada do React Query para alta escala
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos (estabelecimentos mudam raramente)
      staleTime: 5 * 60 * 1000,
      // Manter dados em cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Retry em caso de falha (network issues)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch em background quando janela volta ao foco
      refetchOnWindowFocus: true,
      // Não refetch em mount se dados ainda são frescos
      refetchOnMount: false,
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
