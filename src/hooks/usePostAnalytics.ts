import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';

// Hook para registrar visualização de post
export const useTrackPostView = (postId: string | null) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!postId || hasTracked.current) return;

    const trackView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
        sessionStorage.setItem('session_id', sessionId);

        await supabase.from('post_views').insert({
          post_id: postId,
          user_id: user?.id || null,
          session_id: sessionId,
        });

        hasTracked.current = true;
      } catch (error) {
        console.error('Erro ao registrar view:', error);
      }
    };

    // Aguardar 2 segundos antes de registrar (usuário realmente viu)
    const timer = setTimeout(trackView, 2000);
    return () => clearTimeout(timer);
  }, [postId]);
};

// Hook para registrar compartilhamento
export const useTrackPostShare = () => {
  const trackShare = async (postId: string, platform?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('post_shares').insert({
        post_id: postId,
        user_id: user?.id || null,
        platform: platform || 'unknown',
      });
    } catch (error) {
      console.error('Erro ao registrar share:', error);
    }
  };

  return { trackShare };
};

// Hook para buscar analytics de um post específico
export const usePostAnalytics = (postId: string) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['post-analytics', postId],
    queryFn: async () => {
      // Buscar dados do post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('*, post_interactions(type)')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      // Contar likes e comentários
      const likes = post.post_interactions?.filter((i: any) => i.type === 'like').length || 0;
      const comments = post.post_interactions?.filter((i: any) => i.type === 'comment').length || 0;

      // Buscar views únicas (por usuário)
      const { data: uniqueViews, error: viewsError } = await supabase
        .from('post_views')
        .select('user_id')
        .eq('post_id', postId);

      if (viewsError) throw viewsError;

      const uniqueUsers = new Set(uniqueViews?.map(v => v.user_id).filter(Boolean)).size;

      // Taxa de engajamento = (likes + comments + shares) / views
      const totalEngagement = likes + comments + (post.shares_count || 0);
      const engagementRate = post.views_count > 0 
        ? ((totalEngagement / post.views_count) * 100).toFixed(2)
        : '0.00';

      return {
        views: post.views_count || 0,
        likes,
        comments,
        shares: post.shares_count || 0,
        uniqueUsers,
        engagementRate,
        totalEngagement,
        createdAt: post.created_at,
      };
    },
    enabled: !!postId,
  });

  return { analytics, isLoading };
};

// Hook para buscar analytics de todos os posts do estabelecimento
export const useEstablishmentPostsAnalytics = (establishmentId?: string) => {
  const { data: postsAnalytics = [], isLoading } = useQuery({
    queryKey: ['establishment-posts-analytics', establishmentId],
    queryFn: async () => {
      if (!establishmentId) return [];

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_interactions(type)
        `)
        .eq('establishment_id', establishmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return posts.map((post: any) => {
        const likes = post.post_interactions?.filter((i: any) => i.type === 'like').length || 0;
        const comments = post.post_interactions?.filter((i: any) => i.type === 'comment').length || 0;
        const totalEngagement = likes + comments + (post.shares_count || 0);
        const engagementRate = post.views_count > 0 
          ? ((totalEngagement / post.views_count) * 100).toFixed(2)
          : '0.00';

        return {
          id: post.id,
          image_url: post.image_url,
          caption: post.caption,
          type: post.type,
          created_at: post.created_at,
          views: post.views_count || 0,
          likes,
          comments,
          shares: post.shares_count || 0,
          engagementRate,
          totalEngagement,
        };
      });
    },
    enabled: !!establishmentId,
  });

  // Calcular totais
  const totals = postsAnalytics.reduce(
    (acc, post) => ({
      views: acc.views + post.views,
      likes: acc.likes + post.likes,
      comments: acc.comments + post.comments,
      shares: acc.shares + post.shares,
      totalEngagement: acc.totalEngagement + post.totalEngagement,
    }),
    { views: 0, likes: 0, comments: 0, shares: 0, totalEngagement: 0 }
  );

  const averageEngagementRate = postsAnalytics.length > 0
    ? (
        postsAnalytics.reduce((sum, post) => sum + parseFloat(post.engagementRate), 0) /
        postsAnalytics.length
      ).toFixed(2)
    : '0.00';

  return {
    postsAnalytics,
    totals,
    averageEngagementRate,
    isLoading,
  };
};
