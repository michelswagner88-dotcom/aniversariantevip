import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreatePostData {
  image_url: string;
  caption?: string;
}

export const usePosts = (establishmentId?: string) => {
  const queryClient = useQueryClient();

  // Buscar posts do estabelecimento
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', establishmentId],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select('*, estabelecimentos(nome_fantasia, logo_url)')
        .order('created_at', { ascending: false });

      if (establishmentId) {
        query = query.eq('establishment_id', establishmentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!establishmentId,
  });

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