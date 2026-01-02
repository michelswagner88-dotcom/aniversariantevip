// =============================================================================
// ADMIN DASHBOARD PREMIUM v2.1 - ANIVERSARIANTE VIP
// CORREÇÕES:
// - BUG 1: Botões de ação rápida não funcionavam (onNavigate undefined)
// - BUG 2: Link "Ver pendentes" não funcionava
// - BUG 3: Formato "00 00%" corrigido
// - BUG 4: Tratamento de erro no favoritos
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Cake,
  MapPin,
  Eye,
  MousePointer,
  Heart,
  Calendar,
  Zap,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

// =============================================================================
// TYPES
// =============================================================================

interface DashboardStats {
  totalEstabelecimentos: number;
  estabelecimentosAtivos: number;
  estabelecimentosPendentes: number;
  estabelecimentosNovos7d: number;
  crescimentoEstabelecimentos: number;
  totalUsuarios: number;
  usuariosNovos7d: number;
  aniversariantesHoje: number;
  aniversariantesSemana: number;
  crescimentoUsuarios: number;
  visualizacoesTotal: number;
  visualizacoes7d: number;
  cliquesWhatsapp7d: number;
  favoritosTotal: number;
  mrr: number;
  mrrCrescimento: number;
  churn: number;
  pagamentosPendentes: number;
  cidadesAtivas: number;
  topCidades: { cidade: string; count: number }[];
  topCategorias: { categoria: string; count: number }[];
}

interface ChartData {
  cadastrosDiarios: { date: string; estabelecimentos: number; usuarios: number }[];
  engajamentoDiario: { date: string; views: number; clicks: number }[];
}

interface Alert {
  id: string;
  type: "warning" | "error" | "info" | "success";
  title: string;
  description: string;
  actionLabel?: string;
  actionTarget?: string;
  timestamp: Date;
}

// =============================================================================
// COMPONENTS
// =============================================================================

