// =============================================================================
// ESTABLISHMENT SIDEBAR - Menu lateral premium
// =============================================================================

import { useState, useEffect } from "react";
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
  ChevronDown,
  Menu,
  X,
  Cake,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
  // Campos para calcular completude
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
  if (!est) return { label: "Carregando...", color: "text-slate-400", icon: Clock };

  if (est.ativo) {
    return { label: "Ativo", color: "text-emerald-400", icon: CheckCircle, bg: "bg-emerald-500/20" };
  }
  return { label: "Pendente", color: "text-amber-400", icon: AlertCircle, bg: "bg-amber-500/20" };
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
          "flex items-center gap-3 px-4 py-5 border-b border-slate-800",
          collapsed && "justify-center px-2",
        )}
      >
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {estabelecimento?.logo_url ? (
            <img src={estabelecimento.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Cake className="w-5 h-5 text-violet-400" />
          )}
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-white text-sm truncate">
              {estabelecimento?.nome_fantasia || "Meu Estabelecimento"}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusIcon className={cn("w-3 h-3", status.color)} />
              <span className={cn("text-xs", status.color)}>{status.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Profile Completion - Only when not collapsed */}
      {!collapsed && completion < 100 && (
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Perfil completo</span>
            <span className="text-xs font-medium text-violet-400">{completion}%</span>
          </div>
          <Progress value={completion} className="h-1.5 bg-slate-800" />
          {completion < 100 && (
            <p className="text-[10px] text-slate-500 mt-2">Complete seu perfil para aparecer melhor nos resultados</p>
          )}
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
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
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                  "hover:bg-white/5",
                  isActive ? "bg-violet-500/10 text-violet-300 font-medium" : "text-slate-400 hover:text-white",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-violet-400")} />

                {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              </button>
            );

            if (collapsed) {
              return (
                <li key={item.id}>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700">
                        <p>{item.label}</p>
                        <p className="text-xs text-slate-400">{item.description}</p>
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
      <div className="border-t border-slate-800 p-3 space-y-2">
        {/* View Public Page */}
        {!collapsed && estabelecimento?.slug && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => window.open(`/${estabelecimento.slug}`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver página pública
          </Button>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className={cn(
            "w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10",
            collapsed ? "justify-center" : "justify-start",
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>

      {/* Collapse Toggle - Desktop */}
      <button
        onClick={() => onCollapsedChange(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-90" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 bg-slate-950 border-r border-slate-800 transition-all duration-200 z-30",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}

export default EstablishmentSidebar;
