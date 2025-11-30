import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PersonalGreeting } from "@/components/PersonalGreeting";
import { BirthdayBanner } from "@/components/BirthdayBanner";
import { useBirthdayTheme } from "@/hooks/useBirthdayTheme";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dataNascimento, setDataNascimento] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isBirthday } = useBirthdayTheme(dataNascimento);

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
      
      // Buscar data de nascimento para banner de aniversário
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
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.08]" style={{ top: isBirthday && userName ? '48px' : '0' }}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Esquerda */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-display font-extrabold text-base lg:text-lg text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 tracking-tight">
              ANIVERSARIANTE VIP
            </span>
          </Link>

          {/* Links Centro - Desktop Premium */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-0.5 min-w-0 mx-2">
            <NavLink 
              to="/" 
              end
              className="text-[11px] font-medium text-slate-300 hover:text-white transition-all duration-180 px-2 py-2 rounded-lg hover:bg-white/5 whitespace-nowrap"
              activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-white/5"
            >
              Início
            </NavLink>
            <NavLink 
              to="/explorar" 
              className="text-[11px] font-medium text-slate-300 hover:text-white transition-all duration-180 px-2 py-2 rounded-lg hover:bg-white/5 whitespace-nowrap"
              activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-white/5"
            >
              Explorar
            </NavLink>
            <NavLink 
              to="/feed" 
              className="text-[11px] font-medium text-slate-300 hover:text-white transition-all duration-180 px-2 py-2 rounded-lg hover:bg-white/5 whitespace-nowrap"
              activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-white/5"
            >
              Feed
            </NavLink>
            <NavLink 
              to="/como-funciona" 
              className="text-[11px] font-medium text-slate-300 hover:text-white transition-all duration-180 px-2 py-2 rounded-lg hover:bg-white/5 whitespace-nowrap"
              activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-white/5"
            >
              Como Funciona
            </NavLink>
          </div>

          {/* Botões Direita - Desktop */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {userName ? (
              <>
                {/* Greeting - apenas desktop grande */}
                <div className="hidden xl:block">
                  <PersonalGreeting userName={userName} />
                </div>
                
                {/* Avatar + Nome */}
                <Button
                  variant="ghost"
                  onClick={() => navigate(getAreaLink())}
                  className="flex items-center gap-2 px-2 h-10 hover:bg-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
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
                  className="text-white hover:bg-white/10 h-8"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-white hover:bg-white/10 whitespace-nowrap text-[11px] px-2 h-8"
                >
                  <Link to="/seja-parceiro">Parceiro</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-white hover:bg-white/10 whitespace-nowrap text-[11px] px-2 h-8"
                >
                  <Link to="/selecionar-perfil">Entrar</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 text-white rounded-full px-3 h-8 font-semibold whitespace-nowrap text-[11px]"
                >
                  <Link to="/auth">Cadastro Gratuito</Link>
                </Button>
              </>
            )}
          </div>

          {/* Menu Hambúrguer - Mobile Premium (44px hit area) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 -mr-2 text-white hover:bg-white/10 rounded-xl transition-all duration-180 active:scale-95"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu Mobile Premium */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-4 top-20 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-3 shadow-premium-lg border border-white/10 animate-slide-in-right">
            <div className="flex flex-col gap-1">
              <NavLink
                to="/"
                end
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white py-3 px-4 hover:bg-white/5 rounded-xl transition-all duration-180 active:scale-98"
                activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-white/5"
              >
                Início
              </NavLink>
              <NavLink
                to="/explorar"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white py-3 px-4 hover:bg-white/5 rounded-xl transition-all duration-180 active:scale-98"
                activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-white/5"
              >
                Explorar
              </NavLink>
              <NavLink
                to="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white py-3 px-4 hover:bg-white/5 rounded-xl transition-all duration-180 active:scale-98"
                activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-white/5"
              >
                Feed
              </NavLink>
              <NavLink
                to="/como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white py-3 px-4 hover:bg-white/5 rounded-xl transition-all duration-180 active:scale-98"
                activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-white/5"
              >
                Como Funciona
              </NavLink>
              
              <div className="h-px bg-slate-700 my-2" />
              
              {userName ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate(getAreaLink());
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-white hover:bg-white/10"
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
                    className="justify-start text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                    className="justify-start text-white hover:bg-white/10"
                  >
                    <Link to="/seja-parceiro">Seja Parceiro</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                    className="justify-start text-white hover:bg-white/10"
                  >
                    <Link to="/selecionar-perfil">Entrar</Link>
                  </Button>
                  <Button
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                    className="justify-start bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white font-semibold"
                  >
                    <Link to="/auth">Cadastro Gratuito</Link>
                  </Button>
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
