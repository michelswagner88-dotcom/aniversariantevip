import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
        .select('*, estabelecimentos(nome_fantasia, logo_url)')
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
  });

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