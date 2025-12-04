import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateStoryData {
  media_url: string;
}

export const useStories = (establishmentId?: string) => {
  const queryClient = useQueryClient();

  // Buscar stories ativos do estabelecimento
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories', establishmentId],
    queryFn: async () => {
      let query = supabase
        .from('stories')
        .select('*, estabelecimentos!fk_stories_estabelecimento(nome_fantasia, logo_url)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (establishmentId) {
        query = query.eq('establishment_id', establishmentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!establishmentId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // REALTIME: Escutar mudanças nos stories
  useEffect(() => {
    console.log('[useStories] Configurando realtime listener...');
    
    const filter = establishmentId 
      ? { filter: `establishment_id=eq.${establishmentId}` }
      : {};
    
    const channel = supabase
      .channel(`stories-${establishmentId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories',
          ...filter,
        },
        (payload) => {
          console.log('[Realtime] Story mudou:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['stories'] });
          queryClient.invalidateQueries({ queryKey: ['has-story-today'] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Stories subscription:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [establishmentId, queryClient]);

  // Verificar se tem story ativo
  const hasActiveStory = stories.length > 0;

  // Verificar se já postou story hoje
  const { data: hasStoryToday = false } = useQuery({
    queryKey: ['has-story-today', establishmentId],
    queryFn: async () => {
      if (!establishmentId) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('stories')
        .select('id')
        .eq('establishment_id', establishmentId)
        .gte('created_at', today.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!establishmentId,
    staleTime: 0,
  });

  // Criar story
  const createStoryMutation = useMutation({
    mutationFn: async (data: CreateStoryData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('stories')
        .insert({
          establishment_id: user.id,
          ...data,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['has-story-today'] });
      toast.success('Story publicado! Ele ficará visível por 24h ⏰');
    },
    onError: (error: any) => {
      if (error.message.includes('Limite diário')) {
        toast.error('Você já postou um Story hoje! Volte amanhã.');
      } else {
        toast.error('Erro ao publicar story');
      }
    },
  });

  return {
    stories,
    isLoading,
    hasActiveStory,
    hasStoryToday,
    createStory: createStoryMutation.mutate,
    isCreating: createStoryMutation.isPending,
  };
};

// Hook para todos os stories ativos (feed)
export const useAllStories = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['all-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*, estabelecimentos!fk_stories_estabelecimento(nome_fantasia, logo_url, cidade)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // REALTIME
  useEffect(() => {
    const channel = supabase
      .channel('all-stories-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stories' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['all-stories'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};
