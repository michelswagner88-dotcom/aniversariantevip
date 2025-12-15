import { useMemo, useRef, useState, useEffect, useCallback, memo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Dumbbell,
  Beer,
  Scissors,
  Coffee,
  PartyPopper,
  Cake,
  Gamepad2,
  Hotel,
  ShoppingBag,
  UtensilsCrossed,
  Star,
  IceCream2,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIAS } from "@/constants/categories";

// =============================================================================
// CONSTANTS
// =============================================================================

const SCROLL_AMOUNT = 200;
const SCROLL_THRESHOLD = 10;
const DEBOUNCE_DELAY = 16;
const ANIMATION_DELAY_STEP = 30;
const SUB_ANIMATION_DELAY_STEP = 40;
const HAPTIC_LIGHT = 5;
const HAPTIC_MEDIUM: number[] = [10, 30, 10];

const CATEGORIA_ICONS: Record<string, LucideIcon> = {
  todos: Sparkles,
  academia: Dumbbell,
  bar: Beer,
  barbearia: Scissors,
  cafeteria: Coffee,
  "casa-noturna": PartyPopper,
  confeitaria: Cake,
  entretenimento: Gamepad2,
  hospedagem: Hotel,
  loja: ShoppingBag,
  restaurante: UtensilsCrossed,
  salao: Scissors,
  servicos: Star,
  sorveteria: IceCream2,
  outros: Plus,
};

// =============================================================================
// TYPES
// =============================================================================

interface Estabelecimento {
  id: string;
  categoria?: string | string[];
  especialidades?: string[];
}

interface AirbnbCategoryPillsProps {
  categoriaAtiva: string | null;
  subcategoriaAtiva?: string | null;
  onCategoriaChange: (categoria: string | null) => void;
  onSubcategoriaChange?: (subcategoria: string | null) => void;
  estabelecimentos: Estabelecimento[];
  isLoading?: boolean;
}

interface CategoryConfig {
  id: string | null;
  nome: string;
  icon: LucideIcon;
}

interface SubcategoryConfig {
  id: string;
  nome: string;
  icon: string;
  count: number;
}

// =============================================================================
// HOOKS
// =============================================================================

const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

const useDebounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number): T => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  ) as T;
};

interface ScrollFadeState {
  showLeft: boolean;
  showRight: boolean;
}

const useScrollFade = (scrollRef: React.RefObject<HTMLDivElement>, deps: unknown[] = []): ScrollFadeState => {
  const [state, setState] = useState<ScrollFadeState>({
    showLeft: false,
    showRight: true,
  });

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setState({
      showLeft: scrollLeft > SCROLL_THRESHOLD,
      showRight: scrollLeft < scrollWidth - clientWidth - SCROLL_THRESHOLD,
    });
  }, [scrollRef]);

  const debouncedCheck = useDebounce(checkScroll, DEBOUNCE_DELAY);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", debouncedCheck, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", debouncedCheck);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, debouncedCheck, ...deps]);

  return state;
};

// =============================================================================
// UTILS
// =============================================================================

const normalizeCategoriaToId = (cat: string): string => {
  if (!cat) return "";
  const lower = cat.toLowerCase().trim();

  const found = CATEGORIAS.find(
    (c) => c.id === lower || c.label.toLowerCase() === lower || c.plural.toLowerCase() === lower,
  );

  return found?.id || lower;
};

const haptic = (pattern: number | number[] = HAPTIC_LIGHT) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// =============================================================================
// COMPONENT
// =============================================================================

