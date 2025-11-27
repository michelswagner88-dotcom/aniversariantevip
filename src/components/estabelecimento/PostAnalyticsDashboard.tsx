import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEstablishmentPostsAnalytics } from '@/hooks/usePostAnalytics';
import { Eye, Heart, MessageCircle, Share2, TrendingUp, BarChart3, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface PostAnalyticsDashboardProps {
  establishmentId: string;
}

export const PostAnalyticsDashboard = ({ establishmentId }: PostAnalyticsDashboardProps) => {
  const { postsAnalytics, totals, averageEngagementRate, isLoading } = useEstablishmentPostsAnalytics(establishmentId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-violet-400" size={24} />
          Analytics de Conteúdo
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Acompanhe o desempenho dos seus posts e descubra o que engaja mais
        </p>
      </div>

      {/* Cards de Totais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-violet-500/20 bg-slate-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Eye className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totals.views.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Visualizações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-500/20 bg-slate-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <Heart className="text-pink-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totals.likes.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Curtidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-500/20 bg-slate-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <MessageCircle className="text-violet-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totals.comments.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Comentários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-500/20 bg-slate-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Share2 className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totals.shares.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Compartilhamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de Taxa Média de Engajamento */}
      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-pink-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300 mb-1">Taxa Média de Engajamento</p>
              <p className="text-4xl font-bold text-white">{averageEngagementRate}%</p>
              <p className="text-xs text-slate-400 mt-2">
                Total de {postsAnalytics.length} {postsAnalytics.length === 1 ? 'post' : 'posts'}
              </p>
            </div>
            <div className="p-4 rounded-full bg-white/5">
              <TrendingUp className="text-violet-400" size={32} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Posts com Métricas */}
      <Card className="border-violet-500/20 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ImageIcon size={20} />
            Desempenho por Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {postsAnalytics.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">Nenhum post publicado ainda</p>
              <p className="text-slate-500 text-sm mt-2">
                Publique seu primeiro post para começar a acompanhar métricas
              </p>
            </div>
          ) : (
            postsAnalytics.map((post) => (
              <div
                key={post.id}
                className="flex gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                {/* Thumbnail */}
                <img
                  src={post.image_url}
                  alt="Post"
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />

                {/* Informações */}
                <div className="flex-1 space-y-3">
                  {/* Caption e Tipo */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm text-white line-clamp-2">
                        {post.caption || 'Sem legenda'}
                      </p>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {post.type === 'photo' ? '📸 Foto' : post.type === 'promo' ? '🎁 Promo' : '📅 Evento'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{post.views}</p>
                      <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Eye size={12} />
                        Views
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-pink-400">{post.likes}</p>
                      <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Heart size={12} />
                        Likes
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-violet-400">{post.comments}</p>
                      <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <MessageCircle size={12} />
                        Coments
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-400">{post.shares}</p>
                      <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Share2 size={12} />
                        Shares
                      </p>
                    </div>
                  </div>

                  {/* Taxa de Engajamento */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-pink-500"
                        style={{ width: `${Math.min(parseFloat(post.engagementRate), 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white shrink-0">
                      {post.engagementRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dicas de Performance */}
      {postsAnalytics.length > 0 && (
        <Card className="border-cyan-500/20 bg-cyan-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="text-cyan-400 shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white mb-2">💡 Insights de Performance</h3>
                <ul className="space-y-1 text-sm text-slate-300">
                  {parseFloat(averageEngagementRate) > 5 && (
                    <li>✅ Excelente engajamento! Seu conteúdo está ressoando com seu público.</li>
                  )}
                  {parseFloat(averageEngagementRate) < 2 && (
                    <li>💡 Dica: Tente postar em horários de pico (18h-22h) para maior alcance.</li>
                  )}
                  {postsAnalytics[0]?.type === 'promo' && (
                    <li>🎁 Posts de promoção tendem a ter maior engajamento. Continue compartilhando ofertas!</li>
                  )}
                  <li>📊 Posts com legendas claras e chamativas recebem mais curtidas e comentários.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
