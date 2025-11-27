import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePostInteractions = (postId?: string) => {
  const queryClient = useQueryClient();

  // Buscar likes de um post
  const { data: likes = [] } = useQuery({
    queryKey: ['post-likes', postId],
    queryFn: async () => {
      if (!postId) return [];
      
      const { data, error } = await supabase
        .from('post_interactions')
        .select('user_id')
        .eq('post_id', postId)
        .eq('type', 'like');

      if (error) throw error;
      return data || [];
    },
    enabled: !!postId,
  });

  // Verificar se o usuário atual deu like
  const { data: hasLiked = false } = useQuery({
    queryKey: ['post-user-like', postId],
    queryFn: async () => {
      if (!postId) return false;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('type', 'like')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!postId,
  });

  // Buscar comentários de um post
  const { data: comments = [] } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from('post_interactions')
        .select('*, profiles(nome)')
        .eq('post_id', postId)
        .eq('type', 'comment')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!postId,
  });

  // Dar/remover like
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId: pid, unlike }: { postId: string; unlike?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      if (unlike) {
        // Remover like
        const { error } = await supabase
          .from('post_interactions')
          .delete()
          .eq('post_id', pid)
          .eq('user_id', user.id)
          .eq('type', 'like');

        if (error) throw error;
      } else {
        // Adicionar like
        const { error } = await supabase
          .from('post_interactions')
          .insert({
            post_id: pid,
            user_id: user.id,
            type: 'like',
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-likes'] });
      queryClient.invalidateQueries({ queryKey: ['post-user-like'] });
    },
    onError: () => {
      toast.error('Erro ao curtir post');
    },
  });

  // Adicionar comentário
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId: pid, text }: { postId: string; text: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('post_interactions')
        .insert({
          post_id: pid,
          user_id: user.id,
          type: 'comment',
          comment_text: text,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
      toast.success('Comentário adicionado!');
    },
    onError: () => {
      toast.error('Erro ao comentar');
    },
  });

  return {
    likes,
    likesCount: likes.length,
    hasLiked,
    comments,
    commentsCount: comments.length,
    toggleLike: toggleLikeMutation.mutate,
    isTogglingLike: toggleLikeMutation.isPending,
    addComment: addCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
  };
};
