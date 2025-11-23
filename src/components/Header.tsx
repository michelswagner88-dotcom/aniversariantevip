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
      // Buscar perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', session.user.id)
        .single();

      // Buscar role
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        {/* Barra Superior - Logo + Áreas de Acesso */}
        <div className="flex items-center justify-between h-14 border-b border-border/50">
          {/* Logo Marquee */}
          <Link to="/" className="group flex items-center flex-1 overflow-hidden relative max-w-[calc(100%-180px)] lg:max-w-[calc(100%-420px)]">
            <div className="flex animate-marquee group-hover:pause whitespace-nowrap">
              <span className="font-modern font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-wider uppercase bg-gradient-to-r from-vip-gold via-vip-gold-light to-vip-gold bg-clip-text text-transparent px-8">
                ANIVERSARIANTE VIP
              </span>
              <span className="font-modern font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-wider uppercase bg-gradient-to-r from-vip-gold via-vip-gold-light to-vip-gold bg-clip-text text-transparent px-8">
                ANIVERSARIANTE VIP
              </span>
              <span className="font-modern font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-wider uppercase bg-gradient-to-r from-vip-gold via-vip-gold-light to-vip-gold bg-clip-text text-transparent px-8">
                ANIVERSARIANTE VIP
              </span>
            </div>
          </Link>

          {/* Desktop - Áreas de Acesso + Theme Toggle */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            
            {userName ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-8 gap-2">
                    <User className="h-3 w-3" />
                    Bem-vindo, {userName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                  <Link to="/login/aniversariante">Área do Aniversariante</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                  <Link to="/login/estabelecimento">Área do Estabelecimento</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                  <Link to="/login/colaborador">Área do Colaborador</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button + Theme Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Menu de Navegação - Desktop */}
        <nav className="hidden lg:flex items-center justify-center gap-6 h-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-xs font-medium text-foreground/80 hover:text-primary transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-[500px] pb-4" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-2 pt-3">
            {/* Navegação Principal */}
            <div className="pb-2 border-b border-border/50">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs font-medium text-foreground/80 hover:text-primary transition-colors py-1.5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Áreas de Acesso / User Info */}
            <div className="flex flex-col gap-1.5">
              {userName ? (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                    Bem-vindo, {userName}
                  </div>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="w-full justify-start h-8 text-xs"
                  >
                    <Link to={getAreaLink()} onClick={() => setMobileMenuOpen(false)}>
                      <User className="mr-2 h-3 w-3" />
                      Minha Área
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start h-8 text-xs text-destructive hover:text-destructive"
                  >
                    <LogOut className="mr-2 h-3 w-3" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="w-full justify-start h-8 text-xs">
                    <Link to="/login/aniversariante" onClick={() => setMobileMenuOpen(false)}>
                      Área do Aniversariante
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="w-full justify-start h-8 text-xs">
                    <Link to="/login/estabelecimento" onClick={() => setMobileMenuOpen(false)}>
                      Área do Estabelecimento
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="w-full justify-start h-8 text-xs">
                    <Link to="/login/colaborador" onClick={() => setMobileMenuOpen(false)}>
                      Área do Colaborador
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
