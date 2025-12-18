// =============================================================================
// CATEGORIASPILLS.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial - Estilo Airbnb
// =============================================================================
// FEATURES:
// ✅ Estilo Airbnb: ícone + label + underline no selecionado
// ✅ Sem bolhas pesadas - visual limpo e "quieto"
// ✅ Filtros integrado com mesmo estilo
// ✅ Scroll suave com fade nas bordas
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
// CATEGORY TAB - Estilo Airbnb (ícone + label + underline)
// =============================================================================

interface CategoryTabProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryTab = memo(({ category, isSelected, onClick }: CategoryTabProps) => {
  const handleClick = useCallback(() => {
    hapticFeedback(5);
    onClick();
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center gap-1",
        "px-3 sm:px-4 py-2 min-w-[56px] sm:min-w-[64px]",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none",
        "flex-shrink-0",
        "relative",
        "group",
        // Cor do texto
        isSelected ? "text-white" : "text-white/60 hover:text-white/90",
      )}
      aria-pressed={isSelected}
    >
      {/* Ícone */}
      <span
        className={cn(
          "text-xl sm:text-2xl leading-none",
          "transition-transform duration-200",
          "group-hover:scale-110",
          isSelected && "scale-110",
        )}
        role="img"
        aria-hidden="true"
      >
        {category.icon}
      </span>

      {/* Label */}
      <span className={cn("text-[10px] sm:text-xs font-medium whitespace-nowrap", "transition-colors duration-200")}>
        {category.label}
      </span>

      {/* Underline - só quando selecionado */}
      <span
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2",
          "h-0.5 rounded-full",
          "bg-white",
          "transition-all duration-200",
          isSelected ? "w-8 sm:w-10 opacity-100" : "w-0 opacity-0",
        )}
        aria-hidden="true"
      />
    </button>
  );
});
CategoryTab.displayName = "CategoryTab";

// =============================================================================
// FILTER TAB - Mesmo estilo das categorias
// =============================================================================

interface FilterTabProps {
  onClick: () => void;
  activeCount?: number;
}

const FilterTab = memo(({ onClick, activeCount = 0 }: FilterTabProps) => {
  const handleClick = useCallback(() => {
    hapticFeedback(10);
    onClick();
  }, [onClick]);

  const hasFilters = activeCount > 0;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center gap-1",
        "px-3 sm:px-4 py-2 min-w-[56px] sm:min-w-[64px]",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none",
        "flex-shrink-0",
        "relative",
        "group",
        "border-l border-white/20 ml-1",
        // Cor do texto
        hasFilters ? "text-white" : "text-white/60 hover:text-white/90",
      )}
    >
      {/* Ícone */}
      <span className={cn("relative", "transition-transform duration-200", "group-hover:scale-110")}>
        <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />

        {/* Badge de contagem */}
        {hasFilters && (
          <span
            className={cn(
              "absolute -top-1.5 -right-1.5",
              "w-4 h-4 rounded-full",
              "bg-white text-[#240046]",
              "text-[9px] font-bold",
              "flex items-center justify-center",
            )}
          >
            {activeCount}
          </span>
        )}
      </span>

      {/* Label */}
      <span className={cn("text-[10px] sm:text-xs font-medium whitespace-nowrap", "transition-colors duration-200")}>
        Filtros
      </span>

      {/* Underline - só quando tem filtros ativos */}
      <span
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2",
          "h-0.5 rounded-full",
          "bg-white",
          "transition-all duration-200",
          hasFilters ? "w-8 sm:w-10 opacity-100" : "w-0 opacity-0",
        )}
        aria-hidden="true"
      />
    </button>
  );
});
FilterTab.displayName = "FilterTab";

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
        "w-7 h-7 rounded-full",
        "bg-white/90 shadow-md backdrop-blur-sm",
        "flex items-center justify-center",
        "text-[#240046] hover:bg-white",
        "transition-all duration-200",
        "hover:scale-110 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        "hidden lg:flex",
        direction === "left" ? "left-0" : "right-0",
      )}
      aria-label={direction === "left" ? "Anterior" : "Próximo"}
    >
      <Icon className="w-4 h-4" />
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

  useEffect(() => {
    checkScroll();
  }, [categories, checkScroll]);

  return (
    <div className="relative w-full py-2">
      {/* Scroll buttons (desktop) */}
      <ScrollButton direction="left" onClick={() => scroll("left")} visible={canScrollLeft} />

      {/* Tabs container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex items-end gap-0 overflow-x-auto",
          "scrollbar-hide",
          "scroll-smooth",
          "-mx-4 px-4 sm:mx-0 sm:px-0",
        )}
      >
        {/* Category tabs */}
        {categories.map((category) => (
          <CategoryTab
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onClick={() => onSelectCategory(category.id)}
          />
        ))}

        {/* Filter tab - no final */}
        {showFilter && onFilterClick && <FilterTab onClick={onFilterClick} activeCount={activeFiltersCount} />}
      </div>

      <ScrollButton direction="right" onClick={() => scroll("right")} visible={canScrollRight} />

      {/* Fade gradients */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#240046] to-transparent pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#240046] to-transparent pointer-events-none" />
      )}
    </div>
  );
});

CategoriasPills.displayName = "CategoriasPills";
export default CategoriasPills;
