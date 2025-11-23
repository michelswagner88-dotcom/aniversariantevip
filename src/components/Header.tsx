import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/como-funciona", label: "Como Funciona" },
    { href: "/seja-parceiro", label: "Seja Parceiro" },
    { href: "/planos", label: "Planos" },
    { href: "/meus-cupons", label: "Meus Cupons" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        {/* Barra Superior - Logo + Áreas de Acesso */}
        <div className="flex items-center justify-between h-14 border-b border-border/50">
          {/* Logo Text */}
          <Link to="/" className="group flex items-center">
            <h1 className="font-modern font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-wider uppercase bg-gradient-to-r from-vip-gold via-vip-gold-light to-vip-gold bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 group-hover:tracking-widest whitespace-nowrap">
              Aniversariante VIP
            </h1>
          </Link>

          {/* Desktop - Áreas de Acesso + Theme Toggle */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="text-xs h-8">
              <Link to="/login/aniversariante">Área do Aniversariante</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-xs h-8">
              <Link to="/login/estabelecimento">Área do Estabelecimento</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-xs h-8">
              <Link to="/login/colaborador">Área do Colaborador</Link>
            </Button>
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
            
            {/* Áreas de Acesso */}
            <div className="flex flex-col gap-1.5">
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
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
