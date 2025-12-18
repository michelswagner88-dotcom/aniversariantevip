import { memo, useCallback } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { hapticFeedback } from "@/lib/hapticFeedback";

interface SearchPillProps {
  isScrolled: boolean;
  isHomePage: boolean;
  cityName?: string;
  onClick?: () => void;
}

export const SearchPill = memo(
  ({ isScrolled, isHomePage, cityName, onClick }: SearchPillProps) => {
    const showPill = isScrolled || !isHomePage;
    const reducedMotion = useReducedMotion();

    const handleClick = useCallback(() => {
      hapticFeedback(10);
      onClick?.();
    }, [onClick]);

    if (!showPill) return null;

    return (
      <button
        onClick={handleClick}
        className={cn(
          "hidden md:flex items-center gap-3",
          "px-4 py-2 rounded-full",
          "bg-white border border-gray-200 shadow-sm",
          "hover:shadow-md active:scale-[0.98]",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
          "min-h-[48px]",
          !reducedMotion && "hover:scale-[1.02]"
        )}
        aria-label="Abrir busca"
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-900">
            {cityName || "Qualquer cidade"}
          </span>
          <span className="w-px h-4 bg-gray-300" aria-hidden="true" />
          <span className="text-gray-500">Buscar benefícios</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#240046] to-violet-600 flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </div>
      </button>
    );
  }
);

SearchPill.displayName = "SearchPill";
