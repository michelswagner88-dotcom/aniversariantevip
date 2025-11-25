import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';
import { Tables } from '@/integrations/supabase/types';

type Cupom = Tables<'cupons'>;

// Hook para listar cupons do usuário com cache
export const useMeusCupons = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.cupons.list(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('cupons')
        .select(`
          *,
          estabelecimentos (
            nome_fantasia,
            logo_url,
            endereco,
            telefone,
            whatsapp
          )
        `)
        .eq('aniversariante_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    // Cupons mudam com menos frequência, cache moderado
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para cupons ativos (não usados e não expirados)
export const useCuponsAtivos = (userId: string | undefined) => {
  return useQuery({
    queryKey: [...queryKeys.cupons.list(userId || ''), 'ativos'],
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('cupons')
        .select(`
          *,
          estabelecimentos (
            nome_fantasia,
            logo_url,
            endereco,
            telefone,
            whatsapp,
            descricao_beneficio
          )
        `)
        .eq('aniversariante_id', userId)
        .eq('usado', false)
        .gt('data_validade', new Date().toISOString())
        .is('deleted_at', null)
        .order('data_validade', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minuto (cupons ativos precisam ser mais atualizados)
  });
};

// Mutation para emitir cupom com rate limiting
export const useEmitirCupom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      aniversarianteId, 
      estabelecimentoId 
    }: { 
      aniversarianteId: string; 
      estabelecimentoId: string; 
    }) => {
      const { data, error } = await supabase.rpc('emit_coupon_secure', {
        p_aniversariante_id: aniversarianteId,
        p_estabelecimento_id: estabelecimentoId,
      });
      
      if (error) throw error;
      
      // Verificar se houve erro na resposta da função
      if (data && data[0]?.error_message) {
        throw new Error(data[0].error_message);
      }
      
      return data[0];
    },
    onSuccess: (_, variables) => {
      // Invalidar cache de cupons do usuário
      queryClient.invalidateQueries({
        queryKey: queryKeys.cupons.list(variables.aniversarianteId),
      });
      
      // Invalidar analytics do estabelecimento
      queryClient.invalidateQueries({
        queryKey: queryKeys.analytics.establishment(variables.estabelecimentoId),
      });
    },
  });
};
