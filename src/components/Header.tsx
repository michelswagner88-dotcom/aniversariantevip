// src/components/Header.tsx
import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Gift, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PersonalGreeting } from "@/components/PersonalGreeting";
import { BirthdayBanner } from "@/components/BirthdayBanner";
import { useBirthdayTheme } from "@/hooks/useBirthdayTheme";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// =============================================================================
// CONSTANTS
// =============================================================================

const BIRTHDAY_BANNER_HEIGHT = 48;
const SCROLL_THRESHOLD = 100;

// =============================================================================
// HOOKS
// =============================================================================

const useScrollState = (threshold: number = SCROLL_THRESHOLD) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
};

const useUserSession = () => {
  const [userData, setUserData] = useState<{
    name: string | null;
    role: string | null;
    birthDate: string | null;
  }>({
    name: null,
    role: null,
    birthDate: null,
  });

  const checkUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUserData({ name: null, role: null, birthDate: null });
        return;
      }

      const [profileResult, rolesResult] = await Promise.allSettled([
        supabase.from("profiles").select("nome").eq("id", session.user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", session.user.id),
      ]);

      const profileData = profileResult.status === "fulfilled" ? profileResult.value.data : null;
      const rolesData = rolesResult.status === "fulfilled" ? rolesResult.value.data : null;

      const name = profileData?.nome || session.user.email?.split("@")[0] || "Usuario";
      const role = rolesData?.[0]?.role || null;

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
      console.error("[Header] Erro:", error);
      setUserData({ name: null, role: null, birthDate: null });
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

  return { ...userData, logout };
};

// =============================================================================
// SEARCH PILL
// =============================================================================

const SearchPill = memo(({ onClick, className }: { onClick?: () => void; className?: string }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Abrir busca"
      className={cn(
        "flex items-center gap-2",
        "px-4 py-2.5 rounded-full",
        "bg-gray-100 hover:bg-gray-200",
        "text-gray-500 text-sm",
        "transition-colors duration-200",
        "active:scale-[0.98]",
        "min-h-[44px]",
        className,
      )}
    >
      <Search className="w-4 h-4 text-gray-400" />
      <span className="truncate">Buscar estabelecimentos...</span>
    </button>
  );
});

