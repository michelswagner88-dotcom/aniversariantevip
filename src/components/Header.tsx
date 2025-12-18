// =============================================================================
// HEADER.TSX - ANIVERSARIANTE VIP
// Design: Identidade roxa + Refinamento profissional
// =============================================================================

import { memo, useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, Gift, Building2, LogOut, Settings, HelpCircle, X } from "lucide-react";
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
    <Link to="/" className="flex items-center gap-1.5" aria-label="AniversarianteVIP">
      <span
        className="text-base font-bold uppercase tracking-wide"
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
        className="text-base font-bold uppercase tracking-wide"
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

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Menu</span>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="p-3">
          {user ? (
            <>
              <div className="px-3 py-3 mb-2 bg-violet-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.user_metadata?.full_name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>

              <MenuItem
                icon={<Gift className="w-5 h-5 text-violet-600" />}
                label="Minha Área"
                onClick={() => handleNavigate("/area-aniversariante")}
              />
              <MenuItem
                icon={<Settings className="w-5 h-5 text-gray-400" />}
                label="Configurações"
                onClick={() => handleNavigate("/configuracoes")}
              />
              <div className="my-2 mx-3 border-t border-gray-100" />
              <MenuItem
                icon={<LogOut className="w-5 h-5 text-red-500" />}
                label="Sair"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                danger
              />
            </>
          ) : (
            <>
              <MenuItem
                icon={<User className="w-5 h-5 text-violet-600" />}
                label="Entrar"
                sublabel="Aniversariante"
                onClick={() => handleNavigate("/login")}
              />
              <MenuItem
                icon={<Gift className="w-5 h-5 text-fuchsia-600" />}
                label="Cadastrar"
                sublabel="É grátis"
                onClick={() => handleNavigate("/cadastro")}
              />
              <div className="my-2 mx-3 border-t border-gray-100" />
              <MenuItem
                icon={<Building2 className="w-5 h-5 text-blue-600" />}
                label="Para Empresas"
                sublabel="Cadastre seu estabelecimento"
                onClick={() => handleNavigate("/seja-parceiro")}
              />
              <div className="my-2 mx-3 border-t border-gray-100" />
              <MenuItem
                icon={<HelpCircle className="w-5 h-5 text-gray-400" />}
                label="Como Funciona"
                onClick={() => handleNavigate("/como-funciona")}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
});
MobileMenu.displayName = "MobileMenu";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  danger?: boolean;
}

const MenuItem = ({ icon, label, sublabel, onClick, danger }: MenuItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left",
      danger ? "hover:bg-red-50" : "hover:bg-gray-50",
    )}
  >
    {icon}
    <div>
      <span className={cn("font-medium block", danger ? "text-red-600" : "text-gray-900")}>{label}</span>
      {sublabel && <span className="text-xs text-gray-500">{sublabel}</span>}
    </div>
  </button>
);

// =============================================================================
// MAIN
// =============================================================================

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header = memo(function Header({ children }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="bg-[#240046]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Row 1: Logo + Menu */}
          <div className="flex items-center justify-between h-12">
            <Logo />
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Row 2: Search (passado como children) */}
          {children && <div className="pb-3">{children}</div>}
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} onSignOut={signOut} />
    </>
  );
});

Header.displayName = "Header";
export default Header;
