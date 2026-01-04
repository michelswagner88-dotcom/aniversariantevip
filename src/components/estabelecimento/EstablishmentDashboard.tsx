// =============================================================================
// ESTABLISHMENT DASHBOARD - Dashboard principal LIGHT
// Tema Light Premium estilo Stripe/Linear
// =============================================================================

import { useMemo, useState } from "react";
import {
  Eye,
  MousePointerClick,
  Heart,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StatCard } from "@/components/panel/StatCard";
import { PanelSection } from "@/components/panel/PanelSection";
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
  priority: number;
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
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 text-left",
        isCompleted
          ? "bg-emerald-50 cursor-default"
          : "bg-[#F7F7F8] hover:bg-[#EFEFEF] cursor-pointer"
      )}
    >
      {/* Status Icon */}
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
          isCompleted ? "bg-emerald-500" : "bg-white border-2 border-[#E7E7EA]"
        )}
      >
        {isCompleted ? (
          <CheckCircle className="w-4 h-4 text-white" />
        ) : (
          <Circle className="w-3 h-3 text-[#9CA3AF]" />
        )}
      </div>

      {/* Icon */}
      <div className={cn("p-2 rounded-xl flex-shrink-0", isCompleted ? "bg-emerald-100" : "bg-white border border-[#E7E7EA]")}>
        <Icon className={cn("w-4 h-4", isCompleted ? "text-emerald-600" : "text-[#6B7280]")} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-sm", isCompleted ? "text-emerald-700 line-through" : "text-[#111827]")}>
          {item.label}
        </p>
        <p className="text-xs text-[#6B7280] truncate">{item.description}</p>
      </div>

      {/* Arrow */}
      {!isCompleted && <ChevronRight className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />}
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

  const viewsGrowth = analytics?.visualizacoes7d
    ? Math.round((analytics.visualizacoes7d / Math.max(analytics.visualizacoes - analytics.visualizacoes7d, 1)) * 100)
    : 0;

  const primaryCTA = checklistStatus.pending[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">
          Olá, {estabelecimento?.nome_fantasia || "Parceiro"}! 👋
        </h1>
        <p className="text-[#6B7280] mt-1">Aqui está o resumo do seu estabelecimento</p>
      </div>

      {/* Status Card - Visibility Toggle */}
      <div
        className={cn(
          "rounded-2xl border p-4 flex items-center justify-between gap-4",
          estabelecimento?.ativo
            ? "bg-emerald-50 border-emerald-200"
            : "bg-amber-50 border-amber-200"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-xl", estabelecimento?.ativo ? "bg-emerald-100" : "bg-amber-100")}>
            {estabelecimento?.ativo ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <EyeOff className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-[#111827]">
              {estabelecimento?.ativo ? "Visível na plataforma" : "Oculto da plataforma"}
            </p>
            <p className="text-sm text-[#6B7280]">
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
      </div>

      {/* CTA Principal - Baseado no que falta */}
      {primaryCTA && (
        <PanelSection>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#240046]/5">
              <primaryCTA.icon className="w-6 h-6 text-[#240046]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#111827] text-lg">Próximo passo: {primaryCTA.label}</p>
              <p className="text-sm text-[#6B7280] mt-0.5">{primaryCTA.description}</p>
            </div>
            <Button
              className="bg-[#240046] hover:bg-[#3C096C] text-white"
              onClick={() => onNavigate(primaryCTA.tab)}
            >
              Completar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </PanelSection>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Visualizações"
          value={analytics?.visualizacoes || 0}
          change={viewsGrowth}
          changeLabel="7 dias"
          icon={<Eye className="w-4 h-4 text-blue-500" />}
          loading={loading}
          onClick={() => onNavigate("analytics")}
          tooltip="Número de vezes que seu perfil foi visualizado por aniversariantes."
        />
        <StatCard
          title="Cliques WhatsApp"
          value={analytics?.cliquesWhatsapp || 0}
          icon={<MessageCircle className="w-4 h-4 text-emerald-500" />}
          loading={loading}
          onClick={() => onNavigate("analytics")}
          tooltip="Quantas vezes aniversariantes clicaram no botão do WhatsApp."
        />
        <StatCard
          title="Favoritos"
          value={analytics?.favoritos || 0}
          icon={<Heart className="w-4 h-4 text-red-400" />}
          loading={loading}
          tooltip="Aniversariantes que salvaram seu estabelecimento como favorito."
        />
        <StatCard
          title="Total de Cliques"
          value={
            (analytics?.cliquesWhatsapp || 0) +
            (analytics?.cliquesTelefone || 0) +
            (analytics?.cliquesInstagram || 0) +
            (analytics?.cliquesSite || 0)
          }
          icon={<MousePointerClick className="w-4 h-4 text-amber-500" />}
          loading={loading}
          onClick={() => onNavigate("analytics")}
          tooltip="Soma de todos os cliques: WhatsApp, telefone, Instagram e site."
        />
      </div>

      {/* Checklist de Perfil */}
      <PanelSection
        title="Checklist do Perfil"
        description="Complete para aparecer melhor nos resultados"
        icon={<Sparkles className="w-5 h-5 text-amber-500" />}
        actions={
          <span className="text-2xl font-bold text-[#240046]">{checklistStatus.percentage}%</span>
        }
      >
        <div className="space-y-4">
          <Progress
            value={checklistStatus.percentage}
            className="h-2 bg-[#E7E7EA] [&>div]:bg-[#240046]"
          />

          <div className="space-y-2">
            {checklistStatus.pending.slice(0, showAllChecklist ? undefined : 3).map((item) => (
              <ChecklistItemRow key={item.id} item={item} isCompleted={false} onNavigate={onNavigate} />
            ))}

            {showAllChecklist &&
              checklistStatus.completed.map((item) => (
                <ChecklistItemRow key={item.id} item={item} isCompleted={true} onNavigate={onNavigate} />
              ))}
          </div>

          {(checklistStatus.pending.length > 3 || checklistStatus.completed.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F7F8]"
              onClick={() => setShowAllChecklist(!showAllChecklist)}
            >
              {showAllChecklist
                ? "Mostrar menos"
                : `Ver todos (${checklistStatus.completed.length}/${CHECKLIST_ITEMS.length} completos)`}
            </Button>
          )}

          {checklistStatus.percentage === 100 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-700">Perfil completo! 🎉</p>
                <p className="text-sm text-[#6B7280]">
                  Seu estabelecimento está otimizado para atrair aniversariantes.
                </p>
              </div>
            </div>
          )}
        </div>
      </PanelSection>

      {/* Benefit Card */}
      <PanelSection
        title="Seu Benefício"
        description="O que você oferece para aniversariantes"
        icon={<Gift className="w-5 h-5 text-pink-500" />}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="border-[#E7E7EA] text-[#111827] hover:bg-[#F7F7F8]"
            onClick={() => onNavigate("benefit")}
          >
            Editar
          </Button>
        }
      >
        {estabelecimento?.descricao_beneficio ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {tipoConfig && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#240046]/10 text-[#240046] text-xs font-medium">
                  {tipoConfig.emoji} {tipoConfig.label}
                </span>
              )}
              {estabelecimento.periodo_validade_beneficio && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F7F7F8] text-[#6B7280] text-xs border border-[#E7E7EA]">
                  {estabelecimento.periodo_validade_beneficio === "dia_aniversario"
                    ? "No dia"
                    : estabelecimento.periodo_validade_beneficio === "semana_aniversario"
                      ? "Na semana"
                      : "No mês"}
                </span>
              )}
            </div>
            <p className="text-[#111827] font-medium">{estabelecimento.descricao_beneficio}</p>
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-amber-600" />
            </div>
            <p className="font-medium text-[#111827] mb-1">Nenhum benefício configurado</p>
            <p className="text-sm text-[#6B7280] mb-4 max-w-sm mx-auto">
              Configure seu benefício para aparecer para os aniversariantes. Estabelecimentos com benefícios claros
              recebem mais visitas!
            </p>
            <Button className="bg-[#240046] hover:bg-[#3C096C]" onClick={() => onNavigate("benefit")}>
              <Gift className="w-4 h-4 mr-2" />
              Configurar benefício
            </Button>
          </div>
        )}
      </PanelSection>

      {/* Quick Actions */}
      <PanelSection
        title="Ações Rápidas"
        icon={<Zap className="w-5 h-5 text-amber-500" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 border-[#E7E7EA] hover:bg-[#F7F7F8] hover:border-[#D1D1D6]"
            onClick={() => onNavigate("profile")}
          >
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-[#111827]">Editar Perfil</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 border-[#E7E7EA] hover:bg-[#F7F7F8] hover:border-[#D1D1D6]"
            onClick={() => onNavigate("photos")}
          >
            <Camera className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-[#111827]">Adicionar Fotos</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 border-[#E7E7EA] hover:bg-[#F7F7F8] hover:border-[#D1D1D6]"
            onClick={() => onNavigate("analytics")}
          >
            <Eye className="w-5 h-5 text-cyan-500" />
            <span className="text-xs text-[#111827]">Ver Analytics</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 border-[#E7E7EA] hover:bg-[#F7F7F8] hover:border-[#D1D1D6]"
            onClick={() => window.open(`/${estabelecimento?.slug}`, "_blank")}
            disabled={!estabelecimento?.slug}
          >
            <ExternalLink className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-[#111827]">Ver Página</span>
          </Button>
        </div>
      </PanelSection>

      {/* Contacts Summary */}
      <PanelSection
        title="Canais de Contato"
        description="Cliques por canal nos últimos 30 dias"
      >
        {analytics?.cliquesWhatsapp ||
        analytics?.cliquesTelefone ||
        analytics?.cliquesInstagram ||
        analytics?.cliquesSite ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F7F8] border border-[#E7E7EA]">
              <div className="p-2 rounded-xl bg-emerald-100">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#111827]">{analytics?.cliquesWhatsapp || 0}</p>
                <p className="text-xs text-[#6B7280]">WhatsApp</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F7F8] border border-[#E7E7EA]">
              <div className="p-2 rounded-xl bg-blue-100">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#111827]">{analytics?.cliquesTelefone || 0}</p>
                <p className="text-xs text-[#6B7280]">Telefone</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F7F8] border border-[#E7E7EA]">
              <div className="p-2 rounded-xl bg-pink-100">
                <Instagram className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#111827]">{analytics?.cliquesInstagram || 0}</p>
                <p className="text-xs text-[#6B7280]">Instagram</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F7F8] border border-[#E7E7EA]">
              <div className="p-2 rounded-xl bg-cyan-100">
                <Globe className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#111827]">{analytics?.cliquesSite || 0}</p>
                <p className="text-xs text-[#6B7280]">Site</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F7F8] border border-[#E7E7EA] flex items-center justify-center mx-auto mb-3">
              <MousePointerClick className="w-6 h-6 text-[#9CA3AF]" />
            </div>
            <p className="text-[#6B7280] text-sm">Nenhum clique registrado ainda.</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Complete seu perfil para aumentar a visibilidade!</p>
          </div>
        )}
      </PanelSection>
    </div>
  );
}

export default EstablishmentDashboard;
