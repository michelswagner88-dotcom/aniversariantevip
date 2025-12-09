import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PersonalGreeting } from "@/components/PersonalGreeting";
import { BirthdayBanner } from "@/components/BirthdayBanner";
import { useBirthdayTheme } from "@/hooks/useBirthdayTheme";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dataNascimento, setDataNascimento] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isBirthday } = useBirthdayTheme(dataNascimento);
  const { isVisible } = useScrollHeader({ threshold: 80, sensitivity: 8 });
  const isMobile = useIsMobile();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', session.user.id)
        .single();
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);
      setUserName(profile?.nome || session.user.email?.split('@')[0] || 'Usuário');
      setUserRole(roles?.[0]?.role || null);
      
      if (roles?.[0]?.role === 'aniversariante') {
        const { data: aniversarianteData } = await supabase
          .from('aniversariantes')
          .select('data_nascimento')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (aniversarianteData?.data_nascimento) {
          setDataNascimento(aniversarianteData.data_nascimento);
        }
      }
    } else {
      setUserName(null);
      setUserRole(null);
      setDataNascimento(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const getAreaLink = () => {
    if (userRole === 'aniversariante') return '/area-aniversariante';
    if (userRole === 'estabelecimento') return '/area-estabelecimento';
    if (userRole === 'admin') return '/area-colaborador';
    return '/';
  };

  return (
    <>
      {/* Banner de aniversário */}
      {isBirthday && userName && (
        <BirthdayBanner firstName={userName.split(' ')[0]} />
      )}
      
      <header 
        className={`
          fixed left-0 right-0 z-50 
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isMobile && !isVisible ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
          bg-[#240046] py-3
        `}
        style={{ top: isBirthday && userName ? '48px' : '0' }}
      >
        <nav className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
              <div 
                className="
                  w-10 h-10 
                  rounded-xl 
                  flex items-center justify-center
                  bg-white/10
                  transition-all duration-300
                  group-hover:scale-110 group-hover:rotate-6
                  group-hover:bg-white/20
                "
              >
              <Gift className="w-5 h-5 text-white" />
            </div>
            
            <span className="hidden sm:flex items-center gap-1 font-display font-extrabold text-base lg:text-lg tracking-tight transition-transform duration-300 group-hover:scale-105">
              <span className="text-white">
                ANIVERSARIANTE
              </span>
              <span className="text-white/80">
                VIP
              </span>
            </span>
          </Link>

          {/* Links Centro - Desktop */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-1 min-w-0 mx-4">
            <NavLink 
              to="/como-funciona" 
              className="
                relative text-sm font-medium text-white/80 
                hover:text-white transition-colors duration-200 
                px-4 py-2 group
              "
              activeClassName="text-white"
            >
              Como Funciona
              <span className="
                absolute -bottom-0.5 left-4 right-4 h-0.5 
                bg-white
                scale-x-0 group-hover:scale-x-100
                transition-transform duration-300 origin-left
              "/>
            </NavLink>
            <NavLink 
              to="/seja-parceiro" 
              className="
                relative text-sm font-medium text-white/80 
                hover:text-white transition-colors duration-200 
                px-4 py-2 group
              "
              activeClassName="text-white"
            >
              Seja Parceiro
              <span className="
                absolute -bottom-0.5 left-4 right-4 h-0.5 
                bg-white
                scale-x-0 group-hover:scale-x-100
                transition-transform duration-300 origin-left
              "/>
            </NavLink>
          </div>

          {/* Botões Direita - Desktop */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            {userName ? (
              <>
                <div className="hidden xl:block">
                  <PersonalGreeting userName={userName} />
                </div>
                
                <Button
                  variant="ghost"
                  onClick={() => navigate(getAreaLink())}
                  className="flex items-center gap-2 px-3 h-10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 p-0.5">
                    <div className="w-full h-full rounded-full bg-[#240046] flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {userName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span className="text-white text-sm hidden sm:block">
                    {userName.split(' ')[0]}
                  </span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:bg-white/10 h-9 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/selecionar-perfil"
                  className="
                    text-white/80 hover:text-white 
                    transition-colors duration-200
                    px-4 py-2 text-sm font-medium
                  "
                >
                  Entrar
                </Link>
                
                {/* Botão CTA branco */}
                <Link
                  to="/auth"
                  className="
                    relative
                    bg-white
                    text-[#240046] font-semibold
                    px-6 py-2.5
                    rounded-full
                    transition-all duration-300
                    hover:bg-white/90
                    hover:scale-105
                    active:scale-95
                    text-sm
                  "
                >
                  Cadastro Gratuito
                </Link>
              </>
            )}
          </div>

          {/* Menu Hambúrguer - Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 -mr-2 text-white hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
            style={{ minWidth: '44px', minHeight: '44px' }}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="
            lg:hidden 
            mt-4 
            p-4 
            bg-[#1a0033]
            rounded-2xl
            border border-white/10
            shadow-2xl shadow-black/40
            animate-fade-in
          ">
            <div className="flex flex-col gap-1">
              <NavLink
                to="/como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-white/80 hover:text-white py-3 px-4 hover:bg-white/5 rounded-xl transition-all duration-200"
                activeClassName="text-white bg-white/5"
              >
                Como Funciona
              </NavLink>
              <NavLink
                to="/seja-parceiro"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-white/80 hover:text-white py-3 px-4 hover:bg-white/5 rounded-xl transition-all duration-200"
                activeClassName="text-white bg-white/5"
              >
                Seja Parceiro
              </NavLink>
              
              <div className="h-px bg-white/10 my-3" />
              
              {userName ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate(getAreaLink());
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-white hover:bg-white/10 py-3"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {userName}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-white hover:bg-white/10 py-3"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    to="/selecionar-perfil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white/80 hover:text-white py-3 px-4 hover:bg-white/5 rounded-xl transition-all duration-200"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="
                      mt-2
                      bg-white
                      text-[#240046] font-semibold
                      py-3 px-6 rounded-full text-center
                      transition-all duration-300
                      active:scale-95
                    "
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
};
```

---

## O QUE MUDOU

| Elemento | Antes | Depois |
|----------|-------|--------|
| **Fundo header** | Transparente/glassmorphism | `bg-[#240046]` (roxo sólido) |
| **Logo texto** | Gradiente colorido | `text-white` |
| **Links menu** | `text-slate-300` | `text-white/80` |
| **Underline hover** | Gradiente roxo | `bg-white` |
| **Botão CTA** | Gradiente roxo | `bg-white text-[#240046]` |
| **Menu mobile** | `bg-slate-900` | `bg-[#1a0033]` (roxo escuro) |
| **Ícone logo** | Gradiente | `bg-white/10` |

---

## RESULTADO VISUAL
```
┌─────────────────────────────────────────┐
│  ████████████ ROXO #240046 ████████████ │
│  [🎁] ANIVERSARIANTE VIP    Entrar  [Cadastro] │
│         (branco)            (branco) (botão branco) │
└─────────────────────────────────────────┘