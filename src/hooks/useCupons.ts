import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';
import { Tables } from '@/integrations/supabase/types';

type Cupom = Tables<'cupons'>;

// Hook para listar cupons do usuário com cache e REALTIME
export const useMeusCupons = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
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
    staleTime: 0, // Sempre considerar stale para realtime
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // REALTIME: Escutar mudanças nos cupons do usuário
  useEffect(() => {
    if (!userId) return;
    
    console.log('[useCupons] Configurando realtime listener...');
    
    const channel = supabase
      .channel(`cupons-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cupons',
          filter: `aniversariante_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Realtime] Cupom mudou:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: queryKeys.cupons.list(userId) });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Cupons subscription:', status);
      });

    return () => {
      console.log('[Realtime] Removendo cupons listener...');
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
};

// Hook para cupons ativos (não usados e não expirados)
export const useCuponsAtivos = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
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
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // REALTIME já configurado em useMeusCupons - compartilha invalidação
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel(`cupons-ativos-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cupons',
          filter: `aniversariante_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [...queryKeys.cupons.list(userId), 'ativos'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
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
