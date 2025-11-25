import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';

// Hook otimizado para favoritos com cache inteligente
export const useFavoritosOptimized = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.favoritos.list(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('favoritos')
        .select(`
          id,
          created_at,
          estabelecimentos (
            id,
            nome_fantasia,
            logo_url,
            cidade,
            estado,
            categoria,
            descricao_beneficio,
            endereco,
            telefone,
            whatsapp
          )
        `)
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
};

// Mutation otimista para adicionar favorito (UI instantânea)
export const useAdicionarFavorito = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, estabelecimentoId }: { userId: string; estabelecimentoId: string }) => {
      const { data, error } = await supabase
        .from('favoritos')
        .insert({
          usuario_id: userId,
          estabelecimento_id: estabelecimentoId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    // Update otimista: UI atualiza instantaneamente
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favoritos.list(variables.userId) });
      
      const previousFavoritos = queryClient.getQueryData(queryKeys.favoritos.list(variables.userId));
      
      // Otimisticamente adicionar à UI
      queryClient.setQueryData(queryKeys.favoritos.list(variables.userId), (old: any) => {
        return old ? [...old, { 
          id: 'temp-id', 
          estabelecimento_id: variables.estabelecimentoId,
          created_at: new Date().toISOString()
        }] : [];
      });
      
      return { previousFavoritos };
    },
    onError: (err, variables, context: any) => {
      // Reverter em caso de erro
      if (context?.previousFavoritos) {
        queryClient.setQueryData(
          queryKeys.favoritos.list(variables.userId), 
          context.previousFavoritos
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Sempre revalidar após sucesso ou erro
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.favoritos.list(variables.userId) 
      });
    },
  });
};

// Mutation otimista para remover favorito
export const useRemoverFavorito = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ favoritoId }: { favoritoId: string }) => {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('id', favoritoId);
      
      if (error) throw error;
    },
    onMutate: async (variables) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: queryKeys.favoritos.all });
      
      const previousFavoritos = queryClient.getQueryData(queryKeys.favoritos.all);
      
      // Remover otimisticamente da UI
      queryClient.setQueriesData({ queryKey: queryKeys.favoritos.all }, (old: any) => {
        return old ? old.filter((fav: any) => fav.id !== variables.favoritoId) : [];
      });
      
      return { previousFavoritos };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousFavoritos) {
        queryClient.setQueryData(queryKeys.favoritos.all, context.previousFavoritos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favoritos.all });
    },
  });
};
