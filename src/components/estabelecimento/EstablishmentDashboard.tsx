// =============================================================================
// ESTABLISHMENT DASHBOARD - Dashboard principal com KPIs
// MELHORADO: Checklist visual, tooltips nos KPIs, CTA inteligente, empty states
// =============================================================================

import { useMemo, useState } from "react";
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
  EyeOff,
  Circle,
  Camera,
  MapPin,
  FileText,
  HelpCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  onToggleAtivo?: (ativo: boolean) => Promise<void>;
}

// =============================================================================
// CHECKLIST CONFIG
// =============================================================================

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: any;
  tab: ActiveTab;
  priority: number; // 1 = mais importante
  check: (est: EstabelecimentoData) => boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "beneficio",
    label: "Configurar benefício",
    description: "O mais importante! Defina o que o aniversariante ganha.",
    icon: Gift,
    tab: "benefit",
    priority: 1,
    check: (est) => !!est.descricao_beneficio && !!est.tipo_beneficio,
  },
  {
    id: "fotos",
    label: "Adicionar fotos",
    description: "Perfis com fotos recebem 3x mais visualizações.",
    icon: Camera,
    tab: "photos",
    priority: 2,
    check: (est) => {
      const fotos = Array.isArray(est.fotos) ? est.fotos : [];
      return fotos.length > 0;
    },
  },
  {
    id: "bio",
    label: "Descrição do estabelecimento",
    description: "Conte sobre seu espaço e diferenciais.",
    icon: FileText,
    tab: "profile",
    priority: 3,
    check: (est) => !!est.bio && est.bio.length >= 50,
  },
  {
    id: "contato",
    label: "Informações de contato",
    description: "WhatsApp ou telefone para os clientes.",
    icon: Phone,
    tab: "profile",
    priority: 4,
    check: (est) => !!est.telefone || !!est.whatsapp,
  },
  {
    id: "horario",
    label: "Horário de funcionamento",
    description: "Quando os aniversariantes podem ir.",
    icon: Clock,
    tab: "profile",
    priority: 5,
    check: (est) => !!est.horario_funcionamento,
  },
  {
    id: "endereco",
    label: "Endereço completo",
    description: "Para aparecer nas buscas por localização.",
    icon: MapPin,
    tab: "profile",
    priority: 6,
    check: (est) => !!est.cidade,
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Conecte suas redes sociais.",
    icon: Instagram,
    tab: "profile",
    priority: 7,
    check: (est) => !!est.instagram,
  },
];

// =============================================================================
// HELPERS
// =============================================================================

const getChecklistStatus = (est: EstabelecimentoData | null) => {
  if (!est) return { completed: [], pending: [], percentage: 0 };

  const completed: ChecklistItem[] = [];
  const pending: ChecklistItem[] = [];

  CHECKLIST_ITEMS.forEach((item) => {
    if (item.check(est)) {
      completed.push(item);
    } else {
      pending.push(item);
    }
  });

  // Ordenar pendentes por prioridade
  pending.sort((a, b) => a.priority - b.priority);

  const percentage = Math.round((completed.length / CHECKLIST_ITEMS.length) * 100);

  return { completed, pending, percentage };
};

const TIPO_BENEFICIO_CONFIG: Record<string, { emoji: string; label: string }> = {
  cortesia: { emoji: "🎁", label: "Cortesia" },
  brinde: { emoji: "🎀", label: "Brinde" },
  desconto: { emoji: "💰", label: "Desconto" },
  bonus: { emoji: "⭐", label: "Bônus" },
  gratis: { emoji: "🆓", label: "Grátis" },
};

