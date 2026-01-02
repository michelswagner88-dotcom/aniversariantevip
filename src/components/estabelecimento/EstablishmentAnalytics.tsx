import {
  Eye, MousePointerClick, Heart, Phone, MessageCircle, Instagram, Globe,
  TrendingUp, ArrowUpRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EstablishmentAnalyticsProps {
  estabelecimentoId: string;
  analytics: any;
  loading: boolean;
}

export function EstablishmentAnalytics({ estabelecimentoId, analytics, loading }: EstablishmentAnalyticsProps) {
  // Mock data for chart
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    views: Math.floor(Math.random() * 50) + 10,
    clicks: Math.floor(Math.random() * 20) + 5,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground">Métricas detalhadas do seu estabelecimento</p>
        </div>
      </div>

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
            <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              +{analytics?.visualizacoes7d || 0} esta semana
            </div>
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
            <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              +{analytics?.cliquesWhatsapp7d || 0} esta semana
            </div>
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
            <p className="text-2xl font-bold mt-2 text-foreground">
              {(analytics?.cliquesWhatsapp || 0) + (analytics?.cliquesTelefone || 0) + (analytics?.cliquesInstagram || 0) + (analytics?.cliquesSite || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Visualizações (30 dias)</CardTitle>
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
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cliques por Canal */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Cliques por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "WhatsApp", value: analytics?.cliquesWhatsapp || 0, icon: MessageCircle, color: "bg-emerald-500" },
              { label: "Telefone", value: analytics?.cliquesTelefone || 0, icon: Phone, color: "bg-blue-500" },
              { label: "Instagram", value: analytics?.cliquesInstagram || 0, icon: Instagram, color: "bg-pink-500" },
              { label: "Site", value: analytics?.cliquesSite || 0, icon: Globe, color: "bg-cyan-500" },
            ].map((item) => {
              const total = (analytics?.cliquesWhatsapp || 0) + (analytics?.cliquesTelefone || 0) + (analytics?.cliquesInstagram || 0) + (analytics?.cliquesSite || 0);
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
              
              return (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${item.color}/10`}>
                    <item.icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
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
