import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
}

// Hook otimizado para listar estabelecimentos com cache e filtros
export const useEstabelecimentos = (filters: EstabelecimentoFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.estabelecimentos.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('public_estabelecimentos')
        .select('*')
        .eq('ativo', true) // Apenas estabelecimentos ativos
        .order('created_at', { ascending: false });

      // Aplicar filtros (ignora cidade/estado se showAll está ativo)
      if (filters.cidade && !filters.showAll) {
        query = query.ilike('cidade', sanitizarInput(filters.cidade, 100));
      }
      if (filters.estado && !filters.showAll) {
        query = query.eq('estado', sanitizarInput(filters.estado, 2));
      }
      if (filters.categoria && filters.categoria.length > 0) {
        // Categorias são enums controlados, não precisam sanitização mas aplicamos por segurança
        const categoriasSanitizadas = filters.categoria.map(c => sanitizarInput(c, 50));
        query = query.overlaps('categoria', categoriasSanitizadas);
      }
      if (filters.search) {
        const searchSanitizado = sanitizarInput(filters.search, 100);
        query = query.or(`nome_fantasia.ilike.%${searchSanitizado}%,razao_social.ilike.%${searchSanitizado}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Estabelecimento[];
    },
    // Cache agressivo para estabelecimentos (dados mudam pouco)
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
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
        .eq('ativo', true) // Apenas estabelecimentos ativos
        .single();
      
      if (error) throw error;
      return data as Estabelecimento;
    },
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutos (detalhes mudam ainda menos)
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
