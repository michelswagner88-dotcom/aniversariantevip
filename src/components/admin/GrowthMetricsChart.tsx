import { Card } from '@/components/ui/card';
import { useAdminGrowthMetrics } from '@/hooks/useAdminGrowthMetrics';
import { Loader2, TrendingUp, TrendingDown, MapPin, Building2, Users, Target } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Badge } from '@/components/ui/badge';

export const GrowthMetricsChart = () => {
  const { data, isLoading, error } = useAdminGrowthMetrics(30);

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          <span className="ml-3 text-slate-400">Carregando métricas de crescimento...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-red-500/20 bg-red-950/20">
        <div className="flex items-center text-red-400">
          <TrendingDown className="w-5 h-5 mr-2" />
          <span>Erro ao carregar métricas: {error.message}</span>
        </div>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-slate-900/50 border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            {data.growthRate >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <p className="text-sm text-slate-400">Crescimento (7 dias)</p>
          <p className="text-3xl font-bold text-white mt-1">
            {data.growthRate >= 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
          </p>
        </Card>

        <Card className="p-6 bg-slate-900/50 border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-slate-400">Cidades Cobertas</p>
          <p className="text-3xl font-bold text-white mt-1">{data.totalCities}</p>
        </Card>

        <Card className="p-6 bg-slate-900/50 border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-sm text-slate-400">Taxa de Ativação</p>
          <p className="text-3xl font-bold text-white mt-1">{data.activationRate.toFixed(1)}%</p>
          <p className="text-xs text-slate-500 mt-1">
            {data.activeEstablishments} de {data.totalEstablishments} ativos
          </p>
        </Card>

        <Card className="p-6 bg-slate-900/50 border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-sm text-slate-400">Total de Usuários</p>
          <p className="text-3xl font-bold text-white mt-1">{data.totalUsers}</p>
        </Card>
      </div>

      {/* Gráfico de Cadastros Diários */}
      <Card className="p-6 bg-slate-900/50 border-white/10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-400" />
          Cadastros Diários (Últimos 30 Dias)
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.dailyRegistrations}>
              <defs>
                <linearGradient id="colorAniversariantes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEstabelecimentos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="aniversariantes"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAniversariantes)"
                name="Aniversariantes"
              />
              <Area
                type="monotone"
                dataKey="estabelecimentos"
                stroke="#f59e0b"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorEstabelecimentos)"
                name="Estabelecimentos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Cidades Cobertas */}
      <Card className="p-6 bg-slate-900/50 border-white/10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          Top 20 Cidades Cobertas
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Cidades com maior presença de estabelecimentos
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.citiesCovered.map((city, index) => (
            <div
              key={`${city.cidade}-${city.estado}`}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/5 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-semibold">
                      {city.cidade}, {city.estado}
                    </h4>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>🏢 {city.total_estabelecimentos} estabelecimentos</span>
                    <span>✅ {city.estabelecimentos_ativos} ativos</span>
                    <span>👥 {city.total_aniversariantes} usuários</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {city.total_estabelecimentos > 0
                    ? ((city.estabelecimentos_ativos / city.total_estabelecimentos) * 100).toFixed(0)
                    : 0}% ativos
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
