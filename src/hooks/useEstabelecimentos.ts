import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';
import { Tables } from '@/integrations/supabase/types';
import { sanitizarInput } from '@/lib/sanitize';

type Estabelecimento = Tables<'estabelecimentos'>;

interface EstabelecimentoFilters {
  cidade?: string;
  estado?: string;
  categoria?: string[];
  search?: string;
  showAll?: boolean;
  enabled?: boolean;
}

// Hook otimizado para listar estabelecimentos com cache, filtros e REALTIME
export const useEstabelecimentos = (filters: EstabelecimentoFilters = {}) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: queryKeys.estabelecimentos.list(filters),
    queryFn: async () => {
      console.log('[useEstabelecimentos] Executando query com filtros:', filters);
      
      let q = supabase
        .from('public_estabelecimentos')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (filters.cidade && !filters.showAll) {
        const cidadeSanitizada = sanitizarInput(filters.cidade, 100);
        console.log('[useEstabelecimentos] Filtrando por cidade:', cidadeSanitizada);
        q = q.ilike('cidade', `%${cidadeSanitizada}%`);
      }
      if (filters.estado && !filters.showAll) {
        q = q.ilike('estado', sanitizarInput(filters.estado, 2));
      }
      if (filters.categoria && filters.categoria.length > 0) {
        const categoriasSanitizadas = filters.categoria.map(c => sanitizarInput(c, 50));
        q = q.overlaps('categoria', categoriasSanitizadas);
      }
      if (filters.search) {
        const searchSanitizado = sanitizarInput(filters.search, 100);
        q = q.or(`nome_fantasia.ilike.%${searchSanitizado}%,razao_social.ilike.%${searchSanitizado}%`);
      }

      const { data, error } = await q;
      
      console.log('[useEstabelecimentos] Resultado:', { 
        count: data?.length, 
        error: error?.message,
        filters 
      });
      
      if (error) throw error;
      return data as Estabelecimento[];
    },
    staleTime: 60000, // Cache por 1 minuto para evitar flashes
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Não refetch ao focar - evita tela branca
    enabled: filters.enabled !== false,
  });

  // REALTIME: Escutar mudanças na tabela estabelecimentos
  useEffect(() => {
    console.log('[useEstabelecimentos] Configurando listener realtime...');
    
    const channel = supabase
      .channel('estabelecimentos-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'estabelecimentos',
        },
        (payload) => {
          console.log('[Realtime] Mudança detectada:', payload.eventType);
          
          // Invalidar TODAS as queries de estabelecimentos
          queryClient.invalidateQueries({ queryKey: ['estabelecimentos'] });
          queryClient.invalidateQueries({ queryKey: ['public_estabelecimentos'] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Status subscription:', status);
      });

    return () => {
      console.log('[Realtime] Removendo listener...');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

// Hook para obter detalhes de um estabelecimento específico
export const useEstabelecimento = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.estabelecimentos.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('ID não fornecido');
      
      const { data, error } = await supabase
        .from('public_estabelecimentos')
        .select('*')
        .eq('id', id)
        .eq('ativo', true)
        .single();
      
      if (error) throw error;
      return data as Estabelecimento;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });
};

// Mutation para registrar visualização (analytics)
export const useTrackView = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ estabelecimentoId, userId }: { estabelecimentoId: string; userId?: string }) => {
      const { error } = await supabase
        .from('estabelecimento_analytics')
        .insert({
          estabelecimento_id: estabelecimentoId,
          tipo_evento: 'view',
          user_id: userId,
        });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidar analytics do estabelecimento
      queryClient.invalidateQueries({
        queryKey: queryKeys.analytics.establishment(variables.estabelecimentoId),
      });
    },
  });
};
