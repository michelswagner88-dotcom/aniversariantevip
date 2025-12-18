// =============================================================================
// HEADER.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial - Nível Airbnb/Instagram
// =============================================================================
// FEATURES:
// ✅ Hide on scroll DOWN (mais espaço pro conteúdo)
// ✅ Show on scroll UP (reaparece suavemente)
// ✅ Transparente no topo da home
// ✅ Glassmorphism quando scrollado
// =============================================================================

import { memo, useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, User, Gift, Building2, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// =============================================================================
// TYPES
// =============================================================================

interface HeaderProps {
  showSearch?: boolean;
  cityName?: string;
  onSearchClick?: () => void;
}

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SCROLL_THRESHOLD = 10;
const HIDE_THRESHOLD = 50; // Pixels para começar a esconder

// =============================================================================
// HOOKS
// =============================================================================

interface ScrollState {
  isScrolled: boolean;
  isHidden: boolean;
}

const useSmartScroll = (threshold: number = SCROLL_THRESHOLD): ScrollState => {
  const [state, setState] = useState<ScrollState>({
    isScrolled: false,
    isHidden: false,
  });

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollingDown = currentScrollY > lastScrollY.current;
          const scrollingUp = currentScrollY < lastScrollY.current;

          // Determina se passou do threshold inicial
          const isScrolled = currentScrollY > threshold;

          // Lógica de hide/show
          let isHidden = state.isHidden;

          if (scrollingDown && currentScrollY > HIDE_THRESHOLD) {
            // Scrolling down - esconde
            isHidden = true;
          } else if (scrollingUp) {
            // Scrolling up - mostra
            isHidden = false;
          }

          // No topo, sempre mostra
          if (currentScrollY <= threshold) {
            isHidden = false;
          }

          setState({ isScrolled, isHidden });
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    // Check inicial
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, state.isHidden]);

  return state;
};

const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  }, []);

  return { user, loading, signOut };
};

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface LogoProps {
  isTransparent: boolean;
}

const Logo = memo(({ isTransparent }: LogoProps) => {
  return (
    <Link
      to="/"
      className={cn(
        "font-display font-bold tracking-tight",
        "transition-colors duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg",
        "text-lg sm:text-xl",
        isTransparent ? "text-white focus-visible:ring-white" : "text-[#240046] focus-visible:ring-violet-500",
      )}
      style={isTransparent ? { color: "white" } : { color: "#240046" }}
      aria-label="Ir para página inicial"
    >
      Aniversariante
      <span
        className={cn("transition-colors duration-300", isTransparent ? "text-violet-300" : "text-violet-600")}
        style={isTransparent ? { color: "#c4b5fd" } : { color: "#7c3aed" }}
      >
        VIP
      </span>
    </Link>
  );
});
Logo.displayName = "Logo";

interface SearchPillProps {
  isVisible: boolean;
  cityName?: string;
  onClick?: () => void;
}

const SearchPill = memo(({ isVisible, cityName, onClick }: SearchPillProps) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "hidden lg:flex items-center gap-2",
        "pl-4 pr-2 py-1.5 rounded-full",
        "bg-white border border-gray-200",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        "hover:scale-[1.02] active:scale-[0.98]",
      )}
      aria-label="Abrir busca"
    >
      <span className="text-sm font-medium text-gray-900">{cityName || "Qualquer cidade"}</span>
      <span className="w-px h-4 bg-gray-200" aria-hidden="true" />
      <span className="text-sm text-gray-500">Buscar</span>
      <div className="w-7 h-7 rounded-full bg-[#240046] flex items-center justify-center ml-1">
        <Search className="w-3.5 h-3.5 text-white" />
      </div>
    </button>
  );
});
SearchPill.displayName = "SearchPill";

interface DesktopNavProps {
  isTransparent: boolean;
  user: AuthUser | null;
  onSignOut: () => void;
}

const DesktopNav = memo(({ isTransparent, user, onSignOut }: DesktopNavProps) => {
  const navigate = useNavigate();

  const linkClasses = cn(
    "px-4 py-2 rounded-full text-sm font-medium",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2",
    "hidden lg:flex items-center",
    "hover:scale-105 active:scale-95",
    isTransparent
      ? "text-white/90 hover:bg-white/10 focus-visible:ring-white"
      : "text-gray-700 hover:bg-gray-100 focus-visible:ring-violet-500",
  );

  return (
    <nav className="flex items-center gap-2" role="navigation" aria-label="Menu principal">
      <button
        onClick={() => navigate("/seja-parceiro")}
        className={linkClasses}
        style={isTransparent ? { color: "rgba(255,255,255,0.9)" } : { color: "#374151" }}
      >
        <Building2 className="w-4 h-4 mr-2" />
        Para Empresas
      </button>

      <div className="hidden lg:block">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-full",
                  "border transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  "hover:scale-105 active:scale-95",
                  isTransparent
                    ? "border-white/30 hover:bg-white/10 bg-white/5"
                    : "border-gray-200 hover:shadow-md bg-white",
                )}
                aria-label="Menu do usuário"
              >
                <Menu className={cn("w-4 h-4", isTransparent ? "text-white" : "text-gray-600")} />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#240046] to-violet-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate("/area-aniversariante")}>
                <Gift className="w-4 h-4 mr-2" />
                Minha Área
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracoes")}>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => navigate("/login")}
            size="sm"
            className={cn(
              "rounded-full px-5 font-medium",
              "transition-all duration-200",
              "hover:scale-105 active:scale-95",
              isTransparent
                ? "bg-white text-[#240046] hover:bg-white/90"
                : "bg-[#240046] hover:bg-[#3C096C] text-white",
            )}
            style={
              isTransparent
                ? { backgroundColor: "white", color: "#240046" }
                : { backgroundColor: "#240046", color: "white" }
            }
          >
            Entrar
          </Button>
        )}
      </div>
    </nav>
  );
});
DesktopNav.displayName = "DesktopNav";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Header = memo(function Header({ showSearch = true, cityName, onSearchClick }: HeaderProps) {
  const location = useLocation();
  const { isScrolled, isHidden } = useSmartScroll(SCROLL_THRESHOLD);
  const { user, signOut } = useAuth();

  const isHomePage = location.pathname === "/";
  const isTransparent = isHomePage && !isScrolled;

  const showSearchPill = isScrolled || !isHomePage;

  const handleSearchClick = useCallback(() => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      const searchSection = document.getElementById("search-section");
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [onSearchClick]);

  // Estilo inline para garantir transparência no mobile
  const headerStyle = isTransparent
    ? {
        backgroundColor: "transparent",
        background: "none",
        boxShadow: "none",
        borderBottom: "none",
      }
    : {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        borderBottom: "1px solid rgb(243 244 246)",
      };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "h-14 lg:h-16",
          // Transição suave para hide/show
          "transition-all duration-300 ease-out",
          isTransparent ? "bg-transparent" : "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100",
          // Hide on scroll down
          isHidden && !isTransparent ? "-translate-y-full" : "translate-y-0",
        )}
        style={headerStyle}
        role="banner"
      >
        <div className="h-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between">
          <Logo isTransparent={isTransparent} />
          {showSearch && <SearchPill isVisible={showSearchPill} cityName={cityName} onClick={handleSearchClick} />}
          <DesktopNav isTransparent={isTransparent} user={user} onSignOut={signOut} />
        </div>
      </header>

      {/* Spacer - só quando header NÃO é transparente E não está escondido */}
      {!isTransparent && !isHidden && <div className="h-14 lg:h-16" aria-hidden="true" />}
    </>
  );
});

Header.displayName = "Header";
export default Header;
