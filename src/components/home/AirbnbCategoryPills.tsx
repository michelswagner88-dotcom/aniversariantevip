import { useMemo, useRef, useState, useEffect, useCallback, memo, useId } from "react";
import { cn } from "@/lib/utils";
import { CATEGORIAS } from "@/constants/categories";
import {
  Sparkles,
  Dumbbell,
  Beer,
  Scissors,
  Coffee,
  PartyPopper,
  Cake,
  Clapperboard,
  Hotel,
  ShoppingBag,
  UtensilsCrossed,
  Sparkle,
  Wrench,
  IceCream,
  Store,
  ChevronLeft,
  ChevronRight,
  Loader2,
  type LucideIcon,
} from "lucide-react";

const CATEGORIA_ICONS: Record<string, LucideIcon> = {
  todos: Sparkles,
  academia: Dumbbell,
  bar: Beer,
  barbearia: Scissors,
  cafeteria: Coffee,
  "casa-noturna": PartyPopper,
  confeitaria: Cake,
  entretenimento: Clapperboard,
  hospedagem: Hotel,
  loja: ShoppingBag,
  restaurante: UtensilsCrossed,
  salao: Sparkle,
  servicos: Wrench,
  sorveteria: IceCream,
  outros: Store,
};

interface AirbnbCategoryPillsProps {
  categoriaAtiva: string | null;
  onCategoriaChange: (categoria: string | null) => void;
  contagens?: Record<string, number>;
  isLoading?: boolean;
  showCounts?: boolean;
}

const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

const useDebounce = <T extends (...args: any[]) => void>(fn: T, delay: number): T => {
  const timeoutRef = useRef<number>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  ) as T;
};

