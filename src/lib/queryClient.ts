import { QueryClient } from '@tanstack/react-query';

// Configuração otimizada do React Query para alta escala
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos (estabelecimentos mudam raramente)
      staleTime: 5 * 60 * 1000,
      // Manter dados em cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Retry inteligente: não fazer retry em erros 4xx (cliente)
      retry: (failureCount, error: any) => {
        // Não fazer retry em erros 4xx (cliente)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry até 3x em outros erros (5xx, timeout, rede)
        return failureCount < 3;
      },
      // Exponential backoff: 1s, 2s, 4s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Não refetch ao voltar para a aba
      refetchOnWindowFocus: false,
      // Não refetch em mount se dados ainda são frescos
      refetchOnMount: false,
    },
    mutations: {
      // Mutations não devem fazer retry automático
      retry: false,
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
