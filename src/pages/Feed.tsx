import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function Feed() {
  const navigate = useNavigate();

  // Buscar posts dos estabelecimentos que o usuário segue
  const { data: feedPosts = [], isLoading } = useQuery({
    queryKey: ['feed-posts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Buscar IDs dos estabelecimentos seguidos
      const { data: following } = await supabase
        .from('followers')
        .select('establishment_id')
        .eq('user_id', user.id);

      if (!following || following.length === 0) return [];

      const followedIds = following.map(f => f.establishment_id);

      // Buscar posts desses estabelecimentos
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          estabelecimentos(
            id,
            nome_fantasia,
            logo_url,
            cidade
          )
        `)
        .in('establishment_id', followedIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return posts || [];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Carregando seu feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/90 backdrop-blur-xl py-4">
        <div className="container mx-auto px-6">
          <BackButton to="/" />
          <h1 className="text-2xl font-plus-jakarta font-extrabold mt-3 flex items-center gap-2">
            <Sparkles className="text-violet-400" size={24} />
            Novidades VIP
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Fique por dentro das promoções dos seus lugares favoritos
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {feedPosts.length === 0 ? (
          // Empty State
          <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-pink-500/10 p-8 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-2">Seu feed está vazio!</h3>
            <p className="text-slate-400 mb-6">
              Siga seus lugares favoritos para ver promoções exclusivas aqui
            </p>
            <button
              onClick={() => navigate('/explorar')}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 rounded-xl font-bold hover:brightness-110 transition-all"
            >
              Explorar Lugares
            </button>
          </Card>
        ) : (
          // Feed Posts
          <div className="space-y-6">
            {feedPosts.map((post: any) => (
              <Card key={post.id} className="border-white/10 bg-slate-900/50 overflow-hidden">
                {/* Header do Post */}
                <div className="flex items-center gap-3 p-4">
                  <img
                    src={post.estabelecimentos.logo_url || 'https://via.placeholder.com/40'}
                    alt={post.estabelecimentos.nome_fantasia}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div className="flex-1">
                    <button
                      onClick={() => navigate(`/estabelecimento/${post.establishment_id}`)}
                      className="font-semibold hover:text-violet-400 transition-colors"
                    >
                      {post.estabelecimentos.nome_fantasia}
                    </button>
                    <p className="text-xs text-slate-500">
                      {post.estabelecimentos.cidade} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* Imagem do Post */}
                <img
                  src={post.image_url}
                  alt="Post"
                  className="w-full aspect-square object-cover"
                />

                {/* Ações */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors">
                      <Heart size={22} />
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors">
                      <MessageCircle size={22} />
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors ml-auto">
                      <Share2 size={20} />
                    </button>
                  </div>

                  {/* Legenda */}
                  {post.caption && (
                    <p className="text-sm">
                      <span className="font-semibold">{post.estabelecimentos.nome_fantasia}</span>{' '}
                      {post.caption}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}