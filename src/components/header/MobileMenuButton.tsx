import { memo, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { hapticFeedback } from "@/lib/hapticFeedback";

interface MobileMenuButtonProps {
  isOpen: boolean;
  isScrolled: boolean;
  isHomePage: boolean;
  onClick: () => void;
}

export const MobileMenuButton = memo(
  ({ isOpen, isScrolled, isHomePage, onClick }: MobileMenuButtonProps) => {
    const showDark = isScrolled || !isHomePage;
    const reducedMotion = useReducedMotion();

    const handleClick = useCallback(() => {
      hapticFeedback(10);
      onClick();
    }, [onClick]);

    return (
      <button
        onClick={handleClick}
        className={cn(
          "lg:hidden p-2 rounded-full",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
          "min-h-[44px] min-w-[44px] flex items-center justify-center",
          !reducedMotion && "active:scale-95",
          showDark
            ? "hover:bg-gray-100 text-gray-700"
            : "hover:bg-white/10 text-white"
        )}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    );
  }
);

MobileMenuButton.displayName = "MobileMenuButton";
