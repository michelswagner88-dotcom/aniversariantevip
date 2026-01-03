import { useMemo } from "react";
import {
  Eye, MousePointerClick, Heart, Phone, MessageCircle, Instagram, Globe,
  TrendingUp, ArrowUpRight, AlertCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
  visualizacoes: number;
  visualizacoes7d: number;
  cliquesWhatsapp: number;
  cliquesWhatsapp7d: number;
  cliquesTelefone: number;
  cliquesInstagram: number;
  cliquesSite: number;
  favoritos: number;
  chartData?: Array<{ date: string; views: number; clicks: number }>;
}

interface EstablishmentAnalyticsProps {
  estabelecimentoId: string;
  analytics: AnalyticsData | null;
  loading: boolean;
}

export function EstablishmentAnalytics({ estabelecimentoId, analytics, loading }: EstablishmentAnalyticsProps) {
  // Use real data from props if available, otherwise show empty state
  const hasData = analytics && (analytics.visualizacoes > 0 || analytics.cliquesWhatsapp > 0 || analytics.favoritos > 0);

  // Generate chart data from analytics or show empty placeholder
  const chartData = useMemo(() => {
    if (analytics?.chartData && analytics.chartData.length > 0) {
      return analytics.chartData;
    }
    
    // If we have views data but no chart data, generate basic placeholder
    if (hasData) {
      return Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        views: 0,
        clicks: 0,
      }));
    }
    
    return [];
  }, [analytics, hasData]);

  const totalClicks = (analytics?.cliquesWhatsapp || 0) + 
                      (analytics?.cliquesTelefone || 0) + 
                      (analytics?.cliquesInstagram || 0) + 
                      (analytics?.cliquesSite || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground">Métricas detalhadas do seu estabelecimento</p>
        </div>
      </div>

      {/* Empty State Alert */}
      {!hasData && !loading && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Ainda não há dados</p>
              <p className="text-sm text-muted-foreground mt-1">
                Os dados serão exibidos após as primeiras visualizações do seu perfil.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground">Visualizações</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-foreground">{analytics?.visualizacoes || 0}</p>
            {(analytics?.visualizacoes7d || 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                +{analytics.visualizacoes7d} esta semana
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-xs text-muted-foreground">WhatsApp</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-foreground">{analytics?.cliquesWhatsapp || 0}</p>
            {(analytics?.cliquesWhatsapp7d || 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                +{analytics.cliquesWhatsapp7d} esta semana
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-xs text-muted-foreground">Favoritos</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-foreground">{analytics?.favoritos || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <MousePointerClick className="w-5 h-5 text-violet-500" />
              </div>
              <span className="text-xs text-muted-foreground">Total Cliques</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-foreground">{totalClicks}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Visualizações (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorViews)"
                    name="Visualizações"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cliques por Canal */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Cliques por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "WhatsApp", value: analytics?.cliquesWhatsapp || 0, icon: MessageCircle, color: "bg-emerald-500", textColor: "text-emerald-500" },
              { label: "Telefone", value: analytics?.cliquesTelefone || 0, icon: Phone, color: "bg-blue-500", textColor: "text-blue-500" },
              { label: "Instagram", value: analytics?.cliquesInstagram || 0, icon: Instagram, color: "bg-pink-500", textColor: "text-pink-500" },
              { label: "Site", value: analytics?.cliquesSite || 0, icon: Globe, color: "bg-cyan-500", textColor: "text-cyan-500" },
            ].map((item) => {
              const percentage = totalClicks > 0 ? Math.round((item.value / totalClicks) * 100) : 0;
              
              return (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${item.color}/10`}>
                    <item.icon className={`w-4 h-4 ${item.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-sm text-muted-foreground">{item.value} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EstablishmentAnalytics;
