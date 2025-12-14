import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PersonalGreeting } from "@/components/PersonalGreeting";
import { BirthdayBanner } from "@/components/BirthdayBanner";
import { useBirthdayTheme } from "@/hooks/useBirthdayTheme";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface UserData {
  name: string | null;
  role: string | null;
  birthDate: string | null;
}

const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

const useUserSession = () => {
  const [userData, setUserData] = useState<UserData>({
    name: null,
    role: null,
    birthDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = useCallback(async () => {
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUserData({ name: null, role: null, birthDate: null });
        return;
      }

      const [profileResult, rolesResult] = await Promise.all([
        supabase.from("profiles").select("nome").eq("id", session.user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", session.user.id),
      ]);

      const name = profileResult.data?.nome || session.user.email?.split("@")[0] || "Usuário";
      const role = rolesResult.data?.[0]?.role || null;

      let birthDate: string | null = null;

      if (role === "aniversariante") {
        const { data: aniversarianteData } = await supabase
          .from("aniversariantes")
          .select("data_nascimento")
          .eq("id", session.user.id)
          .maybeSingle();

        birthDate = aniversarianteData?.data_nascimento || null;
      }

      setUserData({ name, role, birthDate });
    } catch (error) {
      console.error("[Header] Erro ao verificar usuário:", error);
      setUserData({ name: null, role: null, birthDate: null });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, [checkUser]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUserData({ name: null, role: null, birthDate: null });
    toast.success("Logout realizado com sucesso!");
  }, []);

  return { ...userData, isLoading, logout };
};

const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive, containerRef]);
};

