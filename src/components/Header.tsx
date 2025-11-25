import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

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
    } else {
      setUserName(null);
      setUserRole(null);
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Esquerda */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-display font-extrabold text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 tracking-tight">
              ANIVERSARIANTE VIP
            </span>
          </Link>

          {/* Links Centro - Desktop */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-8">
            <NavLink 
              to="/" 
              end
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500"
            >
              Início
            </NavLink>
            <NavLink 
              to="/explorar" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500"
            >
              Explorar
            </NavLink>
            <NavLink 
              to="/como-funciona" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500"
            >
              Como Funciona
            </NavLink>
          </div>

          {/* Botões Direita - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {userName ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(getAreaLink())}
                  className="text-white hover:bg-white/10"
                >
                  <User className="w-4 h-4 mr-2" />
                  {userName}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-white hover:bg-white/10"
                >
                  <Link to="/seja-parceiro">Seja Parceiro</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 text-white rounded-full px-6"
                >
                  <Link to="/selecionar-perfil">Entrar</Link>
                </Button>
              </>
            )}
          </div>

          {/* Menu Hambúrguer - Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900/95 backdrop-blur-xl rounded-2xl mt-2 p-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              <NavLink
                to="/"
                end
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white py-3 px-4 hover:bg-white/10 rounded-lg transition-colors"
                activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500"
              >
                Início
              </NavLink>
              <NavLink
                to="/explorar"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white py-3 px-4 hover:bg-white/10 rounded-lg transition-colors"
                activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500"
              >
                Explorar
              </NavLink>
              <NavLink
                to="/como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white py-3 px-4 hover:bg-white/10 rounded-lg transition-colors"
                activeClassName="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500"
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
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                    className="justify-start bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white"
                  >
                    <Link to="/selecionar-perfil">Entrar</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
