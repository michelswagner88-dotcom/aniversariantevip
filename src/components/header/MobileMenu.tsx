import { memo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  User,
  Gift,
  Building2,
  MapPin,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { hapticFeedback } from "@/lib/hapticFeedback";
import type { HeaderUser } from "./types";

interface MobileMenuProps {
  isOpen: boolean;
  user: HeaderUser | null;
  onClose: () => void;
  onSignOut: () => void;
}

export const MobileMenu = memo(
  ({ isOpen, user, onClose, onSignOut }: MobileMenuProps) => {
    const navigate = useNavigate();
    const reducedMotion = useReducedMotion();

    const handleNavigation = useCallback(
      (path: string) => {
        hapticFeedback(5);
        navigate(path);
        onClose();
      },
      [navigate, onClose]
    );

    // Lock body scroll when menu is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [isOpen]);

    const menuItemClasses = cn(
      "flex items-center gap-3 w-full p-4",
      "text-left text-base font-medium text-gray-900",
      "hover:bg-gray-50 active:bg-gray-100",
      "transition-colors duration-150",
      "focus-visible:outline-none focus-visible:bg-gray-50",
      "min-h-[56px]"
    );

    return (
      <>
        {/* Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden",
            "transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Menu Panel */}
        <nav
          className={cn(
            "fixed top-0 right-0 z-50 w-[85vw] max-w-sm h-full",
            "bg-white shadow-2xl lg:hidden",
            "transition-transform duration-300 ease-out",
            !reducedMotion && (isOpen ? "translate-x-0" : "translate-x-full"),
            reducedMotion && (isOpen ? "translate-x-0" : "translate-x-full")
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-semibold text-gray-900">Menu</span>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-full hover:bg-gray-100",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                "min-h-[44px] min-w-[44px] flex items-center justify-center"
              )}
              aria-label="Fechar menu"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* User Section */}
          {user && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#240046] to-violet-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {user.user_metadata?.full_name || "Aniversariante"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="py-2">
            <button
              onClick={() => handleNavigation("/")}
              className={menuItemClasses}
            >
              <Search className="w-5 h-5 text-gray-500" />
              Explorar
            </button>

            <button
              onClick={() => handleNavigation("/meus-favoritos")}
              className={menuItemClasses}
            >
              <Heart className="w-5 h-5 text-gray-500" />
              Favoritos
            </button>

            {user && (
              <button
                onClick={() => handleNavigation("/area-aniversariante")}
                className={menuItemClasses}
              >
                <Gift className="w-5 h-5 text-gray-500" />
                Minha Área
              </button>
            )}

            <div className="my-2 border-t" />

            <button
              onClick={() => handleNavigation("/seja-parceiro")}
              className={menuItemClasses}
            >
              <Building2 className="w-5 h-5 text-gray-500" />
              Para Empresas
            </button>

            <button
              onClick={() => handleNavigation("/como-funciona")}
              className={menuItemClasses}
            >
              <MapPin className="w-5 h-5 text-gray-500" />
              Como Funciona
            </button>
          </div>

          {/* Footer Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            {user ? (
              <Button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                variant="outline"
                className="w-full min-h-[48px] text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair da conta
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() => handleNavigation("/login")}
                  className="w-full min-h-[48px] bg-[#240046] hover:bg-[#3C096C]"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => handleNavigation("/cadastro")}
                  variant="outline"
                  className="w-full min-h-[48px]"
                >
                  Criar conta grátis
                </Button>
              </div>
            )}
          </div>
        </nav>
      </>
    );
  }
);

MobileMenu.displayName = "MobileMenu";
