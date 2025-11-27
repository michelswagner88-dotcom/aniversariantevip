import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFollowers = (establishmentId?: string) => {
  const queryClient = useQueryClient();

  // Verificar se o usuário segue este estabelecimento
  const { data: isFollowing, isLoading: checkingFollow } = useQuery({
    queryKey: ['following', establishmentId],
    queryFn: async () => {
      if (!establishmentId) return false;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('user_id', user.id)
        .eq('establishment_id', establishmentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!establishmentId,
  });

  // Contar seguidores do estabelecimento
  const { data: followersCount = 0 } = useQuery({
    queryKey: ['followers-count', establishmentId],
    queryFn: async () => {
      if (!establishmentId) return 0;

      const { count, error } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('establishment_id', establishmentId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!establishmentId,
  });

  // Seguir estabelecimento
  const followMutation = useMutation({
    mutationFn: async (estId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('followers')
        .insert({ user_id: user.id, establishment_id: estId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers-count'] });
      toast.success('Você está seguindo agora! 🎉');
    },
    onError: () => {
      toast.error('Erro ao seguir estabelecimento');
    },
  });

  // Deixar de seguir
  const unfollowMutation = useMutation({
    mutationFn: async (estId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('user_id', user.id)
        .eq('establishment_id', estId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers-count'] });
      toast.success('Você deixou de seguir');
    },
    onError: () => {
      toast.error('Erro ao deixar de seguir');
    },
  });

  return {
    isFollowing,
    checkingFollow,
    followersCount,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isFollowLoading: followMutation.isPending || unfollowMutation.isPending,
  };
};