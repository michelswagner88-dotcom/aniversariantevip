// =============================================================================
// HEADER.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial - Airbnb/Stripe Quality
// =============================================================================

import { memo, useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, User, Gift, Building2, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
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
const HIDE_THRESHOLD = 80;

// =============================================================================
// HOOKS
// =============================================================================

interface ScrollState {
  isScrolled: boolean;
  isHidden: boolean;
}

const useSmartScroll = (): ScrollState => {
  const [state, setState] = useState<ScrollState>({
    isScrolled: false,
    isHidden: false,
  });

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > SCROLL_THRESHOLD;
      const isHidden = currentScrollY > HIDE_THRESHOLD && currentScrollY > lastScrollY.current;

      setState({ isScrolled, isHidden });
      lastScrollY.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
// LOGO - Com ícone de presente igual ao Footer
// =============================================================================

const Logo = memo(() => {
  return (
    <Link to="/" className="flex items-center gap-3 group" aria-label="AniversarianteVIP - Ir para página inicial">
      {/* Ícone de presente */}
      <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
        <Gift className="w-5 h-5 text-white" />
      </div>

      {/* Texto com gradiente */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-base sm:text-lg font-bold uppercase tracking-wide"
          style={{
            background: "linear-gradient(to right, #A78BFA, #60A5FA, #22D3EE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Aniversariante
        </span>
        <span
          className="text-base sm:text-lg font-bold uppercase tracking-wide"
          style={{
            background: "linear-gradient(to right, #22D3EE, #06B6D4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VIP
        </span>
      </div>
    </Link>
  );
});
Logo.displayName = "Logo";

// =============================================================================
// LOGO SCROLLED - Versão para fundo branco
// =============================================================================

const LogoScrolled = memo(() => {
  return (
    <Link to="/" className="flex items-center gap-3 group" aria-label="AniversarianteVIP - Ir para página inicial">
      {/* Ícone de presente - versão escura */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-xl group-hover:shadow-violet-500/30 transition-all">
        <Gift className="w-5 h-5 text-white" />
      </div>

      {/* Texto com gradiente */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-base sm:text-lg font-bold uppercase tracking-wide"
          style={{
            background: "linear-gradient(to right, #7C3AED, #3B82F6, #06B6D4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Aniversariante
        </span>
        <span
          className="text-base sm:text-lg font-bold uppercase tracking-wide"
          style={{
            background: "linear-gradient(to right, #06B6D4, #22D3EE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VIP
        </span>
      </div>
    </Link>
  );
});
LogoScrolled.displayName = "LogoScrolled";

// =============================================================================
// SEARCH PILL - Desktop only (aparece quando scrollado)
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
        "hidden lg:flex items-center",
        "h-12 pl-5 pr-2 rounded-full",
        "bg-white",
        "border border-gray-200",
        "shadow-sm hover:shadow-lg",
        "transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
      )}
      aria-label="Abrir busca"
    >
      <span className="text-sm font-medium text-gray-900 pr-4">{cityName || "Qualquer cidade"}</span>
      <span className="w-px h-6 bg-gray-200" aria-hidden="true" />
      <span className="text-sm text-gray-500 px-4">Buscar benefícios</span>
      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-md">
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
  isTransparent: boolean;
  user: AuthUser | null;
  onSignOut: () => void;
}

const DesktopNav = memo(({ isTransparent, user, onSignOut }: DesktopNavProps) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-2" aria-label="Menu principal">
      {/* Para Empresas */}
      <button
        onClick={() => navigate("/seja-parceiro")}
        className={cn(
          "hidden lg:flex items-center gap-2",
          "h-11 px-5 rounded-full",
          "text-sm font-semibold",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isTransparent
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
                  "h-11 pl-3 pr-2 rounded-full",
                  "transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  isTransparent
                    ? "bg-white/10 hover:bg-white/20 border border-white/20"
                    : "bg-white hover:shadow-lg border border-gray-200 shadow-sm",
                )}
                aria-label="Menu do usuário"
              >
                <Menu className={cn("w-4 h-4", isTransparent ? "text-white" : "text-gray-600")} />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-0">
              <div className="px-3 py-3 mb-2 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.user_metadata?.full_name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <DropdownMenuItem
                onClick={() => navigate("/area-aniversariante")}
                className="h-11 rounded-lg cursor-pointer"
              >
                <Gift className="w-4 h-4 mr-3 text-violet-600" />
                <span className="font-medium">Minha Área</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="h-11 rounded-lg cursor-pointer">
                <Settings className="w-4 h-4 mr-3 text-gray-500" />
                <span className="font-medium">Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={onSignOut}
                className="h-11 rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-3" />
                <span className="font-medium">Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className={cn(
              "h-11 px-6 rounded-full font-semibold text-sm",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              isTransparent
                ? "bg-white text-gray-900 hover:bg-white/90 shadow-lg focus-visible:ring-white"
                : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-violet-500/25 focus-visible:ring-violet-500",
            )}
          >
            Entrar
          </button>
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
  const { isScrolled, isHidden } = useSmartScroll();
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
          "h-16 lg:h-[72px]",
          "transition-all duration-300 ease-out",
          // Background
          isTransparent ? "bg-transparent" : "bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm",
          // Hide on scroll
          isHidden ? "-translate-y-full" : "translate-y-0",
        )}
        role="banner"
      >
        <div className="h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          {/* Logo */}
          {isTransparent ? <Logo /> : <LogoScrolled />}

          {/* Search Pill - Desktop */}
          {showSearch && <SearchPill isVisible={showSearchPill} cityName={cityName} onClick={handleSearchClick} />}

          {/* Navigation */}
          <DesktopNav isTransparent={isTransparent} user={user} onSignOut={signOut} />
        </div>
      </header>

      {/* Spacer */}
      {!isTransparent && <div className="h-16 lg:h-[72px]" aria-hidden="true" />}
    </>
  );
});

Header.displayName = "Header";
export default Header;
