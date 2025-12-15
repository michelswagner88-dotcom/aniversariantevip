import { useMemo, useRef, useState, useEffect, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIAS } from "@/constants/categories";

// =============================================================================
// CONSTANTS
// =============================================================================

const SCROLL_AMOUNT = 200;
const SCROLL_THRESHOLD = 10;
const DEBOUNCE_DELAY = 16;
const ANIMATION_DELAY_STEP = 30;
const HAPTIC_LIGHT = 5;
const HAPTIC_MEDIUM: number[] = [10, 30, 10];

// =============================================================================
// TYPES
// =============================================================================

interface Estabelecimento {
  id: string;
  categoria?: string | string[];
}

interface CategoriasPillsProps {
  categoriaAtiva: string | null;
  onCategoriaChange: (categoria: string | null) => void;
  estabelecimentos: Estabelecimento[];
  isLoading?: boolean;
}

interface CategoriaConfig {
  id: string | null;
  nome: string;
  icon: string;
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

export const CategoriasPills = memo(
  ({ categoriaAtiva, onCategoriaChange, estabelecimentos, isLoading = false }: CategoriasPillsProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(true);
    const reducedMotion = useReducedMotion();

    // Contagem por categoria (normalizado para ID)
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

    // Categorias config (usando ID para matching correto)
    const categoriasConfig = useMemo<CategoriaConfig[]>(() => {
      const configs: CategoriaConfig[] = [
        { id: null, nome: "Todos", icon: "🚀" },
        ...CATEGORIAS.map((cat) => ({
          id: cat.id, // Usar ID, não plural
          nome: cat.plural, // Exibir plural
          icon: cat.icon,
        })),
      ];

      return configs.filter((cat) => {
        if (cat.id === null) return true;
        return (contagens[cat.id] || 0) > 0;
      });
    }, [contagens]);

    // Scroll fade detection
    const checkScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftFade(scrollLeft > SCROLL_THRESHOLD);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - SCROLL_THRESHOLD);
    }, []);

    const debouncedCheckScroll = useDebounce(checkScroll, DEBOUNCE_DELAY);

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

    // Scroll handler
    const scrollBy = useCallback(
      (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;

        haptic(HAPTIC_LIGHT);

        el.scrollBy({
          left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      [reducedMotion],
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const currentIndex = categoriasConfig.findIndex((cat) => cat.id === categoriaAtiva);
        let newIndex = currentIndex === -1 ? 0 : currentIndex;

        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : categoriasConfig.length - 1;
            break;
          case "ArrowRight":
            e.preventDefault();
            newIndex = currentIndex < categoriasConfig.length - 1 ? currentIndex + 1 : 0;
            break;
          case "Home":
            e.preventDefault();
            newIndex = 0;
            break;
          case "End":
            e.preventDefault();
            newIndex = categoriasConfig.length - 1;
            break;
          default:
            return;
        }

        if (newIndex !== currentIndex) {
          haptic(HAPTIC_LIGHT);
          onCategoriaChange(categoriasConfig[newIndex].id);
        }
      },
      [categoriaAtiva, categoriasConfig, onCategoriaChange],
    );

    // Category change handler
    const handleCategoriaChange = useCallback(
      (id: string | null) => {
        haptic(HAPTIC_MEDIUM);
        onCategoriaChange(id);
      },
      [onCategoriaChange],
    );

    // Active category name for screen readers
    const activeCategoryName = useMemo(() => {
      const cat = categoriasConfig.find((c) => c.id === categoriaAtiva);
      return cat?.nome ?? "Todos";
    }, [categoriasConfig, categoriaAtiva]);

    return (
      <div className="relative" role="navigation" aria-label="Filtros de categoria">
        {/* Left Arrow */}
        <button
          onClick={() => scrollBy("left")}
          aria-label="Categorias anteriores"
          disabled={!showLeftFade}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-10",
            "hidden lg:flex",
            "w-9 h-9 items-center justify-center rounded-full",
            "bg-slate-800/90 border border-white/10 text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            "disabled:opacity-0 disabled:pointer-events-none",
            !reducedMotion && "transition-all duration-200 hover:bg-slate-700 hover:scale-105",
            !showLeftFade && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        {/* Left Fade */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-8 z-[5]",
            "bg-gradient-to-r from-background to-transparent",
            "pointer-events-none",
            !reducedMotion && "transition-opacity duration-300",
            showLeftFade ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          role="tablist"
          aria-label="Filtrar por categoria"
          onKeyDown={handleKeyDown}
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
          {categoriasConfig.map((cat, index) => {
            const isActive = categoriaAtiva === cat.id;
            const count = cat.id === null ? contagens.todos : contagens[cat.id] || 0;

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
                  "flex items-center gap-2 px-4 py-2.5 min-h-[44px]",
                  "rounded-full whitespace-nowrap flex-shrink-0 snap-start",
                  "border text-sm font-medium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "[-webkit-tap-highlight-color:transparent]",
                  !reducedMotion && "transition-all duration-200 active:scale-[0.97]",
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 border-violet-500/50 text-white shadow-lg shadow-violet-500/30 scale-[1.02]"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white",
                  isLoading && isActive && "animate-pulse",
                )}
              >
                <span className="text-base" aria-hidden="true">
                  {cat.icon}
                </span>
                <span>{cat.nome}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      "min-w-[24px] text-center tabular-nums",
                      isActive ? "bg-white/25" : "bg-white/10",
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
            "absolute right-0 top-0 bottom-0 w-8 z-[5]",
            "bg-gradient-to-l from-background to-transparent",
            "pointer-events-none",
            !reducedMotion && "transition-opacity duration-300",
            showRightFade ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />

        {/* Right Arrow */}
        <button
          onClick={() => scrollBy("right")}
          aria-label="Próximas categorias"
          disabled={!showRightFade}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-10",
            "hidden lg:flex",
            "w-9 h-9 items-center justify-center rounded-full",
            "bg-slate-800/90 border border-white/10 text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            "disabled:opacity-0 disabled:pointer-events-none",
            !reducedMotion && "transition-all duration-200 hover:bg-slate-700 hover:scale-105",
            !showRightFade && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>

        {/* Live region for screen readers */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading ? `Carregando ${activeCategoryName}...` : `Categoria selecionada: ${activeCategoryName}`}
        </div>
      </div>
    );
  },
);

CategoriasPills.displayName = "CategoriasPills";
