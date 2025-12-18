// =============================================================================
// CATEGORIASPILLS.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial - Estilo Airbnb
// =============================================================================

import { memo, useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// DESIGN TOKENS
// =============================================================================

const BRAND_PRIMARY = "#240046";
const MIN_TOUCH_TARGET = 44; // px - acessibilidade

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

// =============================================================================
// CATEGORY TAB - Estilo Airbnb Premium
// =============================================================================

interface CategoryTabProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryTab = memo(({ category, isSelected, onClick }: CategoryTabProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5",
        // Touch target: mínimo 44px de altura
        "min-h-[52px] sm:min-h-[56px]",
        "px-3 sm:px-4",
        "min-w-[60px] sm:min-w-[72px]",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#240046]",
        "flex-shrink-0",
        "relative",
        "group",
        // Cor do texto
        isSelected ? "text-white" : "text-white/60 hover:text-white",
      )}
      aria-pressed={isSelected}
      aria-label={`Categoria ${category.label}`}
    >
      {/* Ícone */}
      <span
        className={cn(
          "text-2xl leading-none",
          "transition-transform duration-200 ease-out",
          isSelected ? "scale-110" : "group-hover:scale-110",
        )}
        role="img"
        aria-hidden="true"
      >
        {category.icon}
      </span>

      {/* Label */}
      <span
        className={cn(
          "text-[11px] sm:text-xs font-medium whitespace-nowrap",
          "transition-opacity duration-200",
          isSelected ? "opacity-100" : "opacity-80 group-hover:opacity-100",
        )}
      >
        {category.label}
      </span>

      {/* Underline indicator */}
      <span
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2",
          "h-[2px] rounded-full",
          "bg-white",
          "transition-all duration-200 ease-out",
          isSelected ? "w-6 sm:w-8 opacity-100" : "w-0 opacity-0",
        )}
        aria-hidden="true"
      />
    </button>
  );
});
CategoryTab.displayName = "CategoryTab";

// =============================================================================
// FILTER TAB - Design consistente
// =============================================================================

interface FilterTabProps {
  onClick: () => void;
  activeCount?: number;
}

const FilterTab = memo(({ onClick, activeCount = 0 }: FilterTabProps) => {
  const hasFilters = activeCount > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5",
        "min-h-[52px] sm:min-h-[56px]",
        "px-3 sm:px-4",
        "min-w-[60px] sm:min-w-[72px]",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        "flex-shrink-0",
        "relative",
        "group",
        // Separador visual sutil
        "ml-2 pl-2 sm:ml-3 sm:pl-3",
        "border-l border-white/20",
        // Cor do texto
        hasFilters ? "text-white" : "text-white/60 hover:text-white",
      )}
      aria-label={`Filtros${hasFilters ? ` (${activeCount} ativos)` : ""}`}
    >
      {/* Ícone com badge */}
      <span
        className={cn(
          "relative",
          "transition-transform duration-200 ease-out",
          hasFilters ? "scale-110" : "group-hover:scale-110",
        )}
      >
        <SlidersHorizontal className="w-6 h-6" strokeWidth={1.5} />

        {/* Badge de contagem */}
        {hasFilters && (
          <span
            className={cn(
              "absolute -top-1 -right-1.5",
              "min-w-[16px] h-[16px] px-1 rounded-full",
              "bg-white text-[#240046]",
              "text-[10px] font-bold",
              "flex items-center justify-center",
              "shadow-sm",
            )}
          >
            {activeCount}
          </span>
        )}
      </span>

      {/* Label */}
      <span
        className={cn(
          "text-[11px] sm:text-xs font-medium whitespace-nowrap",
          "transition-opacity duration-200",
          hasFilters ? "opacity-100" : "opacity-80 group-hover:opacity-100",
        )}
      >
        Filtros
      </span>

      {/* Underline indicator */}
      <span
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2",
          "h-[2px] rounded-full",
          "bg-white",
          "transition-all duration-200 ease-out",
          hasFilters ? "w-6 sm:w-8 opacity-100" : "w-0 opacity-0",
        )}
        aria-hidden="true"
      />
    </button>
  );
});
FilterTab.displayName = "FilterTab";

// =============================================================================
// SCROLL BUTTON - Desktop only
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
        "bg-white shadow-lg",
        "flex items-center justify-center",
        "text-gray-700 hover:text-gray-900",
        "transition-all duration-200",
        "hover:scale-110 hover:shadow-xl",
        "active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        "hidden lg:flex",
        direction === "left" ? "left-1" : "right-1",
      )}
      aria-label={direction === "left" ? "Ver categorias anteriores" : "Ver mais categorias"}
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

  useEffect(() => {
    checkScroll();
  }, [categories, checkScroll]);

  return (
    <nav className="relative w-full py-1" aria-label="Categorias de estabelecimentos">
      {/* Scroll buttons (desktop) */}
      <ScrollButton direction="left" onClick={() => scroll("left")} visible={canScrollLeft} />

      {/* Tabs container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex items-stretch",
          "overflow-x-auto",
          "scrollbar-hide",
          "scroll-smooth",
          // Full bleed no mobile
          "-mx-4 px-4 sm:mx-0 sm:px-0",
        )}
        role="tablist"
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

      {/* Fade gradients para indicar scroll */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-10",
          "bg-gradient-to-r from-[#240046] to-transparent",
          "pointer-events-none",
          "transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-10",
          "bg-gradient-to-l from-[#240046] to-transparent",
          "pointer-events-none",
          "transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      />
    </nav>
  );
});

CategoriasPills.displayName = "CategoriasPills";
export default CategoriasPills;
