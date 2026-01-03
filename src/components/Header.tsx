// =============================================================================
// HEADER.TSX - ANIVERSARIANTE VIP
// Design: Identidade roxa + Refinamento profissional
// =============================================================================

import { memo, useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, Gift, Building2, LogOut, HelpCircle, X, Heart } from "lucide-react";
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
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      // Prioridade: estabelecimento > admin > colaborador > aniversariante
      if (roles?.some((r) => r.role === "estabelecimento")) {
        setUserRole("estabelecimento");
      } else if (roles?.some((r) => r.role === "admin")) {
        setUserRole("admin");
      } else if (roles?.some((r) => r.role === "colaborador")) {
        setUserRole("colaborador");
      } else if (roles?.some((r) => r.role === "aniversariante")) {
        setUserRole("aniversariante");
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error("Erro ao buscar role:", error);
      setUserRole(null);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        // Usar setTimeout para evitar deadlock
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUserRole(null);
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  }, []);

  return { user, userRole, signOut };
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
  userRole: string | null;
  onSignOut: () => void;
}

const MobileMenu = memo(({ isOpen, onClose, user, userRole, onSignOut }: MobileMenuProps) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  // Definir cores e labels baseado na role
  const getRoleConfig = () => {
    switch (userRole) {
      case "estabelecimento":
        return { bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700", label: "Estabelecimento" };
      case "admin":
        return { bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700", label: "Administrador" };
      case "colaborador":
        return { bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700", label: "Colaborador" };
      case "aniversariante":
      default:
        return { bg: "bg-violet-50", badge: "bg-violet-100 text-violet-700", label: "Aniversariante" };
    }
  };

  const roleConfig = getRoleConfig();

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
              {/* User Info Card */}
              <div className={cn("px-3 py-3 mb-2 rounded-xl", roleConfig.bg)}>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.user_metadata?.full_name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                {userRole && (
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-wide mt-1 inline-block px-2 py-0.5 rounded-full",
                      roleConfig.badge
                    )}
                  >
                    {roleConfig.label}
                  </span>
                )}
              </div>

              {/* Menu para ESTABELECIMENTO */}
              {userRole === "estabelecimento" && (
                <MenuItem
                  icon={<Building2 className="w-5 h-5 text-blue-600" />}
                  label="Voltar ao Painel"
                  sublabel="Gerenciar meu estabelecimento"
                  onClick={() => handleNavigate("/area-estabelecimento")}
                />
              )}

              {/* Menu para ADMIN */}
              {userRole === "admin" && (
                <MenuItem
                  icon={<Building2 className="w-5 h-5 text-amber-600" />}
                  label="Painel Admin"
                  sublabel="Gerenciar plataforma"
                  onClick={() => handleNavigate("/admin")}
                />
              )}

              {/* Menu para COLABORADOR */}
              {userRole === "colaborador" && (
                <MenuItem
                  icon={<Building2 className="w-5 h-5 text-emerald-600" />}
                  label="Área do Colaborador"
                  sublabel="Gerenciar cadastros"
                  onClick={() => handleNavigate("/area-colaborador")}
                />
              )}

              {/* Menu para ANIVERSARIANTE */}
              {userRole === "aniversariante" && (
                <>
                  <MenuItem
                    icon={<Gift className="w-5 h-5 text-violet-600" />}
                    label="Minha Área"
                    sublabel="Meus dados e cupons"
                    onClick={() => handleNavigate("/area-aniversariante")}
                  />
                  <MenuItem
                    icon={<Heart className="w-5 h-5 text-pink-500" />}
                    label="Meus Favoritos"
                    onClick={() => handleNavigate("/favoritos")}
                  />
                </>
              )}

              {/* Fallback: usuário logado sem role definida */}
              {!userRole && (
                <MenuItem
                  icon={<User className="w-5 h-5 text-gray-600" />}
                  label="Meu Perfil"
                  sublabel="Escolher tipo de conta"
                  onClick={() => handleNavigate("/selecionar-perfil")}
                />
              )}

              <div className="my-2 mx-3 border-t border-gray-100" />

              {/* Logout - sempre visível */}
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
                onClick={() => handleNavigate("/como-funciona")}
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

// User info com nome e badge
const UserInfo = memo(({ user, role }: { user: AuthUser | null; role: string | null }) => {
  if (!user) return null;

  const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
    estabelecimento: { bg: "bg-blue-500/20", text: "text-blue-200", label: "Estab." },
    admin: { bg: "bg-amber-500/20", text: "text-amber-200", label: "Admin" },
    colaborador: { bg: "bg-emerald-500/20", text: "text-emerald-200", label: "Colab." },
    aniversariante: { bg: "bg-violet-400/20", text: "text-violet-200", label: "Aniv." },
  };

  const config = role ? roleConfig[role] || roleConfig.aniversariante : null;
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";

  return (
    <div className="flex items-center gap-2">
      {/* Nome - visível apenas em desktop */}
      <span className="hidden sm:block text-xs text-white/80 font-medium truncate max-w-[120px]">
        {displayName}
      </span>
      {/* Badge de role */}
      {config && (
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", config.bg, config.text)}>
          {config.label}
        </span>
      )}
    </div>
  );
});
UserInfo.displayName = "UserInfo";

export const Header = memo(function Header({ children }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();

  return (
    <>
      <header className="bg-[#240046]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Row 1: Logo + Menu */}
          <div className="flex items-center justify-between h-12">
            <Logo />
            <div className="flex items-center gap-2">
              <UserInfo user={user} role={userRole} />
              <button
                onClick={() => setMenuOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Row 2: Search (passado como children) */}
          {children && <div className="pb-3">{children}</div>}
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} userRole={userRole} onSignOut={signOut} />
    </>
  );
});

Header.displayName = "Header";
export default Header;
