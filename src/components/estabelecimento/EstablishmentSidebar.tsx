// =============================================================================
// ESTABLISHMENT SIDEBAR - Menu lateral premium LIGHT
// Tema Light: fundo branco, borda sutil, roxo apenas como accent
// =============================================================================

import { useState } from "react";
import {
  LayoutDashboard,
  User,
  Gift,
  Image,
  BarChart3,
  Eye,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Cake,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Json } from "@/integrations/supabase/types";

// =============================================================================
// TYPES
// =============================================================================

interface EstabelecimentoData {
  id: string;
  nome_fantasia: string | null;
  logo_url: string | null;
  ativo: boolean;
  plan_status: string | null;
  slug: string | null;
  telefone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  bio: string | null;
  descricao_beneficio: string | null;
  fotos: Json | null;
  horario_funcionamento: string | null;
  cidade: string | null;
}

type ActiveTab = "dashboard" | "profile" | "benefit" | "photos" | "analytics" | "preview" | "settings";

interface EstablishmentSidebarProps {
  estabelecimento: EstabelecimentoData | null;
  activeTab: ActiveTab;
  collapsed: boolean;
  onNavigate: (tab: ActiveTab) => void;
  onCollapsedChange: (collapsed: boolean) => void;
  onLogout: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

const calculateProfileCompletion = (est: EstabelecimentoData | null): number => {
  if (!est) return 0;

  const fotos = Array.isArray(est.fotos) ? est.fotos : [];
  const fields = [
    est.nome_fantasia,
    est.telefone || est.whatsapp,
    est.bio,
    est.descricao_beneficio,
    fotos.length > 0,
    est.horario_funcionamento,
    est.cidade,
    est.instagram,
  ];

  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

const getStatusConfig = (est: EstabelecimentoData | null) => {
  if (!est) return { label: "Carregando...", color: "text-[#6B7280]", icon: Clock };

  if (est.ativo) {
    return { label: "Ativo", color: "text-emerald-600", icon: CheckCircle, bg: "bg-emerald-50" };
  }
  return { label: "Pendente", color: "text-amber-600", icon: AlertCircle, bg: "bg-amber-50" };
};

// =============================================================================
// MENU ITEMS
// =============================================================================

const menuItems: { id: ActiveTab; label: string; icon: any; description: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Visão geral" },
  { id: "profile", label: "Meu Perfil", icon: User, description: "Dados do estabelecimento" },
  { id: "benefit", label: "Benefício", icon: Gift, description: "Configure seu benefício" },
  { id: "photos", label: "Fotos", icon: Image, description: "Galeria de imagens" },
  { id: "analytics", label: "Analytics", icon: BarChart3, description: "Métricas detalhadas" },
  { id: "preview", label: "Ver Página", icon: Eye, description: "Como os clientes veem" },
  { id: "settings", label: "Configurações", icon: Settings, description: "Preferências" },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function EstablishmentSidebar({
  estabelecimento,
  activeTab,
  collapsed,
  onNavigate,
  onCollapsedChange,
  onLogout,
}: EstablishmentSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const completion = calculateProfileCompletion(estabelecimento);
  const status = getStatusConfig(estabelecimento);
  const StatusIcon = status.icon;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-[#E7E7EA]",
          collapsed && "justify-center px-2"
        )}
      >
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-[#F7F7F8] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#E7E7EA]">
          {estabelecimento?.logo_url ? (
            <img src={estabelecimento.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Cake className="w-5 h-5 text-[#240046]" />
          )}
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-[#111827] text-sm truncate">
              {estabelecimento?.nome_fantasia || "Meu Estabelecimento"}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusIcon className={cn("w-3 h-3", status.color)} />
              <span className={cn("text-xs font-medium", status.color)}>{status.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Profile Completion - Only when not collapsed */}
      {!collapsed && completion < 100 && (
        <div className="px-4 py-4 border-b border-[#E7E7EA]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280]">Perfil completo</span>
            <span className="text-xs font-semibold text-[#240046]">{completion}%</span>
          </div>
          <Progress value={completion} className="h-1.5 bg-[#E7E7EA] [&>div]:bg-[#240046]" />
          {completion < 100 && (
            <p className="text-[10px] text-[#9CA3AF] mt-2">
              Complete seu perfil para aparecer melhor nos resultados
            </p>
          )}
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            const menuButton = (
              <button
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={cn(
                  "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                  isActive
                    ? "bg-[#240046]/5 text-[#111827] font-medium"
                    : "text-[#6B7280] hover:bg-[#F7F7F8] hover:text-[#111827]",
                  collapsed && "justify-center px-2"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#240046] rounded-full" />
                )}

                <Icon
                  className={cn(
                    "w-[18px] h-[18px] flex-shrink-0",
                    isActive ? "text-[#240046]" : "text-[#9CA3AF]"
                  )}
                />

                {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              </button>
            );

            if (collapsed) {
              return (
                <li key={item.id}>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-[#111827] text-white border-0">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-white/70">{item.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              );
            }

            return <li key={item.id}>{menuButton}</li>;
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-[#E7E7EA] p-3 space-y-1.5">
        {/* Navegar pelo site */}
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F7F8]"
            onClick={() => window.open("/", "_blank")}
          >
            <Globe className="w-4 h-4 mr-2" />
            Navegar pelo site
          </Button>
        )}

        {/* Ver página pública do estabelecimento */}
        {!collapsed && estabelecimento?.slug && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F7F8]"
            onClick={() => window.open(`/${estabelecimento.slug}`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver minha página
          </Button>
        )}

        {/* Quando collapsed - mostrar apenas ícones com tooltip */}
        {collapsed && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F7F8]"
                  onClick={() => window.open("/", "_blank")}
                >
                  <Globe className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#111827] text-white border-0">
                <p>Navegar pelo site</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {collapsed && estabelecimento?.slug && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F7F8]"
                  onClick={() => window.open(`/${estabelecimento.slug}`, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#111827] text-white border-0">
                <p>Ver minha página</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className={cn(
            "w-full text-[#6B7280] hover:text-red-600 hover:bg-red-50",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>

      {/* Collapse Toggle - Desktop */}
      <button
        onClick={() => onCollapsedChange(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-[#E7E7EA] shadow-sm items-center justify-center text-[#6B7280] hover:text-[#111827] hover:shadow-md transition-all"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white border border-[#E7E7EA] text-[#6B7280] shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 bg-white border-r border-[#E7E7EA] transition-all duration-200 z-30",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#E7E7EA] transform transition-transform duration-200 shadow-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-[#F7F7F8]"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}

export default EstablishmentSidebar;