export const Header = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useState<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { name: userName, role: userRole, birthDate: dataNascimento, logout } = useUserSession();
  const { isBirthday } = useBirthdayTheme(dataNascimento);
  const { isVisible } = useScrollHeader({ threshold: 80, sensitivity: 8 });
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = useCallback(async () => {
    if (navigator.vibrate) navigator.vibrate(10);
    await logout();
    navigate("/");
    setMobileMenuOpen(false);
  }, [logout, navigate]);

  const handleToggleMenu = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleNavigate = useCallback(
    (path: string) => {
      if (navigator.vibrate) navigator.vibrate(10);
      navigate(path);
      setMobileMenuOpen(false);
    },
    [navigate],
  );

  const areaLink = useMemo(() => {
    if (userRole === "aniversariante") return "/area-aniversariante";
    if (userRole === "estabelecimento") return "/area-estabelecimento";
    if (userRole === "admin") return "/area-colaborador";
    return "/";
  }, [userRole]);

  const userInitials = useMemo(() => {
    return userName?.slice(0, 2).toUpperCase() || "??";
  }, [userName]);

  const firstName = useMemo(() => {
    return userName?.split(" ")[0] || "";
  }, [userName]);

  const headerTop = useMemo(() => {
    return isBirthday && userName ? 48 : 0;
  }, [isBirthday, userName]);

  return (
    <>
      {isBirthday && userName && <BirthdayBanner firstName={firstName} />}

      <header
        className={cn(
          "fixed left-0 right-0 z-50 bg-[#240046] py-3",
          !reducedMotion && "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isMobile && !isVisible ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
        )}
        style={{ top: headerTop }}
        role="banner"
      >
        <nav
          className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20"
          role="navigation"
          aria-label="Navegação principal"
        >
          <div className="flex items-center justify-between h-14">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 group",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#240046] rounded-lg",
              )}
              aria-label="Aniversariante VIP - Página inicial"
            >
              <div
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white/10 flex-shrink-0",
                  !reducedMotion &&
                    "transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/20",
                )}
              >
                <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
              </div>
              <div
                className={cn(
                  "flex items-center gap-0.5 sm:gap-1 font-display font-extrabold text-sm sm:text-base lg:text-lg tracking-tight",
                  !reducedMotion && "transition-transform duration-300 group-hover:scale-105",
                )}
              >
                <span className="bg-gradient-to-r from-[#9D4EDD] to-[#C77DFF] bg-clip-text text-transparent">
                  ANIVERSARIANTE
                </span>
                <span className="bg-gradient-to-r from-[#C77DFF] to-[#22D3EE] bg-clip-text text-transparent">VIP</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center justify-center flex-1 gap-1 min-w-0 mx-4">
              <NavLink
                to="/como-funciona"
                className={cn(
                  "relative text-sm font-medium text-white px-4 py-2 rounded-lg group",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  !reducedMotion && "transition-colors duration-200 hover:text-white",
                )}
                activeClassName="text-white"
              >
                Como Funciona
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-4 right-4 h-0.5 bg-white scale-x-0 origin-left",
                    !reducedMotion && "transition-transform duration-300 group-hover:scale-x-100",
                  )}
                  aria-hidden="true"
                />
              </NavLink>
              <NavLink
                to="/seja-parceiro"
                className={cn(
                  "relative text-sm font-medium text-white px-4 py-2 rounded-lg group",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  !reducedMotion && "transition-colors duration-200 hover:text-white",
                )}
                activeClassName="text-white"
              >
                Seja Parceiro
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-4 right-4 h-0.5 bg-white scale-x-0 origin-left",
                    !reducedMotion && "transition-transform duration-300 group-hover:scale-x-100",
                  )}
                  aria-hidden="true"
                />
              </NavLink>
            </div>

            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              {userName ? (
                <>
                  <div className="hidden xl:block">
                    <PersonalGreeting userName={userName} />
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate(areaLink)}
                    className={cn(
                      "flex items-center gap-2 px-3 h-10",
                      !reducedMotion && "transition-all duration-200 hover:bg-white/10",
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 p-0.5">
                      <div className="w-full h-full rounded-full bg-[#240046] flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{userInitials}</span>
                      </div>
                    </div>
                    <span className="text-white text-sm hidden sm:block">{firstName}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    aria-label="Sair da conta"
                    className={cn("text-white h-9", !reducedMotion && "transition-all duration-200 hover:bg-white/10")}
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={cn(
                      "text-white px-4 py-2 text-sm font-medium rounded-lg",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                      !reducedMotion && "transition-colors duration-200 hover:text-white/80",
                    )}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/cadastro"
                    className={cn(
                      "relative bg-white text-[#240046] font-semibold px-6 py-2.5 rounded-full text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#240046]",
                      !reducedMotion && "transition-all duration-300 hover:bg-white/90 hover:scale-105 active:scale-95",
                    )}
                  >
                    Cadastro Gratuito
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={handleToggleMenu}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className={cn(
                "lg:hidden p-2.5 -mr-2 text-white rounded-xl min-w-[44px] min-h-[44px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                !reducedMotion && "transition-all duration-200 hover:bg-white/10 active:scale-95",
              )}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
              className={cn(
                "lg:hidden mt-4 p-4 bg-[#1a0033] rounded-2xl border border-white/10 shadow-2xl shadow-black/40",
                !reducedMotion && "animate-in fade-in slide-in-from-top-2 duration-200",
              )}
            >
              <div className="flex flex-col gap-1">
                <NavLink
                  to="/como-funciona"
                  onClick={handleCloseMenu}
                  className={cn(
                    "text-sm font-medium text-white/80 py-3 px-4 rounded-xl min-h-[44px] flex items-center",
                    !reducedMotion && "transition-all duration-200 hover:text-white hover:bg-white/5",
                  )}
                  activeClassName="text-white bg-white/5"
                >
                  Como Funciona
                </NavLink>
                <NavLink
                  to="/seja-parceiro"
                  onClick={handleCloseMenu}
                  className={cn(
                    "text-sm font-medium text-white/80 py-3 px-4 rounded-xl min-h-[44px] flex items-center",
                    !reducedMotion && "transition-all duration-200 hover:text-white hover:bg-white/5",
                  )}
                  activeClassName="text-white bg-white/5"
                >
                  Seja Parceiro
                </NavLink>

                <div className="h-px bg-white/10 my-3" aria-hidden="true" />

                {userName ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigate(areaLink)}
                      className={cn(
                        "justify-start text-white py-3 h-auto min-h-[44px]",
                        !reducedMotion && "hover:bg-white/10",
                      )}
                    >
                      <User className="w-4 h-4 mr-2" aria-hidden="true" />
                      Minha Área ({firstName})
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className={cn(
                        "justify-start text-white/70 py-3 h-auto min-h-[44px]",
                        !reducedMotion && "hover:text-white hover:bg-white/10",
                      )}
                    >
                      <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={handleCloseMenu}
                      className={cn(
                        "text-white/80 py-3 px-4 rounded-xl text-sm font-medium min-h-[44px] flex items-center",
                        !reducedMotion && "transition-all duration-200 hover:text-white hover:bg-white/5",
                      )}
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/cadastro"
                      onClick={handleCloseMenu}
                      className={cn(
                        "mt-2 bg-white text-[#240046] font-semibold py-3 px-6 rounded-full text-center text-sm min-h-[44px] flex items-center justify-center",
                        !reducedMotion && "transition-all duration-300 active:scale-95",
                      )}
                    >
                      Cadastro Gratuito
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
});

Header.displayName = "Header";
