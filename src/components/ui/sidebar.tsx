// =============================================================================
// ADMIN SIDEBAR - ANIVERSARIANTE VIP
// Menu lateral premium reorganizado
// Estilo Vercel/Linear com badges, grupos e atalhos
// =============================================================================

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Map,
  Mail,
  Shield,
  UserCog,
  Settings,
  CreditCard,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  FolderOpen,
  Bell,
  MessageSquare,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Cake,
  Heart,
  Eye,
  MousePointer,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// =============================================================================
// TYPES
// =============================================================================

interface AdminSidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: number | string;
  badgeVariant?: "default" | "destructive" | "secondary";
  shortcut?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

// =============================================================================
// MENU STRUCTURE
// =============================================================================

const createMenuGroups = (stats: {
  pendentes: number;
  aniversariantesHoje: number;
  notificacoes: number;
}): MenuGroup[] => [
  {
    label: "",
    items: [{ id: "overview", label: "Dashboard", icon: LayoutDashboard, shortcut: "G D" }],
  },
  {
    label: "Gerenciamento",
    items: [
      {
        id: "establishments",
        label: "Estabelecimentos",
        icon: Building2,
        shortcut: "G E",
      },
      {
        id: "approval-queue",
        label: "Fila de Aprovação",
        icon: Clock,
        badge: stats.pendentes > 0 ? stats.pendentes : undefined,
        badgeVariant: "destructive",
      },
      {
        id: "users",
        label: "Usuários",
        icon: Users,
        badge: stats.aniversariantesHoje > 0 ? `🎂 ${stats.aniversariantesHoje}` : undefined,
        badgeVariant: "secondary",
        shortcut: "G U",
      },
      { id: "import", label: "Importar CSV", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Conteúdo",
    collapsible: true,
    defaultOpen: false,
    items: [
      { id: "categories", label: "Categorias", icon: FolderOpen },
      { id: "cities", label: "Cidades", icon: Map },
    ],
  },
  {
    label: "Analytics",
    items: [
      { id: "mapa", label: "Mapa", icon: Map, shortcut: "G M" },
      { id: "email-analytics", label: "E-mails", icon: Mail },
      { id: "engagement", label: "Engajamento", icon: Eye },
    ],
  },
  {
    label: "Financeiro",
    collapsible: true,
    defaultOpen: false,
    items: [
      { id: "subscriptions", label: "Assinaturas", icon: CreditCard },
      { id: "revenue", label: "Receita", icon: TrendingUp },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "security", label: "Segurança", icon: Shield },
      { id: "colaboradores", label: "Colaboradores", icon: UserCog },
      { id: "settings", label: "Configurações", icon: Settings },
    ],
  },
];

// =============================================================================
// MENU ITEM COMPONENT
// =============================================================================

const SidebarMenuItem = ({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: MenuItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) => {
  const content = (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
        "hover:bg-white/5",
        active ? "bg-violet-500/10 text-violet-300 font-medium" : "text-slate-400 hover:text-white",
        collapsed && "justify-center px-2",
      )}
    >
      <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", active && "text-violet-400")} />

      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{item.label}</span>

          {item.badge && (
            <Badge
              variant={item.badgeVariant || "secondary"}
              className={cn(
                "text-[10px] px-1.5 py-0 min-w-[20px] justify-center",
                item.badgeVariant === "destructive" && "bg-red-500/20 text-red-400 border-red-500/30",
              )}
            >
              {item.badge}
            </Badge>
          )}

          {item.shortcut && !item.badge && (
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-600 bg-slate-800 rounded hidden lg:inline">
              {item.shortcut}
            </kbd>
          )}
        </>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-800 border-slate-700">
            <div className="flex items-center gap-2">
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant={item.badgeVariant || "secondary"} className="text-[10px]">
                  {item.badge}
                </Badge>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

// =============================================================================
// MENU GROUP COMPONENT
// =============================================================================

const SidebarMenuGroup = ({
  group,
  activeTab,
  collapsed,
  onNavigate,
}: {
  group: MenuGroup;
  activeTab: string;
  collapsed: boolean;
  onNavigate: (tab: string) => void;
}) => {
  const [open, setOpen] = useState(group.defaultOpen ?? true);

  if (group.collapsible && !collapsed) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors">
          {group.label}
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <SidebarMenuItem
                key={item.id}
                item={item}
                active={activeTab === item.id}
                collapsed={collapsed}
                onClick={() => onNavigate(item.id)}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div>
      {group.label && !collapsed && (
        <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.label}</p>
      )}
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <SidebarMenuItem
            key={item.id}
            item={item}
            active={activeTab === item.id}
            collapsed={collapsed}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AdminSidebar({ activeTab, onNavigate, collapsed = false, onCollapsedChange }: AdminSidebarProps) {
  const [stats, setStats] = useState({
    pendentes: 0,
    aniversariantesHoje: 0,
    notificacoes: 0,
  });
  const [darkMode, setDarkMode] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch stats for badges
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Estabelecimentos pendentes
        const { count: pendentes } = await supabase
          .from("estabelecimentos")
          .select("id", { count: "exact" })
          .eq("ativo", false)
          .is("deleted_at", null);

        // Aniversariantes hoje
        const hoje = new Date();
        const { data: aniversariantes } = await supabase
          .from("aniversariantes")
          .select("data_nascimento")
          .is("deleted_at", null);

        const anivHoje =
          aniversariantes?.filter((a) => {
            if (!a.data_nascimento) return false;
            const d = new Date(a.data_nascimento);
            return d.getDate() === hoje.getDate() && d.getMonth() === hoje.getMonth();
          }).length || 0;

        setStats({
          pendentes: pendentes || 0,
          aniversariantesHoje: anivHoje,
          notificacoes: (pendentes || 0) + (anivHoje > 0 ? 1 : 0),
        });
      } catch (error) {
        console.error("Error fetching sidebar stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const menuGroups = createMenuGroups(stats);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-slate-800",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0">
          <Cake className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-bold text-white text-sm truncate">Aniversariante VIP</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {menuGroups.map((group, index) => (
          <SidebarMenuGroup
            key={group.label || index}
            group={group}
            activeTab={activeTab}
            collapsed={collapsed}
            onNavigate={(tab) => {
              onNavigate(tab);
              setMobileOpen(false);
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3 space-y-2">
        {/* Theme toggle */}
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
            {darkMode ? "Dark Mode" : "Light Mode"}
          </Button>
        )}

        {/* Help */}
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Ajuda
          </Button>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10",
            collapsed ? "justify-center" : "justify-start",
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>

      {/* Collapse toggle - Desktop */}
      {onCollapsedChange && (
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-90" />}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-slate-950 border-r border-slate-800 transition-all duration-200 relative",
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

export default AdminSidebar;