// =============================================================================
// KPI CARD COM TOOLTIP
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
  tooltip,
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: any;
  iconColor?: string;
  loading?: boolean;
  onClick?: () => void;
  tooltip?: string;
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

  const cardContent = (
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
          <div className="flex items-center gap-1">
            {tooltip && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
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

  return cardContent;
};

// =============================================================================
// CHECKLIST ITEM COMPONENT
// =============================================================================

const ChecklistItemRow = ({
  item,
  isCompleted,
  onNavigate,
}: {
  item: ChecklistItem;
  isCompleted: boolean;
  onNavigate: (tab: ActiveTab) => void;
}) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => !isCompleted && onNavigate(item.tab)}
      disabled={isCompleted}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-150 text-left",
        isCompleted ? "bg-emerald-500/10 cursor-default" : "bg-muted/50 hover:bg-accent cursor-pointer",
      )}
    >
      {/* Status Icon */}
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
          isCompleted ? "bg-emerald-500" : "bg-muted border-2 border-border",
        )}
      >
        {isCompleted ? (
          <CheckCircle className="w-4 h-4 text-white" />
        ) : (
          <Circle className="w-3 h-3 text-muted-foreground" />
        )}
      </div>

      {/* Icon */}
      <div className={cn("p-2 rounded-lg flex-shrink-0", isCompleted ? "bg-emerald-500/20" : "bg-primary/10")}>
        <Icon className={cn("w-4 h-4", isCompleted ? "text-emerald-500" : "text-primary")} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-sm", isCompleted ? "text-emerald-600 line-through" : "text-foreground")}>
          {item.label}
        </p>
        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
      </div>

      {/* Arrow */}
      {!isCompleted && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
    </button>
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
  onToggleAtivo,
}: EstablishmentDashboardProps) {
  const [togglingAtivo, setTogglingAtivo] = useState(false);
  const [showAllChecklist, setShowAllChecklist] = useState(false);

  const checklistStatus = useMemo(() => getChecklistStatus(estabelecimento), [estabelecimento]);

  const handleToggleAtivo = async (checked: boolean) => {
    if (!onToggleAtivo) return;
    setTogglingAtivo(true);
    try {
      await onToggleAtivo(checked);
    } finally {
      setTogglingAtivo(false);
    }
  };

  const tipoConfig = estabelecimento?.tipo_beneficio ? TIPO_BENEFICIO_CONFIG[estabelecimento.tipo_beneficio] : null;

  // Calculate growth
  const viewsGrowth = analytics?.visualizacoes7d
    ? Math.round((analytics.visualizacoes7d / Math.max(analytics.visualizacoes - analytics.visualizacoes7d, 1)) * 100)
    : 0;

  // CTA inteligente - pega o item pendente de maior prioridade
  const primaryCTA = checklistStatus.pending[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, {estabelecimento?.nome_fantasia || "Parceiro"}! 👋</h1>
        <p className="text-muted-foreground mt-1">Aqui está o resumo do seu estabelecimento</p>
      </div>

      {/* Status Card - Visibility Toggle */}
      <Card
        className={cn(
          "border",
          estabelecimento?.ativo ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20",
        )}
      >
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn("p-2 rounded-lg", estabelecimento?.ativo ? "bg-emerald-500/20" : "bg-amber-500/20")}>
              {estabelecimento?.ativo ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <EyeOff className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {estabelecimento?.ativo ? "Visível na plataforma" : "Oculto da plataforma"}
              </p>
              <p className="text-sm text-muted-foreground">
                {estabelecimento?.ativo
                  ? "Aniversariantes podem encontrar seu estabelecimento"
                  : "Seu estabelecimento não aparece nas buscas"}
              </p>
            </div>
          </div>
          <Switch
            checked={estabelecimento?.ativo || false}
            onCheckedChange={handleToggleAtivo}
            disabled={togglingAtivo}
          />
        </CardContent>
      </Card>

      {/* CTA Principal - Baseado no que falta */}
      {primaryCTA && (
        <Card className="bg-gradient-to-r from-primary/10 to-violet-500/10 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <primaryCTA.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-lg">Próximo passo: {primaryCTA.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{primaryCTA.description}</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => onNavigate(primaryCTA.tab)}>
                Completar
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
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
          tooltip="Número de vezes que seu perfil foi visualizado por aniversariantes."
        />
        <KPICard
          title="Cliques WhatsApp"
          value={analytics?.cliquesWhatsapp || 0}
          icon={MessageCircle}
          iconColor="text-emerald-400"
          loading={loading}
          onClick={() => onNavigate("analytics")}
          tooltip="Quantas vezes aniversariantes clicaram no botão do WhatsApp."
        />
        <KPICard
          title="Favoritos"
          value={analytics?.favoritos || 0}
          icon={Heart}
          iconColor="text-red-400"
          loading={loading}
          tooltip="Aniversariantes que salvaram seu estabelecimento como favorito."
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
          tooltip="Soma de todos os cliques: WhatsApp, telefone, Instagram e site."
        />
      </div>

      {/* Checklist de Perfil */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground text-lg">Checklist do Perfil</CardTitle>
                <CardDescription>Complete para aparecer melhor nos resultados</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">{checklistStatus.percentage}%</span>
            </div>
          </div>
          <Progress value={checklistStatus.percentage} className="h-2 bg-muted mt-3" />
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Mostrar pendentes primeiro, depois completados */}
          {checklistStatus.pending.slice(0, showAllChecklist ? undefined : 3).map((item) => (
            <ChecklistItemRow key={item.id} item={item} isCompleted={false} onNavigate={onNavigate} />
          ))}

          {showAllChecklist &&
            checklistStatus.completed.map((item) => (
              <ChecklistItemRow key={item.id} item={item} isCompleted={true} onNavigate={onNavigate} />
            ))}

          {/* Ver mais / menos */}
          {(checklistStatus.pending.length > 3 || checklistStatus.completed.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground mt-2"
              onClick={() => setShowAllChecklist(!showAllChecklist)}
            >
              {showAllChecklist
                ? "Mostrar menos"
                : `Ver todos (${checklistStatus.completed.length}/${CHECKLIST_ITEMS.length} completos)`}
            </Button>
          )}

          {/* Perfil 100% completo */}
          {checklistStatus.percentage === 100 && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="font-medium text-emerald-600">Perfil completo! 🎉</p>
                <p className="text-sm text-muted-foreground">
                  Seu estabelecimento está otimizado para atrair aniversariantes.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-amber-500" />
              </div>
              <p className="font-medium text-foreground mb-1">Nenhum benefício configurado</p>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Configure seu benefício para aparecer para os aniversariantes. Estabelecimentos com benefícios claros
                recebem mais visitas!
              </p>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => onNavigate("benefit")}>
                <Gift className="w-4 h-4 mr-2" />
                Configurar benefício
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
              <Camera className="w-5 h-5 text-blue-500" />
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
              onClick={() => window.open(`/${estabelecimento?.slug}`, "_blank")}
              disabled={!estabelecimento?.slug}
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
          {analytics?.cliquesWhatsapp ||
          analytics?.cliquesTelefone ||
          analytics?.cliquesInstagram ||
          analytics?.cliquesSite ? (
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
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <MousePointerClick className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Nenhum clique registrado ainda.</p>
              <p className="text-xs text-muted-foreground mt-1">Complete seu perfil para aumentar a visibilidade!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EstablishmentDashboard;
