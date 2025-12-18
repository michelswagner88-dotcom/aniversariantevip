// =============================================================================
// HEADER.TSX - ANIVERSARIANTE VIP
// Design: Estilo Airbnb Mobile
// =============================================================================

import { memo, useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Gift, Building2, User, HelpCircle, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// =============================================================================
// TYPES
// =============================================================================

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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
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

  return { user, signOut };
};

// =============================================================================
// LOGO
// =============================================================================

const Logo = memo(() => {
  return (
    <Link to="/" className="flex items-center gap-1.5" aria-label="AniversarianteVIP - Ir para página inicial">
      <span
        className="text-sm sm:text-base font-bold uppercase tracking-wide"
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
        className="text-sm sm:text-base font-bold uppercase tracking-wide"
        style={{
          background: "linear-gradient(to right, #22D3EE, #06B6D4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        VIP
      </span>
    </Link>
  );
});
Logo.displayName = "Logo";

// =============================================================================
// MOBILE MENU
// =============================================================================

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onSignOut: () => void;
}

const MobileMenu = memo(({ isOpen, onClose, user, onSignOut }: MobileMenuProps) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Menu Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl">
        {/* Header do Menu */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Menu</span>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          {user ? (
            <>
              {/* User Info */}
              <div className="px-4 py-3 mb-2 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.user_metadata?.full_name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>

              <button
                onClick={() => handleNavigate("/area-aniversariante")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Gift className="w-5 h-5 text-violet-600" />
                <span className="font-medium text-gray-900">Minha Área</span>
              </button>

              <button
                onClick={() => handleNavigate("/configuracoes")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Configurações</span>
              </button>

              <div className="my-2 border-t border-gray-100" />

              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </>
          ) : (
            <>
              {/* Login/Cadastro Aniversariante */}
              <button
                onClick={() => handleNavigate("/login")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <User className="w-5 h-5 text-violet-600" />
                <div className="text-left">
                  <span className="font-medium text-gray-900 block">Entrar</span>
                  <span className="text-xs text-gray-500">Aniversariante</span>
                </div>
              </button>

              <button
                onClick={() => handleNavigate("/cadastro")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Gift className="w-5 h-5 text-fuchsia-600" />
                <div className="text-left">
                  <span className="font-medium text-gray-900 block">Cadastrar</span>
                  <span className="text-xs text-gray-500">Aniversariante</span>
                </div>
              </button>

              <div className="my-2 border-t border-gray-100" />

              {/* Estabelecimento */}
              <button
                onClick={() => handleNavigate("/seja-parceiro")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Building2 className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <span className="font-medium text-gray-900 block">Para Empresas</span>
                  <span className="text-xs text-gray-500">Cadastre seu estabelecimento</span>
                </div>
              </button>

              <div className="my-2 border-t border-gray-100" />

              {/* Como Funciona */}
              <button
                onClick={() => handleNavigate("/como-funciona")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Como Funciona</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
});
MobileMenu.displayName = "MobileMenu";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Header = memo(function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="bg-[#240046] px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Hamburguer */}
          <button
            onClick={() => setMenuOpen(true)}
            className={cn(
              "w-10 h-10 flex items-center justify-center",
              "rounded-full",
              "bg-white/10 hover:bg-white/20",
              "transition-colors",
            )}
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} onSignOut={signOut} />
    </>
  );
});

Header.displayName = "Header";
export default Header;
