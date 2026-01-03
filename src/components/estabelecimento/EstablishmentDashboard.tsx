// =============================================================================
// ESTABLISHMENT DASHBOARD - Dashboard principal com KPIs
// Estilo Stripe/Vercel
// =============================================================================

import { useMemo } from "react";
import {
  Eye,
  MousePointerClick,
  Heart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  MessageCircle,
  Instagram,
  Globe,
  Gift,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Json } from "@/integrations/supabase/types";

// =============================================================================
// TYPES
// =============================================================================

interface EstabelecimentoData {
  id: string;
  nome_fantasia: string | null;
  ativo: boolean;
  plan_status: string | null;
  slug: string | null;
  descricao_beneficio: string | null;
  tipo_beneficio: string | null;
  periodo_validade_beneficio: string | null;
  telefone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  site: string | null;
  bio: string | null;
  fotos: Json | null;
  horario_funcionamento: string | null;
  cidade: string | null;
}

interface AnalyticsData {
  visualizacoes: number;
  visualizacoes7d: number;
  cliquesWhatsapp: number;
  cliquesWhatsapp7d: number;
  cliquesTelefone: number;
  cliquesInstagram: number;
  cliquesSite: number;
  favoritos: number;
  posicaoRanking: number;
}

type ActiveTab = "dashboard" | "profile" | "benefit" | "photos" | "analytics" | "preview" | "settings";

interface EstablishmentDashboardProps {
  estabelecimento: EstabelecimentoData | null;
  analytics: AnalyticsData | null;
  loading: boolean;
  onNavigate: (tab: ActiveTab) => void;
}

// =============================================================================
// HELPERS
// =============================================================================

const calculateProfileCompletion = (est: EstabelecimentoData | null): { percentage: number; missing: string[] } => {
  if (!est) return { percentage: 0, missing: [] };

  const fotos = Array.isArray(est.fotos) ? est.fotos : [];
  const checks = [
    { field: est.nome_fantasia, label: "Nome fantasia" },
    { field: est.telefone || est.whatsapp, label: "Telefone ou WhatsApp" },
    { field: est.bio, label: "Descrição do estabelecimento" },
    { field: est.descricao_beneficio, label: "Benefício configurado" },
    { field: fotos.length > 0, label: "Fotos" },
    { field: est.horario_funcionamento, label: "Horário de funcionamento" },
    { field: est.cidade, label: "Endereço" },
    { field: est.instagram, label: "Instagram" },
  ];

  const filled = checks.filter((c) => c.field).length;
  const missing = checks.filter((c) => !c.field).map((c) => c.label);

  return {
    percentage: Math.round((filled / checks.length) * 100),
    missing,
  };
};

const TIPO_BENEFICIO_CONFIG: Record<string, { emoji: string; label: string }> = {
  cortesia: { emoji: "🎁", label: "Cortesia" },
  brinde: { emoji: "🎀", label: "Brinde" },
  desconto: { emoji: "💰", label: "Desconto" },
  bonus: { emoji: "⭐", label: "Bônus" },
  gratis: { emoji: "🆓", label: "Grátis" },
};

