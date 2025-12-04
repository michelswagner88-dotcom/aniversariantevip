import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { SafeImage } from '@/components/SafeImage';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { usePostInteractions } from '@/hooks/usePostInteractions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrackPostView, useTrackPostShare } from '@/hooks/usePostAnalytics';
import { toast } from 'sonner';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { PostCardSkeleton } from '@/components/skeletons/PostCardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { useSEO } from '@/hooks/useSEO';
import { SEO_CONTENT } from '@/constants/seo';

const PostCard = ({ post, navigate }: { post: any; navigate: any }) => {
  const { likesCount, hasLiked, toggleLike, commentsCount, addComment, isTogglingLike } = usePostInteractions(post.id);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Track view (aguarda 2s para confirmar visualização)
  useTrackPostView(post.id);
  const { trackShare } = useTrackPostShare();

  const handleLike = () => {
    toggleLike({ postId: post.id, unlike: hasLiked });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment({ postId: post.id, text: commentText });
    setCommentText('');
  };

  const handleShare = async () => {
    const shareData = {
      title: post.estabelecimentos.nome_fantasia,
      text: post.caption || 'Confira esse post!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackShare(post.id, 'native');
        toast.success('Post compartilhado!');
      } else {
        // Fallback: copiar link
        await navigator.clipboard.writeText(window.location.href);
        trackShare(post.id, 'clipboard');
        toast.success('Link copiado!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <Card className="border-white/10 bg-slate-900/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <SafeImage
          src={post.estabelecimentos.logo_url || ''}
          alt={post.estabelecimentos.nome_fantasia}
          className="w-10 h-10 rounded-full object-cover border border-white/10"
        />
        <div className="flex-1">
          <button
            onClick={() => {
              const url = getEstabelecimentoUrl({
                estado: post.estabelecimentos.estado,
                cidade: post.estabelecimentos.cidade,
                slug: post.estabelecimentos.slug,
                id: post.establishment_id
              });
              navigate(url);
            }}
            className="font-semibold hover:text-violet-400 transition-colors"
          >
            {post.estabelecimentos.nome_fantasia}
          </button>
          <p className="text-xs text-slate-500">
            {post.estabelecimentos.cidade} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Image */}
      <SafeImage
        src={post.image_url}
        alt="Post"
        className="w-full aspect-square object-cover"
      />

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={isTogglingLike}
            className={`flex items-center gap-2 transition-colors ${
              hasLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'
            }`}
          >
            <Heart size={22} fill={hasLiked ? 'currentColor' : 'none'} />
            {likesCount > 0 && <span className="text-sm">{likesCount}</span>}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors"
          >
            <MessageCircle size={22} />
            {commentsCount > 0 && <span className="text-sm">{commentsCount}</span>}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors ml-auto"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold">{post.estabelecimentos.nome_fantasia}</span>{' '}
            {post.caption}
          </p>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Adicione um comentário..."
                className="flex-1 bg-white/5 border-white/10 text-white text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment();
                }}
              />
              <Button
                onClick={handleAddComment}
                size="sm"
                className="bg-violet-500 hover:bg-violet-600"
              >
                Enviar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default function Feed() {
  // SEO
  useSEO({
    title: SEO_CONTENT.feed.title,
    description: SEO_CONTENT.feed.description,
  });
  
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
          estabelecimentos!fk_posts_estabelecimento(
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
      <div className="min-h-screen bg-slate-950 pb-24">
        {/* Header real enquanto carrega */}
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
        
        {/* Skeletons dos posts */}
        <div className="container mx-auto px-6 py-6 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
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
              <PostCard key={post.id} post={post} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}