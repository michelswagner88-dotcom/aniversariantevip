import { Card } from "@/components/ui/card";
import { useNavigationMetrics } from "@/hooks/useNavigationMetrics";
import { Loader2, Navigation, TrendingUp, Map, Car, Briefcase, DollarSign, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NavigationMetricsPanelProps {
  establishmentId?: string;
  days?: number;
}

export const NavigationMetricsPanel = ({ establishmentId, days = 30 }: NavigationMetricsPanelProps) => {
  const { data, isLoading, error } = useNavigationMetrics(establishmentId, days);

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center" role="status" aria-live="polite">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" aria-hidden="true" />
          <span className="ml-3 text-slate-400">Carregando métricas de navegação...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-red-500/20 bg-red-950/20" role="alert">
        <div className="flex items-center text-red-400">
          <Navigation className="w-5 h-5 mr-2" aria-hidden="true" />
          <span>Erro ao carregar métricas: {error.message}</span>
        </div>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const appIcons: Record<string, LucideIcon> = {
    uber: Car,
    "99": Car,
    waze: Navigation,
    maps: Map,
  };

  const appColors: Record<string, string> = {
    uber: "bg-black text-white",
    "99": "bg-amber-400 text-black",
    waze: "bg-cyan-500 text-white",
    maps: "bg-emerald-600 text-white",
  };

  return (
    <div className="space-y-6">
      {/* KPI Principal */}
      <Card className="p-6 bg-slate-900/50 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500">
              <Navigation className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total de Navegações</p>
              <p className="text-3xl font-bold text-white">{data.total_clicks.toLocaleString("pt-BR")}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            Últimos {days} dias
          </Badge>
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <DollarSign className="w-3 h-3" aria-hidden="true" />
          Dados para negociações B2B com parceiros de transporte
        </p>
      </Card>

      {/* Distribuição por App */}
      <Card className="p-6 bg-slate-900/50 border-white/10">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-400" aria-hidden="true" />
          Distribuição por Aplicativo
        </h3>

        {/* Descrição acessível do gráfico */}
        <p className="sr-only">Gráfico de barras mostrando a distribuição de cliques por aplicativo de navegação.</p>

        <div className="h-64 w-full mb-6" role="img" aria-label="Gráfico de distribuição por app">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.clicks_by_app}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="app_name" stroke="#94a3b8" style={{ fontSize: "12px", textTransform: "capitalize" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.clicks_by_app.map((app) => {
            const Icon = appIcons[app.app_name] || Navigation;
            const colorClass = appColors[app.app_name] || "bg-slate-700 text-white";

            return (
              <div key={app.app_name} className={`p-4 rounded-lg ${colorClass} border border-white/10`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase">{app.app_name}</span>
                </div>
                <p className="text-2xl font-bold">{app.count}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Estabelecimentos (se não filtrado) */}
      {!establishmentId && data.top_establishments.length > 0 && (
        <Card className="p-6 bg-slate-900/50 border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-400" aria-hidden="true" />
            Top 10 Estabelecimentos que Mais Geram Tráfego
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Estabelecimentos com maior número de redirecionamentos para apps de navegação
          </p>

          <div className="space-y-3">
            {data.top_establishments.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Nenhum dado disponível</p>
            ) : (
              data.top_establishments.map((est, index) => (
                <div
                  key={est.establishment_id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/5 hover:border-blue-500/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shrink-0"
                      aria-label={`Posição ${index + 1}`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold mb-1 truncate">{est.nome_fantasia}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Car className="w-3 h-3" aria-hidden="true" />
                          Uber: {est.clicks_by_app.uber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="w-3 h-3" aria-hidden="true" />
                          99: {est.clicks_by_app["99"]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3" aria-hidden="true" />
                          Waze: {est.clicks_by_app.waze}
                        </span>
                        <span className="flex items-center gap-1">
                          <Map className="w-3 h-3" aria-hidden="true" />
                          Maps: {est.clicks_by_app.maps}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-lg font-bold shrink-0 ml-2">
                    {est.total_clicks}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
        <Briefcase className="w-3 h-3" aria-hidden="true" />
        Use esses dados para negociar parcerias com Uber, 99, e outras plataformas de transporte
      </p>
    </div>
  );
};