export const AirbnbCategoryPills = memo(
  ({
    categoriaAtiva,
    onCategoriaChange,
    contagens,
    isLoading = false,
    showCounts = false,
  }: AirbnbCategoryPillsProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showFadeLeft, setShowFadeLeft] = useState(false);
    const [showFadeRight, setShowFadeRight] = useState(true);
    const reducedMotion = useReducedMotion();
    const liveRegionId = useId();

    const checkScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowFadeLeft(scrollLeft > 10);
      setShowFadeRight(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    const debouncedCheckScroll = useDebounce(checkScroll, 16);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      checkScroll();
      el.addEventListener("scroll", debouncedCheckScroll, { passive: true });
      window.addEventListener("resize", checkScroll);

      return () => {
        el.removeEventListener("scroll", debouncedCheckScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }, [checkScroll, debouncedCheckScroll]);

    useEffect(() => {
      if (!scrollRef.current) return;

      const selectedEl = scrollRef.current.querySelector(`[data-categoria="${categoriaAtiva ?? "todos"}"]`);

      if (selectedEl) {
        requestAnimationFrame(() => {
          selectedEl.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "nearest",
            inline: "center",
          });
        });
      }
    }, [categoriaAtiva, reducedMotion]);

    const scrollBy = useCallback(
      (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;

        if (navigator.vibrate) navigator.vibrate(5);

        el.scrollBy({
          left: direction === "left" ? -280 : 280,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      [reducedMotion],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const tabs = scrollRef.current?.querySelectorAll('[role="tab"]');
        if (!tabs?.length) return;

        const tabsArray = Array.from(tabs);
        const currentIndex = tabsArray.findIndex(
          (tab) => tab.getAttribute("data-categoria") === (categoriaAtiva ?? "todos"),
        );

        let newIndex = currentIndex;

        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : tabsArray.length - 1;
            break;
          case "ArrowRight":
            e.preventDefault();
            newIndex = currentIndex < tabsArray.length - 1 ? currentIndex + 1 : 0;
            break;
          case "Home":
            e.preventDefault();
            newIndex = 0;
            break;
          case "End":
            e.preventDefault();
            newIndex = tabsArray.length - 1;
            break;
          default:
            return;
        }

        if (newIndex !== currentIndex) {
          const newTab = tabsArray[newIndex] as HTMLButtonElement;
          const newCategoria = newTab.getAttribute("data-categoria");
          if (navigator.vibrate) navigator.vibrate(10);
          onCategoriaChange(newCategoria === "todos" ? null : newCategoria);
          newTab.focus();
        }
      },
      [categoriaAtiva, onCategoriaChange],
    );

    const handleCategoriaChange = useCallback(
      (id: string | null) => {
        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
        onCategoriaChange(id);
      },
      [onCategoriaChange],
    );

    const categoriasConfig = useMemo(() => {
      const categoriasOrdenadas = [...CATEGORIAS].sort((a, b) => a.plural.localeCompare(b.plural, "pt-BR"));

      const totalCount = contagens ? Object.values(contagens).reduce((sum, n) => sum + n, 0) : undefined;

      return [
        {
          id: null,
          categoryId: "todos",
          nome: "Todos",
          icon: CATEGORIA_ICONS["todos"],
          count: totalCount,
        },
        ...categoriasOrdenadas.map((cat) => ({
          id: cat.label,
          categoryId: cat.id,
          nome: cat.label,
          icon: CATEGORIA_ICONS[cat.id] || CATEGORIA_ICONS["outros"],
          count: contagens?.[cat.id],
        })),
      ];
    }, [contagens]);

    const handleScrollLeft = useCallback(() => scrollBy("left"), [scrollBy]);
    const handleScrollRight = useCallback(() => scrollBy("right"), [scrollBy]);

    const activeCategoryName = useMemo(() => {
      const cat = categoriasConfig.find((c) => c.id === categoriaAtiva);
      return cat?.nome ?? "Todos";
    }, [categoriasConfig, categoriaAtiva]);

    return (
      <nav className="bg-[#240046] py-4" role="navigation" aria-label="Filtros de categoria">
        <div className="relative flex items-center gap-2 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
          <button
            onClick={handleScrollLeft}
            aria-label="Categorias anteriores"
            disabled={!showFadeLeft}
            className={cn(
              "flex flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full items-center justify-center",
              "bg-white/10 sm:bg-white/95 border border-white/20 sm:border-gray-200 shadow-lg",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              "disabled:opacity-0 disabled:pointer-events-none",
              !reducedMotion &&
                "transition-all duration-200 hover:bg-white/20 sm:hover:bg-white hover:scale-105 active:scale-95",
            )}
          >
            <ChevronLeft className="w-5 h-5 text-white sm:text-[#240046]" aria-hidden="true" />
          </button>

          <div className="relative flex-1 overflow-hidden">
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-r from-[#240046] via-[#240046]/80 to-transparent z-10 pointer-events-none",
                !reducedMotion && "transition-opacity duration-300",
                showFadeLeft ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />

            <div
              className={cn(
                "absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-[#240046] via-[#240046]/80 to-transparent z-10 pointer-events-none",
                !reducedMotion && "transition-opacity duration-300",
                showFadeRight ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />

            <div
              ref={scrollRef}
              role="tablist"
              aria-label="Filtrar por categoria"
              onKeyDown={handleKeyDown}
              className={cn(
                "flex gap-3 sm:gap-4 overflow-x-auto py-2 scrollbar-hide snap-x snap-mandatory touch-pan-x",
                reducedMotion ? "scroll-auto" : "scroll-smooth",
              )}
              style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
              tabIndex={0}
            >
              <div className="flex gap-3 sm:gap-4 px-1 min-w-max">
                {categoriasConfig.map((cat) => {
                  const isActive = categoriaAtiva === cat.id;
                  const IconComponent = cat.icon;
                  const hasCount = showCounts && typeof cat.count === "number";

                  return (
                    <button
                      key={cat.categoryId}
                      data-categoria={cat.id ?? "todos"}
                      onClick={() => handleCategoriaChange(cat.id)}
                      role="tab"
                      aria-selected={isActive}
                      tabIndex={isActive ? 0 : -1}
                      className={cn(
                        "group relative flex flex-col items-center justify-center gap-1.5",
                        "min-w-[72px] sm:min-w-[80px] min-h-[68px] px-3 py-2 rounded-xl flex-shrink-0 snap-start",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#240046]",
                        "transform-gpu",
                        !reducedMotion && "transition-all duration-200 ease-out",
                        isActive
                          ? "bg-white/20 shadow-lg shadow-white/10"
                          : "bg-transparent hover:bg-white/10 active:bg-white/15",
                        isLoading && isActive && "animate-pulse",
                      )}
                    >
                      <div
                        className={cn(
                          "relative",
                          !reducedMotion && "transition-transform duration-200",
                          isActive && !reducedMotion && "scale-110",
                          !isActive && "group-hover:scale-110",
                        )}
                      >
                        <IconComponent
                          size={24}
                          strokeWidth={1.5}
                          aria-hidden="true"
                          className={cn(
                            !reducedMotion && "transition-colors duration-200",
                            isActive ? "text-white" : "text-white/70 group-hover:text-white",
                          )}
                        />
                        {isLoading && isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#240046]/50 rounded-full">
                            <Loader2 size={16} className={cn("text-white", !reducedMotion && "animate-spin")} />
                          </div>
                        )}
                      </div>

                      <span
                        className={cn(
                          "text-xs sm:text-sm whitespace-nowrap",
                          !reducedMotion && "transition-all duration-200",
                          isActive ? "text-white font-semibold" : "text-white/70 group-hover:text-white font-medium",
                        )}
                      >
                        {cat.nome}
                      </span>

                      {hasCount && (
                        <span
                          className={cn(
                            "text-[10px] tabular-nums",
                            !reducedMotion && "transition-colors duration-200",
                            isActive ? "text-white/80" : "text-white/50",
                          )}
                        >
                          ({cat.count})
                        </span>
                      )}

                      <div
                        className={cn(
                          "absolute bottom-1 h-0.5 rounded-full bg-white",
                          !reducedMotion && "transition-all duration-300 ease-out",
                          isActive ? "w-8 opacity-100" : "w-0 opacity-0",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleScrollRight}
            aria-label="Próximas categorias"
            disabled={!showFadeRight}
            className={cn(
              "flex flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full items-center justify-center",
              "bg-white/10 sm:bg-white/95 border border-white/20 sm:border-gray-200 shadow-lg",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              "disabled:opacity-0 disabled:pointer-events-none",
              !reducedMotion &&
                "transition-all duration-200 hover:bg-white/20 sm:hover:bg-white hover:scale-105 active:scale-95",
            )}
          >
            <ChevronRight className="w-5 h-5 text-white sm:text-[#240046]" aria-hidden="true" />
          </button>
        </div>

        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading ? `Carregando ${activeCategoryName}...` : `Categoria: ${activeCategoryName}`}
        </div>
      </nav>
    );
  },
);

AirbnbCategoryPills.displayName = "AirbnbCategoryPills";
