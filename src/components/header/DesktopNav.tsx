import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Heart, User, Gift, Building2, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { hapticFeedback } from "@/lib/hapticFeedback";
import type { HeaderUser } from "./types";

interface DesktopNavProps {
  isScrolled: boolean;
  isHomePage: boolean;
  user: HeaderUser | null;
  onSignOut: () => void;
}

export const DesktopNav = memo(
  ({ isScrolled, isHomePage, user, onSignOut }: DesktopNavProps) => {
    const navigate = useNavigate();
    const showDarkText = isScrolled || !isHomePage;
    const reducedMotion = useReducedMotion();

    const linkClasses = cn(
      "px-3 py-2 rounded-full text-sm font-medium",
      "transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
      "min-h-[44px] flex items-center justify-center",
      !reducedMotion && "hover:scale-105 active:scale-95",
      showDarkText
        ? "text-gray-700 hover:bg-gray-100"
        : "text-white/90 hover:bg-white/10"
    );

    const handleNavClick = useCallback(
      (path: string) => {
        hapticFeedback(5);
        navigate(path);
      },
      [navigate]
    );

    return (
      <nav
        className="hidden lg:flex items-center gap-1"
        role="navigation"
        aria-label="Menu principal"
      >
        <button
          onClick={() => handleNavClick("/seja-parceiro")}
          className={linkClasses}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Para Empresas
        </button>

        <button
          onClick={() => handleNavClick("/meus-favoritos")}
          className={cn(linkClasses, "relative")}
          aria-label="Meus favoritos"
        >
          <Heart className="w-4 h-4 mr-2" />
          Favoritos
        </button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full",
                  "border transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  "min-h-[44px]",
                  !reducedMotion && "hover:scale-105 active:scale-95",
                  showDarkText
                    ? "border-gray-200 hover:shadow-md bg-white"
                    : "border-white/20 hover:bg-white/10"
                )}
                aria-label="Menu do usuário"
              >
                <Menu
                  className={cn(
                    "w-4 h-4",
                    showDarkText ? "text-gray-600" : "text-white"
                  )}
                />
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    "bg-gradient-to-r from-[#240046] to-violet-600"
                  )}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <DropdownMenuItem
                onClick={() => handleNavClick("/area-aniversariante")}
              >
                <Gift className="w-4 h-4 mr-2" />
                Minha Área
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNavClick("/meus-favoritos")}
              >
                <Heart className="w-4 h-4 mr-2" />
                Favoritos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNavClick("/configuracoes")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => handleNavClick("/login")}
            className={cn(
              "rounded-full min-h-[44px] px-5",
              "transition-all duration-200",
              !reducedMotion && "hover:scale-105 active:scale-95",
              showDarkText
                ? "bg-[#240046] hover:bg-[#3C096C] text-white"
                : "bg-white text-[#240046] hover:bg-white/90"
            )}
          >
            Entrar
          </Button>
        )}
      </nav>
    );
  }
);

DesktopNav.displayName = "DesktopNav";
