import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/como-funciona", label: "Como Funciona" },
    { href: "/seja-parceiro", label: "Seja Parceiro" },
    { href: "/faq", label: "FAQ" },
  ];

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
    <header className="fixed top-6 left-0 right-0 z-50 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Floating Pill Menu - Desktop */}
        <nav className="hidden lg:flex items-center justify-between px-6 py-4 rounded-full bg-white/5 backdrop-blur-xl border border-violet-500/20 shadow-2xl shadow-violet-500/5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              ANIVERSARIANTE VIP
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-violet-600 after:via-fuchsia-500 after:to-pink-500 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {userName ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-sm gap-2 text-slate-300 hover:text-white hover:bg-violet-500/10">
                    <User className="h-4 w-4" />
                    {userName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/50">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getAreaLink()} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Minha Área
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-sm text-slate-300 hover:text-white hover:bg-violet-500/10">
                  <Link to="/login/aniversariante">Login</Link>
                </Button>
                <Button size="sm" asChild className="text-sm bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 text-white">
                  <Link to="/cadastro/aniversariante">Cadastre-se</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 rounded-full bg-white/5 backdrop-blur-xl border border-violet-500/20 shadow-2xl shadow-violet-500/5">
          <Link to="/" className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            ANIVERSARIANTE VIP
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground hover:bg-white/5 rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-violet-500/20 shadow-2xl shadow-violet-500/5 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors py-2 px-3 hover:bg-violet-500/10 rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="h-px bg-border/50 my-2" />
              
              {userName ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Olá, {userName}
                  </div>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="w-full justify-start text-sm text-slate-300 hover:text-white hover:bg-violet-500/10"
                  >
                    <Link to={getAreaLink()} onClick={() => setMobileMenuOpen(false)}>
                      <User className="mr-2 h-4 w-4" />
                      Minha Área
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-white/5"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="w-full justify-start text-sm text-slate-300 hover:text-white hover:bg-violet-500/10">
                    <Link to="/login/aniversariante" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start text-sm bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 text-white">
                    <Link to="/cadastro/aniversariante" onClick={() => setMobileMenuOpen(false)}>
                      Cadastre-se
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
