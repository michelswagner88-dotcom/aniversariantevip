// =============================================================================
// HEADER.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial
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
// DESIGN TOKENS
// =============================================================================

const BRAND_PRIMARY = "#240046";
const HEADER_HEIGHT_MOBILE = 56; // 14 * 4 = 56px
const HEADER_HEIGHT_DESKTOP = 64; // 16 * 4 = 64px

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
const HIDE_THRESHOLD = 60;

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
          const isScrolled = currentScrollY > threshold;

          // Lógica de hide/show
          let isHidden = false;

          if (currentScrollY > HIDE_THRESHOLD) {
            // Só esconde se scrollou mais que o threshold E está descendo
            isHidden = currentScrollY > lastScrollY.current;
          }

          setState({ isScrolled, isHidden });
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

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
// LOGO
// =============================================================================

interface LogoProps {
  variant: "light" | "dark";
}

const Logo = memo(({ variant }: LogoProps) => {
  const isLight = variant === "light";

  return (
    <Link
      to="/"
      className={cn(
        "font-bold tracking-tight",
        "text-lg sm:text-xl",
        "transition-opacity duration-200",
        "hover:opacity-80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded",
        isLight ? "text-white focus-visible:ring-white" : "text-[#240046] focus-visible:ring-violet-500",
      )}
      aria-label="AniversarianteVIP - Ir para página inicial"
    >
      Aniversariante
      <span className={isLight ? "text-violet-300" : "text-violet-600"}>VIP</span>
    </Link>
  );
});
Logo.displayName = "Logo";

// =============================================================================
// SEARCH PILL (Desktop only)
// =============================================================================

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
        "h-11 pl-4 pr-2 rounded-full",
        "bg-white border border-gray-200",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
      )}
      aria-label="Abrir busca"
    >
      <span className="text-sm font-medium text-gray-900">{cityName || "Qualquer cidade"}</span>
      <span className="w-px h-5 bg-gray-200" aria-hidden="true" />
      <span className="text-sm text-gray-500">Buscar</span>
      <div className="w-8 h-8 rounded-full bg-[#240046] flex items-center justify-center ml-1">
        <Search className="w-4 h-4 text-white" />
      </div>
    </button>
  );
});
SearchPill.displayName = "SearchPill";

// =============================================================================
// DESKTOP NAV
// =============================================================================

interface DesktopNavProps {
  variant: "light" | "dark";
  user: AuthUser | null;
  onSignOut: () => void;
}

const DesktopNav = memo(({ variant, user, onSignOut }: DesktopNavProps) => {
  const navigate = useNavigate();
  const isLight = variant === "light";

  return (
    <nav className="flex items-center gap-2" aria-label="Menu principal">
      {/* Para Empresas */}
      <button
        onClick={() => navigate("/seja-parceiro")}
        className={cn(
          "hidden lg:flex items-center gap-2",
          "h-10 px-4 rounded-full",
          "text-sm font-medium",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isLight
            ? "text-white/90 hover:bg-white/10 focus-visible:ring-white"
            : "text-gray-700 hover:bg-gray-100 focus-visible:ring-violet-500",
        )}
      >
        <Building2 className="w-4 h-4" />
        <span>Para Empresas</span>
      </button>

      {/* User Menu / Login */}
      <div className="hidden lg:block">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2",
                  "h-10 px-2 rounded-full",
                  "border transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  isLight ? "border-white/30 hover:bg-white/10" : "border-gray-200 hover:shadow-md bg-white",
                )}
                aria-label="Menu do usuário"
              >
                <Menu className={cn("w-4 h-4", isLight ? "text-white" : "text-gray-600")} />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#240046] to-violet-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
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
              "h-10 px-5 rounded-full font-medium",
              "transition-all duration-200",
              isLight ? "bg-white text-[#240046] hover:bg-white/90" : "bg-[#240046] hover:bg-[#3C096C] text-white",
            )}
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
      searchSection?.scrollIntoView({ behavior: "smooth" });
    }
  }, [onSearchClick]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "h-14 lg:h-16",
          "transition-all duration-300 ease-out",
          // Background
          isTransparent ? "bg-transparent" : "bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm",
          // Hide on scroll
          isHidden ? "-translate-y-full" : "translate-y-0",
        )}
        role="banner"
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Logo variant={isTransparent ? "light" : "dark"} />

          {showSearch && <SearchPill isVisible={showSearchPill} cityName={cityName} onClick={handleSearchClick} />}

          <DesktopNav variant={isTransparent ? "light" : "dark"} user={user} onSignOut={signOut} />
        </div>
      </header>

      {/* Spacer - compensa altura do header quando fixo e visível */}
      {!isTransparent && <div className="h-14 lg:h-16" aria-hidden="true" />}
    </>
  );
});

Header.displayName = "Header";
export default Header;