// =============================================================================
// KPI CARD
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
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: any;
  iconColor?: string;
  loading?: boolean;
  onClick?: () => void;
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  if (loading) {
    return (
      <Card className="bg-card/50 border-border">
        <CardContent className="p-5">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "bg-card/50 border-border transition-all duration-200",
        onClick && "cursor-pointer hover:bg-accent hover:border-primary/30",
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("p-2 rounded-lg", iconColor.replace("text-", "bg-").replace("400", "500/20"))}>
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
          {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>

        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>

        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            {isPositive && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
            {isNegative && <ArrowDownRight className="w-3 h-3 text-red-500" />}
            <span
              className={cn(
                isPositive && "text-emerald-500",
                isNegative && "text-red-500",
                !isPositive && !isNegative && "text-muted-foreground",
              )}
            >
              {isPositive && "+"}
              {change}%
            </span>
            {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EstablishmentDashboard({
  estabelecimento,
  analytics,
  loading,
  onNavigate,
}: EstablishmentDashboardProps) {
  const completion = useMemo(() => calculateProfileCompletion(estabelecimento), [estabelecimento]);

  const tipoConfig = estabelecimento?.tipo_beneficio ? TIPO_BENEFICIO_CONFIG[estabelecimento.tipo_beneficio] : null;

  // Calculate growth (mock - você pode implementar real depois)
  const viewsGrowth = analytics?.visualizacoes7d
    ? Math.round((analytics.visualizacoes7d / Math.max(analytics.visualizacoes - analytics.visualizacoes7d, 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, {estabelecimento?.nome_fantasia || "Parceiro"}! 👋</h1>
        <p className="text-muted-foreground mt-1">Aqui está o resumo do seu estabelecimento</p>
      </div>

      {/* Status Alert */}
      {!estabelecimento?.ativo && (
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-600 dark:text-amber-300">Aguardando aprovação</p>
              <p className="text-sm text-amber-600/70 dark:text-amber-300/70">
                Seu estabelecimento está em análise e logo estará visível para os aniversariantes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Completion Alert */}
      {completion.percentage < 100 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Complete seu perfil</p>
                  <p className="text-sm text-muted-foreground">Perfis completos aparecem melhor nos resultados</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">{completion.percentage}%</span>
            </div>
            <Progress value={completion.percentage} className="h-2 bg-muted" />
            {completion.missing.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {completion.missing.slice(0, 3).map((item) => (
                  <Badge key={item} variant="outline" className="border-primary/30 text-primary text-xs">
                    Falta: {item}
                  </Badge>
                ))}
                {completion.missing.length > 3 && (
                  <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                    +{completion.missing.length - 3} mais
                  </Badge>
                )}
              </div>
            )}
            <Button size="sm" className="mt-4 bg-primary hover:bg-primary/90" onClick={() => onNavigate("profile")}>
              Completar perfil
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Visualizações"
          value={analytics?.visualizacoes || 0}
          change={viewsGrowth}
          changeLabel="7 dias"
          icon={Eye}
          iconColor="text-blue-400"
          loading={loading}
          onClick={() => onNavigate("analytics")}
        />
        <KPICard
          title="Cliques WhatsApp"
          value={analytics?.cliquesWhatsapp || 0}
          icon={MessageCircle}
          iconColor="text-emerald-400"
          loading={loading}
          onClick={() => onNavigate("analytics")}
        />
        <KPICard
          title="Favoritos"
          value={analytics?.favoritos || 0}
          icon={Heart}
          iconColor="text-red-400"
          loading={loading}
        />
        <KPICard
          title="Total de Cliques"
          value={
            (analytics?.cliquesWhatsapp || 0) +
            (analytics?.cliquesTelefone || 0) +
            (analytics?.cliquesInstagram || 0) +
            (analytics?.cliquesSite || 0)
          }
          icon={MousePointerClick}
          iconColor="text-violet-400"
          loading={loading}
          onClick={() => onNavigate("analytics")}
        />
      </div>

      {/* Benefit Card */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground text-lg">Seu Benefício</CardTitle>
                <CardDescription>O que você oferece para aniversariantes</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-accent"
              onClick={() => onNavigate("benefit")}
            >
              Editar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {estabelecimento?.descricao_beneficio ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {tipoConfig && (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {tipoConfig.emoji} {tipoConfig.label}
                  </Badge>
                )}
                {estabelecimento.periodo_validade_beneficio && (
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {estabelecimento.periodo_validade_beneficio === "dia_aniversario"
                      ? "No dia"
                      : estabelecimento.periodo_validade_beneficio === "semana_aniversario"
                        ? "Na semana"
                        : "No mês"}
                  </Badge>
                )}
              </div>
              <p className="text-foreground font-medium">{estabelecimento.descricao_beneficio}</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">Você ainda não configurou seu benefício</p>
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => onNavigate("benefit")}>
                Configurar agora
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-border hover:bg-accent hover:border-primary/50"
              onClick={() => onNavigate("profile")}
            >
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-xs">Editar Perfil</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-border hover:bg-accent hover:border-primary/50"
              onClick={() => onNavigate("photos")}
            >
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-xs">Adicionar Fotos</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-border hover:bg-accent hover:border-primary/50"
              onClick={() => onNavigate("analytics")}
            >
              <Eye className="w-5 h-5 text-primary" />
              <span className="text-xs">Ver Analytics</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-border hover:bg-accent hover:border-primary/50"
              onClick={() => onNavigate("preview")}
            >
              <ExternalLink className="w-5 h-5 text-cyan-500" />
              <span className="text-xs">Ver Página</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Summary */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Canais de Contato</CardTitle>
          <CardDescription>Cliques por canal nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{analytics?.cliquesWhatsapp || 0}</p>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Phone className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{analytics?.cliquesTelefone || 0}</p>
                <p className="text-xs text-muted-foreground">Telefone</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <Instagram className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{analytics?.cliquesInstagram || 0}</p>
                <p className="text-xs text-muted-foreground">Instagram</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Globe className="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{analytics?.cliquesSite || 0}</p>
                <p className="text-xs text-muted-foreground">Site</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EstablishmentDashboard;
