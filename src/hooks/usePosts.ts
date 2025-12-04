import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreatePostData {
  image_url: string;
  caption?: string;
  type?: 'photo' | 'promo' | 'agenda';
}

export const usePosts = (establishmentId?: string) => {
  const queryClient = useQueryClient();

  // Buscar posts do estabelecimento
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', establishmentId],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select('*, estabelecimentos!fk_posts_estabelecimento(nome_fantasia, logo_url)')
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

  // REALTIME: Escutar mudanças nos posts
  useEffect(() => {
    console.log('[usePosts] Configurando realtime listener...');
    
    const filter = establishmentId 
      ? { filter: `establishment_id=eq.${establishmentId}` }
      : {};
    
    const channel = supabase
      .channel(`posts-${establishmentId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          ...filter,
        },
        (payload) => {
          console.log('[Realtime] Post mudou:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          queryClient.invalidateQueries({ queryKey: ['has-posted-today'] });
          queryClient.invalidateQueries({ queryKey: ['feed'] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Posts subscription:', status);
      });

    return () => {
      console.log('[Realtime] Removendo posts listener...');
      supabase.removeChannel(channel);
    };
  }, [establishmentId, queryClient]);

  // Verificar se já postou hoje
  const { data: hasPostedToday = false } = useQuery({
    queryKey: ['has-posted-today', establishmentId],
    queryFn: async () => {
      if (!establishmentId) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('posts')
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

  // Criar post
  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('posts')
        .insert({
          establishment_id: user.id,
          ...data,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['has-posted-today'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post publicado com sucesso! 📸');
    },
    onError: (error: any) => {
      if (error.message.includes('Limite diário')) {
        toast.error('Você já postou hoje! Volte amanhã para compartilhar mais.');
      } else {
        toast.error('Erro ao publicar post');
      }
    },
  });

  return {
    posts,
    isLoading,
    hasPostedToday,
    createPost: createPostMutation.mutate,
    isCreating: createPostMutation.isPending,
  };
};

// Hook para feed geral (todos os posts)
export const useFeed = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, estabelecimentos!fk_posts_estabelecimento(nome_fantasia, logo_url, cidade, estado)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // REALTIME: Escutar todos os posts
  useEffect(() => {
    console.log('[useFeed] Configurando realtime listener...');
    
    const channel = supabase
      .channel('feed-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('[Realtime] Feed post mudou:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['feed'] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Feed subscription:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};