const KPICard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-violet-400",
  loading = false,
  onClick,
  badge,
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: any;
  iconColor?: string;
  loading?: boolean;
  onClick?: () => void;
  badge?: { label: string; variant: "default" | "destructive" | "secondary" };
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isZero = change === 0;

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "bg-slate-900/50 border-slate-800 transition-all duration-200",
        onClick && "cursor-pointer hover:bg-slate-800/50 hover:border-slate-700",
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn("p-2 rounded-lg bg-slate-800", iconColor.replace("text-", "bg-").replace("400", "500/20"))}
          >
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          {badge && (
            <Badge variant={badge.variant} className="text-xs">
              {badge.label}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>

          {change !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              {isPositive && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
              {isNegative && <ArrowDownRight className="w-3 h-3 text-red-400" />}
              <span
                className={cn(
                  isPositive && "text-emerald-400",
                  isNegative && "text-red-400",
                  isZero && "text-slate-500",
                )}
              >
                {isPositive && "+"}
                {change}%
              </span>
              {changeLabel && <span className="text-slate-500">{changeLabel}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AlertCard = ({
  alert,
  onDismiss,
  onAction,
}: {
  alert: Alert;
  onDismiss: (id: string) => void;
  onAction: (target: string) => void;
}) => {
  const iconMap = {
    warning: AlertTriangle,
    error: AlertTriangle,
    info: Clock,
    success: CheckCircle,
  };
  const colorMap = {
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    error: "text-red-400 bg-red-500/10 border-red-500/20",
    info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  const Icon = iconMap[alert.type];
  const colors = colorMap[alert.type];

  return (
    <div className={cn("p-4 rounded-lg border flex items-start gap-3", colors)}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm">{alert.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{alert.description}</p>
        {alert.actionLabel && alert.actionTarget && (
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              console.log("[AdminDashboard] Alert action clicked:", alert.actionTarget);
              onAction(alert.actionTarget!);
            }}
          >
            {alert.actionLabel}
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
      <button onClick={() => onDismiss(alert.id)} className="text-slate-500 hover:text-white transition-colors">
        ×
      </button>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface AdminDashboardProps {
  onNavigate?: (tab: string, params?: Record<string, string>) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================================================
  // NAVIGATION HANDLER - com fallback e log
  // ==========================================================================
  const handleNavigate = useCallback(
    (tab: string, params?: Record<string, string>) => {
      console.log("[AdminDashboard] Navigate requested:", { tab, params, hasOnNavigate: !!onNavigate });

      if (onNavigate) {
        onNavigate(tab, params);
      } else {
        // Fallback: mostrar toast informando que navegação não está disponível
        toast.info(`Navegação para "${tab}" - função não configurada`, {
          description: "Verifique se onNavigate foi passado como prop",
        });
        console.warn("[AdminDashboard] onNavigate not provided, cannot navigate to:", tab);
      }
    },
    [onNavigate],
  );

  // ==========================================================================
  // FETCH DATA
  // ==========================================================================
  const fetchDashboardData = async () => {
    try {
      // Estabelecimentos
      const { data: estabs, count: totalEstabs } = await supabase
        .from("estabelecimentos")
        .select("id, ativo, created_at, cidade, categoria", { count: "exact" })
        .is("deleted_at", null);

      const ativos = estabs?.filter((e) => e.ativo).length || 0;
      const pendentes = estabs?.filter((e) => !e.ativo).length || 0;

      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      const novos7d = estabs?.filter((e) => new Date(e.created_at) >= seteDiasAtras).length || 0;

      // Calcular crescimento corretamente
      const totalAnterior = (totalEstabs || 0) - novos7d;
      const crescimentoEstab = totalAnterior > 0 ? Math.round((novos7d / totalAnterior) * 100) : novos7d > 0 ? 100 : 0;

      // Usuários/Aniversariantes
      const { count: totalUsers } = await supabase
        .from("aniversariantes")
        .select("id", { count: "exact" })
        .is("deleted_at", null);

      const { data: aniversariantes } = await supabase
        .from("aniversariantes")
        .select("id, data_nascimento, created_at")
        .is("deleted_at", null);

      const hoje = new Date();
      const anivHoje =
        aniversariantes?.filter((a) => {
          if (!a.data_nascimento) return false;
          const d = new Date(a.data_nascimento);
          return d.getDate() === hoje.getDate() && d.getMonth() === hoje.getMonth();
        }).length || 0;

      const anivSemana =
        aniversariantes?.filter((a) => {
          if (!a.data_nascimento) return false;
          const d = new Date(a.data_nascimento);
          const diffDias = Math.abs(d.getDate() - hoje.getDate());
          return d.getMonth() === hoje.getMonth() && diffDias <= 7;
        }).length || 0;

      const usersNovos7d = aniversariantes?.filter((a) => new Date(a.created_at) >= seteDiasAtras).length || 0;

      // Calcular crescimento de usuários corretamente
      const usersAnterior = (totalUsers || 0) - usersNovos7d;
      const crescimentoUsers =
        usersAnterior > 0 ? Math.round((usersNovos7d / usersAnterior) * 100) : usersNovos7d > 0 ? 100 : 0;

      // Top cidades
      const cidadesCount: Record<string, number> = {};
      estabs?.forEach((e) => {
        if (e.cidade) {
          cidadesCount[e.cidade] = (cidadesCount[e.cidade] || 0) + 1;
        }
      });
      const topCidades = Object.entries(cidadesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cidade, count]) => ({ cidade, count }));

      // Top categorias
      const categoriasCount: Record<string, number> = {};
      estabs?.forEach((e) => {
        const cat = e.categoria?.[0];
        if (cat) {
          categoriasCount[cat] = (categoriasCount[cat] || 0) + 1;
        }
      });
      const topCategorias = Object.entries(categoriasCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([categoria, count]) => ({ categoria, count }));

      // Métricas de engajamento
      let visualizacoesTotal = 0;
      let visualizacoes7d = 0;
      let cliquesWhatsapp7d = 0;
      let favoritosTotal = 0;

      // Favoritos - com tratamento de erro robusto
      try {
        const { count: favCount, error: favError } = await supabase
          .from("favoritos")
          .select("id", { count: "exact", head: true });

        if (favError) {
          console.warn("[AdminDashboard] Favoritos query error:", favError.message);
        } else {
          favoritosTotal = favCount || 0;
        }
      } catch (e) {
        console.warn("[AdminDashboard] Favoritos query failed:", e);
      }

      // Gerar dados do gráfico (últimos 30 dias)
      const cadastrosDiarios: ChartData["cadastrosDiarios"] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const estabsNoDia = estabs?.filter((e) => e.created_at.split("T")[0] === dateStr).length || 0;

        const usersNoDia = aniversariantes?.filter((a) => a.created_at.split("T")[0] === dateStr).length || 0;

        cadastrosDiarios.push({
          date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
          estabelecimentos: estabsNoDia,
          usuarios: usersNoDia,
        });
      }

      setStats({
        totalEstabelecimentos: totalEstabs || 0,
        estabelecimentosAtivos: ativos,
        estabelecimentosPendentes: pendentes,
        estabelecimentosNovos7d: novos7d,
        crescimentoEstabelecimentos: crescimentoEstab,
        totalUsuarios: totalUsers || 0,
        usuariosNovos7d: usersNovos7d,
        aniversariantesHoje: anivHoje,
        aniversariantesSemana: anivSemana,
        crescimentoUsuarios: crescimentoUsers,
        visualizacoesTotal,
        visualizacoes7d,
        cliquesWhatsapp7d,
        favoritosTotal,
        mrr: 0,
        mrrCrescimento: 0,
        churn: 0,
        pagamentosPendentes: 0,
        cidadesAtivas: Object.keys(cidadesCount).length,
        topCidades,
        topCategorias,
      });

      setChartData({ cadastrosDiarios, engajamentoDiario: [] });

      // Gerar alertas - SEM onClick, apenas com target
      const newAlerts: Alert[] = [];

      if (pendentes > 0) {
        newAlerts.push({
          id: "pending-approval",
          type: "warning",
          title: `${pendentes} estabelecimento(s) aguardando aprovação`,
          description: "Revise e aprove para ficarem visíveis na plataforma",
          actionLabel: "Ver pendentes",
          actionTarget: "approval-queue",
          timestamp: new Date(),
        });
      }

      if (anivHoje > 0) {
        newAlerts.push({
          id: "birthdays-today",
          type: "info",
          title: `🎂 ${anivHoje} aniversariante(s) hoje!`,
          description: "E-mails de parabéns serão enviados automaticamente",
          timestamp: new Date(),
        });
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error("[AdminDashboard] Fetch error:", error);
      toast.error("Erro ao carregar dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAlertAction = (target: string) => {
    handleNavigate(target);
  };

  const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">Visão geral da plataforma</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} onAction={handleAlertAction} />
          ))}
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Estabelecimentos"
          value={stats?.totalEstabelecimentos || 0}
          change={stats?.crescimentoEstabelecimentos}
          changeLabel="vs semana anterior"
          icon={Building2}
          iconColor="text-violet-400"
          loading={loading}
          onClick={() => handleNavigate("establishments")}
          badge={
            stats?.estabelecimentosPendentes
              ? {
                  label: `${stats.estabelecimentosPendentes} pendentes`,
                  variant: "destructive",
                }
              : undefined
          }
        />
        <KPICard
          title="Usuários"
          value={stats?.totalUsuarios || 0}
          change={stats?.crescimentoUsuarios}
          changeLabel="vs semana anterior"
          icon={Users}
          iconColor="text-blue-400"
          loading={loading}
          onClick={() => handleNavigate("users")}
        />
        <KPICard
          title="Aniversariantes Hoje"
          value={stats?.aniversariantesHoje || 0}
          icon={Cake}
          iconColor="text-pink-400"
          loading={loading}
          badge={
            stats?.aniversariantesSemana
              ? {
                  label: `${stats.aniversariantesSemana} esta semana`,
                  variant: "secondary",
                }
              : undefined
          }
        />
        <KPICard
          title="Cidades Ativas"
          value={stats?.cidadesAtivas || 0}
          icon={MapPin}
          iconColor="text-emerald-400"
          loading={loading}
          onClick={() => handleNavigate("mapa")}
        />
      </div>

      {/* Engajamento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Visualizações (7d)"
          value={stats?.visualizacoes7d || 0}
          icon={Eye}
          iconColor="text-cyan-400"
          loading={loading}
        />
        <KPICard
          title="Cliques WhatsApp (7d)"
          value={stats?.cliquesWhatsapp7d || 0}
          icon={MousePointer}
          iconColor="text-green-400"
          loading={loading}
        />
        <KPICard
          title="Favoritos Total"
          value={stats?.favoritosTotal || 0}
          icon={Heart}
          iconColor="text-red-400"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cadastros Chart */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Cadastros (30 dias)</CardTitle>
            <CardDescription>Estabelecimentos e usuários</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData?.cadastrosDiarios || []}>
                  <defs>
                    <linearGradient id="gradientEstab" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="estabelecimentos"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#gradientEstab)"
                    name="Estabelecimentos"
                  />
                  <Area
                    type="monotone"
                    dataKey="usuarios"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#gradientUsers)"
                    name="Usuários"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Cidades */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Top Cidades</CardTitle>
            <CardDescription>Por número de estabelecimentos</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.topCidades.map((item, index) => (
                  <div key={item.cidade} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: `${COLORS[index]}20`, color: COLORS[index] }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{item.cidade}</span>
                        <span className="text-slate-400 text-sm">{item.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.count / (stats?.topCidades[0]?.count || 1)) * 100}%`,
                            backgroundColor: COLORS[index],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!stats?.topCidades || stats.topCidades.length === 0) && (
                  <p className="text-slate-500 text-center py-4">Nenhum dado disponível</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-slate-700 hover:bg-slate-800 hover:border-violet-500/50"
              onClick={() => {
                console.log("[AdminDashboard] Aprovar Pendentes clicked");
                handleNavigate("approval-queue");
              }}
            >
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-xs">Aprovar Pendentes</span>
              {stats?.estabelecimentosPendentes ? (
                <Badge variant="destructive" className="text-[10px]">
                  {stats.estabelecimentosPendentes}
                </Badge>
              ) : null}
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-slate-700 hover:bg-slate-800 hover:border-violet-500/50"
              onClick={() => {
                console.log("[AdminDashboard] Importar CSV clicked");
                handleNavigate("import");
              }}
            >
              <Building2 className="w-5 h-5 text-violet-400" />
              <span className="text-xs">Importar CSV</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-slate-700 hover:bg-slate-800 hover:border-violet-500/50"
              onClick={() => {
                console.log("[AdminDashboard] Ver Relatórios clicked");
                handleNavigate("email-analytics");
              }}
            >
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span className="text-xs">Ver Relatórios</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-slate-700 hover:bg-slate-800 hover:border-violet-500/50"
              onClick={() => {
                console.log("[AdminDashboard] Abrir Stripe clicked");
                window.open("https://dashboard.stripe.com", "_blank");
              }}
            >
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span className="text-xs">Abrir Stripe</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;
