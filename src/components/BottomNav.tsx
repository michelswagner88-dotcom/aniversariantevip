// =============================================================================
// BOTTOMNAV.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial - Nível Airbnb/iFood
// Usa useUserRole centralizado para consistência de roles
// =============================================================================

import { memo, useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, Heart, User, Building2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

// =============================================================================
// TYPES
// =============================================================================

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
  authRequired?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const NAV_ITEMS_ANIVERSARIANTE: NavItem[] = [
  { id: "home", label: "Início", icon: Home, path: "/" },
  { id: "search", label: "Buscar", icon: Search, path: "/explorar" },
  { id: "favorites", label: "Favoritos", icon: Heart, path: "/meus-favoritos", authRequired: true },
  { id: "profile", label: "Perfil", icon: User, path: "/area-aniversariante", authRequired: true },
];

const NAV_ITEMS_ESTABELECIMENTO: NavItem[] = [
  { id: "home", label: "Início", icon: Home, path: "/" },
  { id: "search", label: "Buscar", icon: Search, path: "/explorar" },
  { id: "panel", label: "Minha Área", icon: Building2, path: "/area-estabelecimento", authRequired: true },
  { id: "settings", label: "Config", icon: Settings, path: "/area-estabelecimento?tab=configuracoes", authRequired: true },
];

const NAV_ITEMS_DEFAULT: NavItem[] = [
  { id: "home", label: "Início", icon: Home, path: "/" },
  { id: "search", label: "Buscar", icon: Search, path: "/explorar" },
  { id: "favorites", label: "Favoritos", icon: Heart, path: "/meus-favoritos", authRequired: true },
  { id: "profile", label: "Perfil", icon: User, path: "/login", authRequired: true },
];

// =============================================================================
// HOOKS
// =============================================================================

const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

const useFavoritesCount = (isAuthenticated: boolean, userRole: string | null) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Não buscar favoritos para estabelecimentos
    if (!isAuthenticated || userRole === "estabelecimento") {
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { count: favCount } = await supabase
          .from("favoritos")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", user.id);

        setCount(favCount || 0);
      } catch (error) {
        console.error("Erro ao buscar favoritos:", error);
      }
    };

    fetchCount();

    // Realtime subscription para atualizar contador
    const channel = supabase
      .channel("favoritos-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "favoritos" }, () => fetchCount())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, userRole]);

  return count;
};

const hapticFeedback = (pattern: number | number[] = 10) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}

const NavButton = memo(({ item, isActive, badge, onClick }: NavButtonProps) => {
  const reducedMotion = useReducedMotion();
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center",
        "flex-1 py-2 px-1",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:bg-gray-100 rounded-lg",
        "min-h-[56px]",
        !reducedMotion && "active:scale-95",
      )}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="relative">
        <Icon
          className={cn("w-6 h-6 transition-all duration-200", isActive ? "text-[#240046] scale-110" : "text-gray-400")}
          strokeWidth={isActive ? 2.5 : 2}
          fill={isActive && item.id === "favorites" ? "currentColor" : "none"}
        />

        {/* Badge */}
        {badge !== undefined && badge > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-2",
              "min-w-[18px] h-[18px] px-1",
              "flex items-center justify-center",
              "text-[10px] font-bold text-white",
              "bg-gradient-to-r from-pink-500 to-rose-500",
              "rounded-full",
              "shadow-sm",
            )}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>

      <span
        className={cn(
          "text-[10px] mt-1 font-medium transition-colors duration-200",
          isActive ? "text-[#240046]" : "text-gray-400",
        )}
      >
        {item.label}
      </span>

      {/* Active indicator */}
      {isActive && (
        <div className={cn("absolute top-1 left-1/2 -translate-x-1/2", "w-1 h-1 rounded-full", "bg-[#240046]")} />
      )}
    </button>
  );
});
NavButton.displayName = "NavButton";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const BottomNav = memo(function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role: userRole } = useUserRole();
  const isAuthenticated = !!user;
  const favoritesCount = useFavoritesCount(isAuthenticated, userRole);
  const reducedMotion = useReducedMotion();

  // Selecionar items de navegação baseado na role
  const navItems = useMemo(() => {
    if (!isAuthenticated) return NAV_ITEMS_DEFAULT;
    if (userRole === "estabelecimento") return NAV_ITEMS_ESTABELECIMENTO;
    if (userRole === "aniversariante") return NAV_ITEMS_ANIVERSARIANTE;
    // Admin/colaborador: usar default (não tem bottom nav específica)
    return NAV_ITEMS_DEFAULT;
  }, [isAuthenticated, userRole]);

  // Detectar path ativo
  const getActiveId = useCallback(() => {
    const path = location.pathname;
    const search = location.search;

    if (path === "/") return "home";
    if (path.startsWith("/explorar") || path.startsWith("/buscar")) return "search";
    
    // Para estabelecimento
    if (path.startsWith("/area-estabelecimento")) {
      if (search.includes("tab=configuracoes")) return "settings";
      return "panel";
    }
    
    // Para aniversariante
    if (path.startsWith("/meus-favoritos") || path.startsWith("/favoritos")) return "favorites";
    if (path.startsWith("/area-aniversariante") || path.startsWith("/perfil") || path.startsWith("/login"))
      return "profile";

    return "home";
  }, [location.pathname, location.search]);

  const activeId = getActiveId();

  const handleNavClick = useCallback(
    (item: NavItem) => {
      hapticFeedback(10);

      // Se requer auth e não está logado, vai pro login
      if (item.authRequired && !isAuthenticated) {
        navigate("/login", { state: { from: item.path } });
        return;
      }

      navigate(item.path);
    },
    [navigate, isAuthenticated],
  );

  // Não mostrar em algumas páginas (ex: checkout, onboarding)
  const hiddenPaths = ["/checkout", "/onboarding", "/cadastro/estabelecimento"];
  const shouldHide = hiddenPaths.some((p) => location.pathname.startsWith(p));

  if (shouldHide) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-white/80 backdrop-blur-xl",
        "border-t border-gray-200/50",
        "shadow-[0_-4px_20px_rgba(0,0,0,0.08)]",
        "lg:hidden", // Só mobile/tablet
        "safe-area-inset-bottom",
      )}
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            badge={item.id === "favorites" ? favoritesCount : undefined}
            onClick={() => handleNavClick(item)}
          />
        ))}
      </div>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";
export default BottomNav;
