import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Eye, Gift, CheckCircle, MessageCircle, Phone, Navigation, Share2, Heart, ArrowRight, Instagram, Globe } from "lucide-react";
import { useEstabelecimentoAnalytics } from "@/hooks/useEstabelecimentoAnalytics";

interface EstabelecimentoAnalyticsProps {
  estabelecimentoId: string;
}

// Componente de Card de Métrica
const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subLabel, 
  trend, 
  colorClass 
}: { 
  icon: any; 
  label: string; 
  value: number | string; 
  subLabel?: string;
  trend?: number;
  colorClass: string;
}) => (
  <Card className={`bg-gradient-to-br ${colorClass} border-opacity-20`}>
    <CardHeader className="pb-2">
      <CardDescription className="flex items-center gap-2 text-xs">
        <Icon className="h-4 w-4" />
        {label}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-2xl md:text-3xl font-bold">{value}</div>
      {subLabel && <p className="text-xs text-muted-foreground mt-1">{subLabel}</p>}
      {trend !== undefined && trend > 0 && (
        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> +{trend} últimos 7 dias
        </p>
      )}
    </CardContent>
  </Card>
);

// Componente de Barra de Conversão
const ConversionBar = ({ 
  label, 
  from, 
  to, 
  rate 
}: { 
  label: string; 
  from: string; 
  to: string; 
  rate: number;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground flex items-center gap-2">
        {from} <ArrowRight className="h-3 w-3" /> {to}
      </span>
      <span className="font-bold text-foreground">{rate.toFixed(1)}%</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(rate, 100)}%` }}
      />
    </div>
  </div>
);

export const EstabelecimentoAnalytics = ({ estabelecimentoId }: EstabelecimentoAnalyticsProps) => {
  const { data: analytics, isLoading } = useEstabelecimentoAnalytics(estabelecimentoId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const chartConfig = {
    cupons: { label: "Cupons", color: "hsl(var(--primary))" },
    views: { label: "Visualizações", color: "hsl(var(--chart-1))" },
    clicks: { label: "Cliques", color: "hsl(var(--chart-2))" },
  };

  return (
    <div className="space-y-6">
      {/* KPIs Principais - Engajamento */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-cyan-400" />
          Engajamento
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={Eye}
            label="Visualizações"
            value={analytics.visualizacoesPerfil}
            subLabel="Este mês"
            trend={analytics.views7d}
            colorClass="from-cyan-500/10 to-blue-500/10 border-cyan-500"
          />
          <MetricCard
            icon={Gift}
            label="Cliques no Benefício"
            value={analytics.cliquesBeneficio}
            subLabel="Este mês"
            trend={analytics.benefitClicks7d}
            colorClass="from-violet-500/10 to-fuchsia-500/10 border-violet-500"
          />
          <MetricCard
            icon={MessageCircle}
            label="WhatsApp"
            value={analytics.cliquesWhatsApp}
            subLabel="Cliques"
            colorClass="from-green-500/10 to-emerald-500/10 border-green-500"
          />
          <MetricCard
            icon={Phone}
            label="Ligações"
            value={analytics.cliquesTelefone}
            subLabel="Cliques"
            colorClass="from-blue-500/10 to-indigo-500/10 border-blue-500"
          />
        </div>
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          icon={Instagram}
          label="Instagram"
          value={analytics.cliquesInstagram}
          subLabel="Cliques"
          colorClass="from-pink-500/10 to-rose-500/10 border-pink-500"
        />
        <MetricCard
          icon={Globe}
          label="Site"
          value={analytics.cliquesSite}
          subLabel="Cliques"
          colorClass="from-violet-500/10 to-purple-500/10 border-violet-500"
        />
        <MetricCard
          icon={Navigation}
          label="Como Chegar"
          value={analytics.cliquesNavegacao}
          subLabel="Maps, Waze, etc"
          colorClass="from-orange-500/10 to-amber-500/10 border-orange-500"
        />
        <MetricCard
          icon={Share2}
          label="Compartilhamentos"
          value={analytics.compartilhamentos}
          colorClass="from-pink-500/10 to-rose-500/10 border-pink-500"
        />
        <MetricCard
          icon={Heart}
          label="Favoritos"
          value={analytics.favoritosAdicionados}
          colorClass="from-red-500/10 to-pink-500/10 border-red-500"
        />
        <MetricCard
          icon={TrendingUp}
          label="Taxa Conversão"
          value={`${analytics.taxaViewToBenefit.toFixed(1)}%`}
          subLabel="View → Benefício"
          colorClass="from-amber-500/10 to-orange-500/10 border-amber-500"
        />
      </div>

      {/* KPIs de Cupons */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-violet-400" />
          Cupons
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            icon={Gift}
            label="Cupons Emitidos"
            value={analytics.cuponsEmitidos}
            subLabel="Este mês"
            colorClass="from-violet-500/10 to-fuchsia-500/10 border-violet-500"
          />
          <MetricCard
            icon={CheckCircle}
            label="Cupons Usados"
            value={analytics.cuponsUsados}
            subLabel="Conversões"
            colorClass="from-green-500/10 to-emerald-500/10 border-green-500"
          />
          <MetricCard
            icon={TrendingUp}
            label="Taxa de Uso"
            value={`${analytics.taxaConversao.toFixed(1)}%`}
            subLabel="Emitidos → Usados"
            colorClass="from-amber-500/10 to-orange-500/10 border-amber-500"
          />
        </div>
      </div>

      {/* Funil de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet-400" />
            Funil de Conversão
          </CardTitle>
          <CardDescription>Taxa de conversão em cada etapa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConversionBar 
            from="Visualizações" 
            to="Clique no Benefício" 
            rate={analytics.taxaViewToBenefit}
            label="view_to_benefit"
          />
          <ConversionBar 
            from="Benefício" 
            to="WhatsApp" 
            rate={analytics.taxaBenefitToWhatsApp}
            label="benefit_to_whatsapp"
          />
          <ConversionBar 
            from="Cupons Emitidos" 
            to="Usados" 
            rate={analytics.taxaConversao}
            label="coupon_conversion"
          />
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engajamento por Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Engajamento Diário</CardTitle>
            <CardDescription>Visualizações vs Cliques no benefício</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.engajamentoPorDia}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1"
                    stroke="hsl(var(--chart-1))" 
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.3}
                    name="Visualizações"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stackId="2"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                    name="Cliques"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Horários de Pico */}
        <Card>
          <CardHeader>
            <CardTitle>Horários de Pico</CardTitle>
            <CardDescription>Quando os cupons são mais emitidos</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.cupomsPorHorario}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="hora" 
                    className="text-xs"
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `${value}h`}
                  />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => `${value}:00`}
                  />
                  <Bar 
                    dataKey="cupons" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Cupons"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tendência Mensal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendência Histórica</CardTitle>
            <CardDescription>Cupons emitidos nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.cupomsPorMes}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mes" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="cupons" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 5 }}
                    name="Cupons"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
