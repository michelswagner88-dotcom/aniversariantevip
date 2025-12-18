// =============================================================================
// HEADER.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial
// ESTÁTICO - Não muda com scroll
// =============================================================================

import { memo, useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, Gift, Building2, LogOut, Settings } from "lucide-react";
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
  className?: string;
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
// HOOKS
// =============================================================================

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
// LOGO - Com ícone de presente
// =============================================================================

const Logo = memo(() => {
  return (
    <Link to="/" className="flex items-center gap-3 group" aria-label="AniversarianteVIP - Ir para página inicial">
      {/* Ícone de presente */}
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
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
// DESKTOP NAV
// =============================================================================

interface DesktopNavProps {
  user: AuthUser | null;
  onSignOut: () => void;
}

const DesktopNav = memo(({ user, onSignOut }: DesktopNavProps) => {
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
          "text-white/90 hover:bg-white/10",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
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
                  "bg-white/10 hover:bg-white/20",
                  "border border-white/20",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                )}
                aria-label="Menu do usuário"
              >
                <Menu className="w-4 h-4 text-white" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
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
              "h-11 px-6 rounded-full",
              "bg-white text-gray-900",
              "font-semibold text-sm",
              "hover:bg-white/90",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
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
// MAIN COMPONENT - ESTÁTICO
// =============================================================================

export const Header = memo(function Header({ className }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header
      className={cn(
        "absolute top-0 left-0 right-0 z-50",
        "h-16 lg:h-[72px]",
        // Sem fundo - totalmente transparente, integrado ao Hero
        "bg-transparent",
        className,
      )}
      role="banner"
    >
      <div className="h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
        <Logo />
        <DesktopNav user={user} onSignOut={signOut} />
      </div>
    </header>
  );
});

Header.displayName = "Header";
export default Header;