export const AirbnbCategoryPills = memo(
  ({
    categoriaAtiva,
    subcategoriaAtiva = null,
    onCategoriaChange,
    onSubcategoriaChange,
    estabelecimentos,
    isLoading = false,
  }: AirbnbCategoryPillsProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const subScrollRef = useRef<HTMLDivElement>(null);
    const reducedMotion = useReducedMotion();

    // Scroll fade states
    const mainScrollFade = useScrollFade(scrollRef, [estabelecimentos]);
    const subScrollFade = useScrollFade(subScrollRef, [categoriaAtiva]);

    // Contagem por categoria
    const contagens = useMemo(() => {
      const counts: Record<string, number> = { todos: estabelecimentos.length };

      estabelecimentos.forEach((est) => {
        const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
        cats.forEach((cat) => {
          if (cat) {
            const normalizedId = normalizeCategoriaToId(cat);
            counts[normalizedId] = (counts[normalizedId] || 0) + 1;
          }
        });
      });

      return counts;
    }, [estabelecimentos]);

    // Contagem por subcategoria
    const contagensSub = useMemo(() => {
      const counts: Record<string, number> = {};

      estabelecimentos.forEach((est) => {
        const especialidades = est.especialidades || [];
        especialidades.forEach((esp) => {
          if (esp) {
            const lower = esp.toLowerCase().trim();
            counts[lower] = (counts[lower] || 0) + 1;
          }
        });
      });

      return counts;
    }, [estabelecimentos]);

    // Categorias config
    const categoriasConfig = useMemo<CategoryConfig[]>(() => {
      const configs: CategoryConfig[] = [
        { id: null, nome: "Todos", icon: CATEGORIA_ICONS.todos },
        ...CATEGORIAS.map((cat) => ({
          id: cat.id,
          nome: cat.label,
          icon: CATEGORIA_ICONS[cat.id] || Star,
        })),
      ];

      return configs.filter((cat) => {
        if (cat.id === null) return true;
        return (contagens[cat.id] || 0) > 0;
      });
    }, [contagens]);

    // Subcategorias da categoria ativa
    const subcategoriasConfig = useMemo<SubcategoryConfig[]>(() => {
      if (!categoriaAtiva) return [];

      const categoria = CATEGORIAS.find((c) => c.id === categoriaAtiva);
      if (!categoria) return [];

      return categoria.subcategorias
        .filter((sub) => {
          const count = contagensSub[sub.id] || contagensSub[sub.label.toLowerCase()] || 0;
          return count > 0;
        })
        .map((sub) => ({
          id: sub.id,
          nome: sub.label,
          icon: sub.icon,
          count: contagensSub[sub.id] || contagensSub[sub.label.toLowerCase()] || 0,
        }));
    }, [categoriaAtiva, contagensSub]);

    // Auto-scroll to active category
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      const activeEl = el.querySelector(`[data-category="${categoriaAtiva ?? "todos"}"]`) as HTMLElement;

      if (activeEl) {
        requestAnimationFrame(() => {
          activeEl.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "nearest",
            inline: "center",
          });
        });
      }
    }, [categoriaAtiva, reducedMotion]);

    // Handlers
    const scrollBy = useCallback(
      (direction: "left" | "right", isSubcategoria = false) => {
        const el = isSubcategoria ? subScrollRef.current : scrollRef.current;
        if (!el) return;

        haptic(HAPTIC_LIGHT);

        el.scrollBy({
          left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      [reducedMotion],
    );

    const handleCategoriaChange = useCallback(
      (id: string | null) => {
        haptic(HAPTIC_MEDIUM);
        onCategoriaChange(id);
        onSubcategoriaChange?.(null);
      },
      [onCategoriaChange, onSubcategoriaChange],
    );

    const handleSubcategoriaChange = useCallback(
      (id: string | null) => {
        haptic(HAPTIC_MEDIUM);
        onSubcategoriaChange?.(id);
      },
      [onSubcategoriaChange],
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, items: CategoryConfig[], currentId: string | null) => {
        const currentIndex = items.findIndex((item) => item.id === currentId);
        let newIndex = currentIndex;

        if (e.key === "ArrowRight") {
          e.preventDefault();
          newIndex = Math.min(currentIndex + 1, items.length - 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
        } else if (e.key === "Home") {
          e.preventDefault();
          newIndex = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          newIndex = items.length - 1;
        }

        if (newIndex !== currentIndex) {
          handleCategoriaChange(items[newIndex].id);
        }
      },
      [handleCategoriaChange],
    );

    const activeCategoryName = useMemo(() => {
      const cat = categoriasConfig.find((c) => c.id === categoriaAtiva);
      return cat?.nome ?? "Todos";
    }, [categoriasConfig, categoriaAtiva]);

    return (
      <div className="space-y-2" role="navigation" aria-label="Filtros de categoria">
        {/* CATEGORIAS PRINCIPAIS */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scrollBy("left")}
            aria-label="Categorias anteriores"
            disabled={!mainScrollFade.showLeft}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-10",
              "hidden lg:flex",
              "w-9 h-9 items-center justify-center rounded-full",
              "bg-slate-800/90 border border-white/10 text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              "disabled:opacity-0 disabled:pointer-events-none",
              !reducedMotion && "transition-all duration-200 hover:bg-slate-700 hover:scale-105",
              !mainScrollFade.showLeft && "opacity-0 pointer-events-none",
            )}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          {/* Left Fade */}
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-12 z-[5]",
              "bg-gradient-to-r from-background to-transparent",
              "pointer-events-none",
              !reducedMotion && "transition-opacity duration-300",
              mainScrollFade.showLeft ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            role="tablist"
            aria-label="Filtrar por categoria"
            onKeyDown={(e) => handleKeyDown(e, categoriasConfig, categoriaAtiva)}
            className={cn(
              "flex gap-1 overflow-x-auto py-3 px-4",
              "scrollbar-hide snap-x snap-mandatory touch-pan-x",
              reducedMotion ? "scroll-auto" : "scroll-smooth",
            )}
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {categoriasConfig.map((cat, index) => {
              const isActive = categoriaAtiva === cat.id;
              const count = cat.id === null ? contagens.todos : contagens[cat.id] || 0;
              const IconComponent = cat.icon;

              return (
                <button
                  key={cat.id ?? "todos"}
                  data-category={cat.id ?? "todos"}
                  onClick={() => handleCategoriaChange(cat.id)}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  style={{
                    animationDelay: reducedMotion ? "0ms" : `${index * ANIMATION_DELAY_STEP}ms`,
                    scrollSnapAlign: "start",
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5",
                    "px-4 py-3 min-w-[80px] min-h-[72px]",
                    "rounded-xl whitespace-nowrap flex-shrink-0 snap-start",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "[-webkit-tap-highlight-color:transparent]",
                    !reducedMotion && "transition-all duration-200 active:scale-[0.97]",
                    isActive ? "bg-white/15 border-b-2 border-white" : "hover:bg-white/5",
                    isLoading && isActive && "animate-pulse",
                  )}
                >
                  <IconComponent size={24} strokeWidth={isActive ? 2 : 1.5} className="text-white" aria-hidden="true" />
                  <span className="text-xs font-medium text-white">{cat.nome}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold tabular-nums",
                        isActive ? "text-white" : "text-white/70",
                      )}
                    >
                      {count}
                      <span className="sr-only"> estabelecimentos</span>
                    </span>
                  )}
                </button>
              );
            })}
            <div className="w-4 flex-shrink-0" aria-hidden="true" />
          </div>

          {/* Right Fade */}
          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-12 z-[5]",
              "bg-gradient-to-l from-background to-transparent",
              "pointer-events-none",
              !reducedMotion && "transition-opacity duration-300",
              mainScrollFade.showRight ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />

          {/* Right Arrow */}
          <button
            onClick={() => scrollBy("right")}
            aria-label="Próximas categorias"
            disabled={!mainScrollFade.showRight}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10",
              "hidden lg:flex",
              "w-9 h-9 items-center justify-center rounded-full",
              "bg-slate-800/90 border border-white/10 text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              "disabled:opacity-0 disabled:pointer-events-none",
              !reducedMotion && "transition-all duration-200 hover:bg-slate-700 hover:scale-105",
              !mainScrollFade.showRight && "opacity-0 pointer-events-none",
            )}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        {/* SUBCATEGORIAS */}
        {categoriaAtiva && subcategoriasConfig.length > 0 && (
          <div className={cn("relative", !reducedMotion && "animate-in fade-in slide-in-from-top-2 duration-300")}>
            {/* Left Arrow */}
            <button
              onClick={() => scrollBy("left", true)}
              aria-label="Subcategorias anteriores"
              disabled={!subScrollFade.showLeft}
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 z-10",
                "hidden lg:flex",
                "w-7 h-7 items-center justify-center rounded-full",
                "bg-slate-800/90 border border-white/10 text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                "disabled:opacity-0 disabled:pointer-events-none",
                !reducedMotion && "transition-all duration-200 hover:bg-slate-700 hover:scale-105",
                !subScrollFade.showLeft && "opacity-0 pointer-events-none",
              )}
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>

            {/* Left Fade */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-8 z-[5]",
                "bg-gradient-to-r from-background to-transparent",
                "pointer-events-none",
                subScrollFade.showLeft ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />

            {/* Scroll Container */}
            <div
              ref={subScrollRef}
              role="tablist"
              aria-label="Filtrar por subcategoria"
              className={cn(
                "flex gap-2 overflow-x-auto py-2 px-4",
                "scrollbar-hide snap-x snap-mandatory touch-pan-x",
                reducedMotion ? "scroll-auto" : "scroll-smooth",
              )}
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {/* "Todas" button */}
              <button
                onClick={() => handleSubcategoriaChange(null)}
                role="tab"
                aria-selected={subcategoriaAtiva === null}
                tabIndex={subcategoriaAtiva === null ? 0 : -1}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 min-h-[40px]",
                  "rounded-full whitespace-nowrap flex-shrink-0 snap-start",
                  "border text-sm font-medium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
                  "[-webkit-tap-highlight-color:transparent]",
                  !reducedMotion && "transition-all duration-200 active:scale-[0.97]",
                  subcategoriaAtiva === null
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 border-violet-500/50 text-white shadow-lg shadow-violet-500/30"
                    : "bg-white/5 border-white/20 text-white hover:bg-white/10",
                )}
              >
                <span>Todas</span>
              </button>

              {subcategoriasConfig.map((sub, index) => {
                const isActive = subcategoriaAtiva === sub.id;

                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubcategoriaChange(sub.id)}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    style={{
                      animationDelay: reducedMotion ? "0ms" : `${index * SUB_ANIMATION_DELAY_STEP}ms`,
                      scrollSnapAlign: "start",
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 min-h-[40px]",
                      "rounded-full whitespace-nowrap flex-shrink-0 snap-start",
                      "border text-sm font-medium",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
                      "[-webkit-tap-highlight-color:transparent]",
                      !reducedMotion && "transition-all duration-200 active:scale-[0.97]",
                      isActive
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 border-violet-500/50 text-white shadow-lg shadow-violet-500/30"
                        : "bg-white/5 border-white/20 text-white hover:bg-white/10",
                    )}
                  >
                    <span className="text-base" aria-hidden="true">
                      {sub.icon}
                    </span>
                    <span>{sub.nome}</span>
                    {sub.count > 0 && (
                      <span
                        className={cn(
                          "text-xs font-semibold px-1.5 py-0.5 rounded-full",
                          "min-w-[20px] text-center tabular-nums",
                          isActive ? "bg-white/25" : "bg-white/10",
                        )}
                      >
                        {sub.count}
                        <span className="sr-only"> estabelecimentos</span>
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="w-4 flex-shrink-0" aria-hidden="true" />
            </div>

            {/* Right Fade */}
            <div
              className={cn(
                "absolute right-0 top-0 bottom-0 w-8 z-[5]",
                "bg-gradient-to-l from-background to-transparent",
                "pointer-events-none",
                subScrollFade.showRight ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />

            {/* Right Arrow */}
            <button
              onClick={() => scrollBy("right", true)}
              aria-label="Próximas subcategorias"
              disabled={!subScrollFade.showRight}
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 z-10",
                "hidden lg:flex",
                "w-7 h-7 items-center justify-center rounded-full",
                "bg-slate-800/90 border border-white/10 text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                "disabled:opacity-0 disabled:pointer-events-none",
                !reducedMotion && "transition-all duration-200 hover:bg-slate-700 hover:scale-105",
                !subScrollFade.showRight && "opacity-0 pointer-events-none",
              )}
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Live region para screen readers */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading ? `Carregando ${activeCategoryName}...` : `Categoria selecionada: ${activeCategoryName}`}
        </div>
      </div>
    );
  },
);

AirbnbCategoryPills.displayName = "AirbnbCategoryPills";