SearchPill.displayName = "SearchPill";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Header = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { name: userName, role: userRole, birthDate: dataNascimento, logout } = useUserSession();
  const { isBirthday } = useBirthdayTheme(dataNascimento);
  const isMobile = useIsMobile();
  const isScrolled = useScrollState(SCROLL_THRESHOLD);

  // DEBUG - remover depois
  console.log("[Header v3.0] isScrolled:", isScrolled, "| isMobile:", isMobile);

  // Lock body scroll when menu is open
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

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  // Handlers
  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
    setMobileMenuOpen(false);
  }, [logout, navigate]);

  const handleSearchClick = useCallback(() => {
    const searchInput = document.querySelector("[data-search-input]") as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setMobileMenuOpen(false);
  }, []);

  const areaLink = useMemo(() => {
    if (userRole === "aniversariante") return "/area-aniversariante";
    if (userRole === "estabelecimento") return "/area-estabelecimento";
    if (userRole === "admin") return "/area-colaborador";
    return "/";
  }, [userRole]);

  const userInitials = userName?.slice(0, 2).toUpperCase() || "??";
  const firstName = userName?.split(" ")[0] || "";
  const headerTop = isBirthday && userName ? BIRTHDAY_BANNER_HEIGHT : 0;

  return (
    <>
      {isBirthday && userName && <BirthdayBanner firstName={firstName} />}

      <header
        className={cn(
          "fixed left-0 right-0 z-50",
          "transition-all duration-300 ease-out",
          isScrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm py-2"
            : "bg-transparent py-3",
        )}
        style={{
          top: headerTop,
          paddingTop: `calc(0.5rem + env(safe-area-inset-top, 0px))`,
        }}
        role="banner"
      >
        <nav className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between h-12 lg:h-14">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group shrink-0"
              aria-label="Aniversariante VIP - Pagina inicial"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                  isScrolled ? "bg-[#240046]/10" : "bg-white/10",
                )}
              >
                <Gift className={cn("w-5 h-5", isScrolled ? "text-[#240046]" : "text-white")} />
              </div>
              <div className="hidden sm:flex items-center gap-0.5 font-display font-extrabold text-sm lg:text-base tracking-tight">
                {isScrolled ? (
                  <>
                    <span className="text-[#240046]">ANIVERSARIANTE</span>
                    <span className="text-[#7C3AED]">VIP</span>
                  </>
                ) : (
                  <>
                    <span className="bg-gradient-to-r from-[#9D4EDD] to-[#C77DFF] bg-clip-text text-transparent">
                      ANIVERSARIANTE
                    </span>
                    <span className="bg-gradient-to-r from-[#C77DFF] to-[#22D3EE] bg-clip-text text-transparent">
                      VIP
                    </span>
                  </>
                )}
              </div>
            </Link>

            {/* Search Pill - Desktop (so aparece quando scrolled) */}
            {isScrolled && (
              <div className="hidden lg:flex flex-1 justify-center mx-8">
                <SearchPill onClick={handleSearchClick} className="w-full max-w-md" />
              </div>
            )}

            {/* Search Pill - Mobile (so aparece quando scrolled) */}
            {isScrolled && isMobile && (
              <div className="flex-1 mx-3">
                <SearchPill onClick={handleSearchClick} className="w-full" />
              </div>
            )}

            {/* Desktop User Area */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              {userName ? (
                <>
                  {!isScrolled && (
                    <div className="hidden xl:block">
                      <PersonalGreeting userName={userName} />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => navigate(areaLink)}
                    className={cn(
                      "flex items-center gap-2 px-3 h-10 rounded-full transition-all duration-200",
                      isScrolled ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/10 text-white",
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full p-0.5", isScrolled ? "bg-[#240046]/20" : "bg-white/20")}>
                      <div className="w-full h-full rounded-full bg-[#240046] flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{userInitials}</span>
                      </div>
                    </div>
                    {!isScrolled && <span className="text-sm hidden xl:block">{firstName}</span>}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    aria-label="Sair da conta"
                    className={cn(
                      "h-9 rounded-full transition-all duration-200",
                      isScrolled ? "text-gray-600 hover:bg-gray-100" : "text-white hover:bg-white/10",
                    )}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200",
                      isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:text-white/80",
                    )}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/cadastro"
                    className={cn(
                      "font-semibold px-5 py-2.5 rounded-full text-sm transition-all duration-300 hover:scale-105 active:scale-95",
                      isScrolled
                        ? "bg-[#240046] text-white hover:bg-[#3C096C]"
                        : "bg-white text-[#240046] hover:bg-white/90",
                    )}
                  >
                    Cadastro Gratuito
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileMenuOpen}
              className={cn(
                "lg:hidden p-2.5 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95",
                isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10",
              )}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className={cn(
                "lg:hidden mt-4 p-4 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200",
                isScrolled ? "bg-white border-gray-200" : "bg-[#1a0033] border-white/10",
              )}
            >
              <div className="flex flex-col gap-1">
                <NavLink
                  to="/como-funciona"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium py-3 px-4 rounded-xl min-h-[44px] flex items-center transition-all duration-200",
                    isScrolled ? "text-gray-600 hover:bg-gray-100" : "text-white/80 hover:bg-white/5",
                  )}
                  activeClassName={isScrolled ? "text-[#240046] bg-gray-100" : "text-white bg-white/5"}
                >
                  Como Funciona
                </NavLink>
                <NavLink
                  to="/seja-parceiro"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium py-3 px-4 rounded-xl min-h-[44px] flex items-center transition-all duration-200",
                    isScrolled ? "text-gray-600 hover:bg-gray-100" : "text-white/80 hover:bg-white/5",
                  )}
                  activeClassName={isScrolled ? "text-[#240046] bg-gray-100" : "text-white bg-white/5"}
                >
                  Seja Parceiro
                </NavLink>

                <div className={cn("h-px my-3", isScrolled ? "bg-gray-200" : "bg-white/10")} />

                {userName ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate(areaLink);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "justify-start py-3 h-auto min-h-[44px] rounded-xl",
                        isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10",
                      )}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Minha Area ({firstName})
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className={cn(
                        "justify-start py-3 h-auto min-h-[44px] rounded-xl",
                        isScrolled ? "text-gray-500 hover:bg-gray-100" : "text-white/70 hover:bg-white/10",
                      )}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "py-3 px-4 rounded-xl text-sm font-medium min-h-[44px] flex items-center transition-all duration-200",
                        isScrolled ? "text-gray-600 hover:bg-gray-100" : "text-white/80 hover:bg-white/5",
                      )}
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/cadastro"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "mt-2 font-semibold py-3 px-6 rounded-full text-center text-sm min-h-[44px] flex items-center justify-center transition-all duration-300 active:scale-95",
                        isScrolled ? "bg-[#240046] text-white" : "bg-white text-[#240046]",
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
