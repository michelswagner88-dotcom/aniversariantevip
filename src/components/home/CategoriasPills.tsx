// =============================================================================
// CATEGORYCHIPS.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial - Nível Airbnb
// =============================================================================
// FEATURES:
// ✅ Chips horizontais com scroll lateral
// ✅ Compacto - não ocupa altura excessiva
// ✅ Contador de estabelecimentos
// ✅ Ícones por categoria
// ✅ Scroll suave com fade nas bordas
// ✅ Touch-friendly mobile
// =============================================================================

import { memo, useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface Category {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
  onFilterClick?: () => void;
  showFilter?: boolean;
}

// =============================================================================
// DEFAULT CATEGORIES
// =============================================================================

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "all", label: "Todos", icon: "✨" },
  { id: "academia", label: "Academia", icon: "💪" },
  { id: "bar", label: "Bar", icon: "🍺" },
  { id: "barbearia", label: "Barbearia", icon: "💈" },
  { id: "cafeteria", label: "Cafeteria", icon: "☕" },
  { id: "casa-noturna", label: "Casa Noturna", icon: "🎉" },
  { id: "confeitaria", label: "Confeitaria", icon: "🧁" },
  { id: "entretenimento", label: "Entretenimento", icon: "🎮" },
  { id: "hospedagem", label: "Hospedagem", icon: "🏨" },
  { id: "loja", label: "Loja", icon: "🛍️" },
  { id: "restaurante", label: "Restaurante", icon: "🍽️" },
  { id: "salao", label: "Salão", icon: "💇" },
  { id: "servicos", label: "Serviços", icon: "🔧" },
  { id: "sorveteria", label: "Sorveteria", icon: "🍦" },
];

// =============================================================================
// HOOKS
// =============================================================================

const useScrollable = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.6;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  return { scrollRef, canScrollLeft, canScrollRight, scroll, checkScroll };
};

const hapticFeedback = (pattern: number | number[] = 10) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// =============================================================================
// CHIP COMPONENT
// =============================================================================

interface ChipProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

const Chip = memo(({ category, isSelected, onClick }: ChipProps) => {
  const handleClick = useCallback(() => {
    hapticFeedback(5);
    onClick();
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center gap-1",
        "px-4 py-2.5 min-w-[64px]",
        "rounded-full",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
        "flex-shrink-0",
        isSelected
          ? "bg-slate-900 text-white shadow-md"
          : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-sm",
      )}
      aria-pressed={isSelected}
    >
      <span className="text-lg leading-none" role="img" aria-hidden="true">
        {category.icon}
      </span>
      <span className="text-[11px] font-medium whitespace-nowrap">{category.label}</span>
      {category.count !== undefined && (
        <span className={cn("text-[9px]", isSelected ? "text-white/60" : "text-slate-400")}>
          {category.count}
        </span>
      )}
    </button>
  );
});
Chip.displayName = "Chip";

// =============================================================================
// SCROLL BUTTON
// =============================================================================

interface ScrollButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
}

const ScrollButton = memo(({ direction, onClick, visible }: ScrollButtonProps) => {
  if (!visible) return null;

  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-10",
        "w-8 h-8 rounded-full",
        "bg-white shadow-md",
        "flex items-center justify-center",
        "text-gray-600 hover:text-gray-900",
        "transition-all duration-200",
        "hover:scale-110 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        "hidden sm:flex", // Só desktop
        direction === "left" ? "left-0" : "right-0",
      )}
      aria-label={direction === "left" ? "Anterior" : "Próximo"}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
});
ScrollButton.displayName = "ScrollButton";

// =============================================================================
// FILTER BUTTON
// =============================================================================

const FilterButton = memo(({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={() => {
        hapticFeedback(10);
        onClick();
      }}
      className={cn(
        "flex items-center gap-2",
        "px-4 py-3",
        "rounded-xl",
        "bg-white border border-gray-200",
        "text-gray-700 hover:bg-gray-50",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        "flex-shrink-0",
      )}
    >
      <SlidersHorizontal className="w-4 h-4" />
      <span className="text-sm font-medium">Filtros</span>
    </button>
  );
});
FilterButton.displayName = "FilterButton";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CategoryChips = memo(function CategoryChips({
  categories = DEFAULT_CATEGORIES,
  selectedCategory = "all",
  onSelectCategory,
  onFilterClick,
  showFilter = true,
}: CategoryChipsProps) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll, checkScroll } = useScrollable();

  // Recheck scroll on categories change
  useEffect(() => {
    checkScroll();
  }, [categories, checkScroll]);

  return (
    <div className={cn("relative w-full", "bg-white", "border-b border-gray-100")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center gap-3 py-3">
          {/* Scroll buttons (desktop) */}
          <ScrollButton direction="left" onClick={() => scroll("left")} visible={canScrollLeft} />

          {/* Chips container */}
          <div
            ref={scrollRef}
            className={cn(
              "flex gap-2 overflow-x-auto",
              "scrollbar-hide",
              "scroll-smooth",
              "-mx-4 px-4 sm:mx-0 sm:px-0", // Full bleed on mobile
              "flex-1",
            )}
          >
            {categories.map((category) => (
              <Chip
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onClick={() => onSelectCategory(category.id)}
              />
            ))}
          </div>

          <ScrollButton direction="right" onClick={() => scroll("right")} visible={canScrollRight} />

          {/* Filter button */}
          {showFilter && onFilterClick && (
            <div className="hidden sm:block border-l border-gray-200 pl-3 ml-2">
              <FilterButton onClick={onFilterClick} />
            </div>
          )}
        </div>
      </div>

      {/* Fade gradients */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none sm:hidden" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
      )}
    </div>
  );
});

CategoryChips.displayName = "CategoryChips";
export default CategoryChips;
