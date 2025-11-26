import { Card } from '@/components/ui/card';
import { useExpansionInsights } from '@/hooks/useExpansionInsights';
import { Loader2, TrendingUp, MapPin, Users, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ExpansionInsights = () => {
  const { data, isLoading, error } = useExpansionInsights();

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          <span className="ml-3 text-slate-400">Carregando insights de expansão...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-red-500/20 bg-red-950/20">
        <div className="flex items-center text-red-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Erro ao carregar insights: {error.message}</span>
        </div>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { insights, stats } = data;

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/50 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <MapPin className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Cidades Buscadas</p>
              <p className="text-2xl font-bold text-white">{stats.total_cities_searched}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/50 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total de Buscas</p>
              <p className="text-2xl font-bold text-white">{stats.total_searches}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/50 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Buscas Sem Resultado</p>
              <p className="text-2xl font-bold text-white">{stats.total_zero_results}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/50 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-white">
                {stats.total_searches > 0 
                  ? Math.round(((stats.total_searches - stats.total_zero_results) / stats.total_searches) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top 10 Cidades com Maior Demanda */}
      <Card className="p-6 bg-slate-900/50 border-white/10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-400" />
          Top 10 Oportunidades de Expansão
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Cidades com maior demanda não atendida (últimos 30 dias)
        </p>

        <div className="space-y-3">
          {stats.top_demand_cities.map((insight, index) => (
            <div
              key={insight.search_term}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/5 hover:border-violet-500/30 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-sm">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-semibold">{insight.search_term}</h4>
                    <Badge variant="outline" className="text-xs">
                      Score: {insight.demand_score}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>🔍 {insight.total_searches} buscas</span>
                    <span>❌ {insight.zero_results_count} sem resultado</span>
                    <span>👥 {insight.unique_users} usuários únicos</span>
                    {insight.most_common_nearest_city && (
                      <span>📍 Perto de: {insight.most_common_nearest_city}</span>
                    )}
                    {insight.avg_distance_to_nearest && (
                      <span>📏 ~{insight.avg_distance_to_nearest.toFixed(1)}km</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {insight.zero_results_count > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Alta Prioridade
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Demais Insights */}
      {insights.length > 10 && (
        <Card className="p-6 bg-slate-900/50 border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">
            Outras Oportunidades ({insights.length - 10})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.slice(10).map((insight) => (
              <div
                key={insight.search_term}
                className="p-3 rounded-lg bg-slate-800/50 border border-white/5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{insight.search_term}</span>
                  <Badge variant="secondary" className="text-xs">
                    {insight.demand_score}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {insight.total_searches} buscas • {insight.zero_results_count} sem resultado
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="text-xs text-slate-500 text-center">
        Dados atualizados em: {new Date(data.generated_at).toLocaleString('pt-BR')}
      </p>
    </div>
  );
};
