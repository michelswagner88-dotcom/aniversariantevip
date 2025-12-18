// =============================================================================
// CATEGORIASPILLS.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial - Nível Airbnb
// =============================================================================
// FEATURES:
// ✅ Chips horizontais com scroll lateral
// ✅ Filtros INTEGRADO como chip (não separado)
// ✅ Compacto - não ocupa altura excessiva
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

interface CategoriasPillsProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
  onFilterClick?: () => void;
  showFilter?: boolean;
  activeFiltersCount?: number;
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        "flex-shrink-0",
        isSelected ? "bg-white text-[#240046] shadow-md" : "bg-white/10 text-white/90 hover:bg-white/20",
      )}
      aria-pressed={isSelected}
    >
      <span className="text-lg leading-none" role="img" aria-hidden="true">
        {category.icon}
      </span>
      <span className="text-[11px] font-medium whitespace-nowrap">{category.label}</span>
    </button>
  );
});
Chip.displayName = "Chip";

// =============================================================================
// FILTER CHIP (Integrado como chip)
// =============================================================================

interface FilterChipProps {
  onClick: () => void;
  activeCount?: number;
}

const FilterChip = memo(({ onClick, activeCount = 0 }: FilterChipProps) => {
  const handleClick = useCallback(() => {
    hapticFeedback(10);
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        "flex-shrink-0",
        "relative",
        activeCount > 0 ? "bg-white text-[#240046] shadow-md" : "bg-white/10 text-white/90 hover:bg-white/20",
      )}
    >
      <span className="text-lg leading-none flex items-center justify-center">
        <SlidersHorizontal className="w-5 h-5" />
      </span>
      <span className="text-[11px] font-medium whitespace-nowrap">Filtros</span>

      {/* Badge de contagem */}
      {activeCount > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1",
            "w-5 h-5 rounded-full",
            "bg-gradient-to-r from-[#240046] to-[#5A189A]",
            "text-white text-[10px] font-bold",
            "flex items-center justify-center",
            "shadow-sm",
          )}
        >
          {activeCount}
        </span>
      )}
    </button>
  );
});
FilterChip.displayName = "FilterChip";

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
        "bg-white/90 shadow-md backdrop-blur-sm",
        "flex items-center justify-center",
        "text-[#240046] hover:bg-white",
        "transition-all duration-200",
        "hover:scale-110 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        "hidden lg:flex", // Só desktop grande
        direction === "left" ? "left-2" : "right-2",
      )}
      aria-label={direction === "left" ? "Anterior" : "Próximo"}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
});
ScrollButton.displayName = "ScrollButton";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CategoriasPills = memo(function CategoriasPills({
  categories = DEFAULT_CATEGORIES,
  selectedCategory = "all",
  onSelectCategory,
  onFilterClick,
  showFilter = true,
  activeFiltersCount = 0,
}: CategoriasPillsProps) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll, checkScroll } = useScrollable();

  // Recheck scroll on categories change
  useEffect(() => {
    checkScroll();
  }, [categories, checkScroll]);

  return (
    <div className="relative w-full py-3">
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
        )}
      >
        {/* Filter chip PRIMEIRO (mais visível) */}
        {showFilter && onFilterClick && <FilterChip onClick={onFilterClick} activeCount={activeFiltersCount} />}

        {/* Category chips */}
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

      {/* Fade gradients para indicar scroll */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#240046] to-transparent pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#240046] to-transparent pointer-events-none" />
      )}
    </div>
  );
});

CategoriasPills.displayName = "CategoriasPills";
export default CategoriasPills;
