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
const ANIMATION_DELAY_STEP = 30;
const HAPTIC_LIGHT = 5;
const HAPTIC_MEDIUM: number[] = [10, 30, 10];

// Cor do header para gradientes de fade (roxo escuro)
const HEADER_BG_COLOR = "#1a0a2e";

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

interface CategoriasPillsProps {
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

interface ScrollFadeState {
  showLeft: boolean;
  showRight: boolean;
}

const useScrollFade = (
  scrollRef: React.RefObject<HTMLDivElement>,
  triggerValue?: string | number | null,
): ScrollFadeState => {
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let rafId: number;
    const debouncedCheck = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkScroll);
    };

    checkScroll();
    el.addEventListener("scroll", debouncedCheck, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", debouncedCheck);
      window.removeEventListener("resize", checkScroll);
      cancelAnimationFrame(rafId);
    };
  }, [checkScroll, triggerValue]);

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
// FADE GRADIENT COMPONENT
// =============================================================================

interface FadeGradientProps {
  side: "left" | "right";
  visible: boolean;
  size?: "sm" | "md";
}

const FadeGradient = memo(({ side, visible, size = "md" }: FadeGradientProps) => (
  <div
    className={cn(
      "absolute top-0 bottom-0 z-[5] pointer-events-none",
      "transition-opacity duration-300",
      side === "left" ? "left-0" : "right-0",
      size === "sm" ? "w-6" : "w-8",
      visible ? "opacity-100" : "opacity-0",
    )}
    style={{
      background:
        side === "left"
          ? `linear-gradient(to right, ${HEADER_BG_COLOR}, transparent)`
          : `linear-gradient(to left, ${HEADER_BG_COLOR}, transparent)`,
    }}
    aria-hidden="true"
  />
));

FadeGradient.displayName = "FadeGradient";

// =============================================================================
// NAV BUTTON COMPONENT - FORA DO CONTAINER (flex-shrink-0)
// =============================================================================

interface NavButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
  reducedMotion: boolean;
  size?: "sm" | "md";
}

const NavButton = memo(({ direction, onClick, visible, reducedMotion, size = "md" }: NavButtonProps) => {
  const isLeft = direction === "left";
  const Icon = isLeft ? ChevronLeft : ChevronRight;

  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? "Anterior" : "Próximo"}
      disabled={!visible}
      className={cn(
        // REMOVIDO: absolute, top-1/2, -translate-y-1/2, left-0, right-0
        // ADICIONADO: flex-shrink-0 para não comprimir
        "flex-shrink-0 z-10",
        "hidden lg:flex items-center justify-center rounded-full",
        "bg-[#240046] border border-violet-500/30 text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        "disabled:opacity-0 disabled:pointer-events-none",
        !reducedMotion && "transition-all duration-200 hover:bg-[#3a0070] hover:scale-105",
        size === "sm" ? "w-7 h-7" : "w-9 h-9",
      )}
    >
      <Icon size={size === "sm" ? 14 : 18} aria-hidden="true" />
    </button>
  );
});

NavButton.displayName = "NavButton";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CategoriasPills = memo(
  ({
    categoriaAtiva,
    subcategoriaAtiva = null,
    onCategoriaChange,
    onSubcategoriaChange,
    estabelecimentos,
    isLoading = false,
  }: CategoriasPillsProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const subScrollRef = useRef<HTMLDivElement>(null);
    const reducedMotion = useReducedMotion();

    // Scroll fade states
    const mainScrollFade = useScrollFade(scrollRef, estabelecimentos.length);
    const subScrollFade = useScrollFade(subScrollRef, categoriaAtiva);

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
        {/* CATEGORIAS PRINCIPAIS - SETAS FORA DO CONTAINER */}
        <div className="flex items-center gap-2">
          {/* Seta Esquerda - FORA */}
          <NavButton
            direction="left"
            onClick={() => scrollBy("left")}
            visible={mainScrollFade.showLeft}
            reducedMotion={reducedMotion}
          />

          {/* Container de Scroll com Fades */}
          <div className="relative flex-1 min-w-0">
            <FadeGradient side="left" visible={mainScrollFade.showLeft} />

            {/* Scroll Container */}
            <div
              ref={scrollRef}
              role="tablist"
              aria-label="Filtrar por categoria"
              onKeyDown={(e) => handleKeyDown(e, categoriasConfig, categoriaAtiva)}
              className={cn(
                "flex gap-1 overflow-x-auto py-3",
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
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0a2e]",
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

            <FadeGradient side="right" visible={mainScrollFade.showRight} />
          </div>

          {/* Seta Direita - FORA */}
          <NavButton
            direction="right"
            onClick={() => scrollBy("right")}
            visible={mainScrollFade.showRight}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* SUBCATEGORIAS - SETAS FORA DO CONTAINER */}
        {categoriaAtiva && subcategoriasConfig.length > 0 && (
          <div className={cn("flex items-center gap-2", !reducedMotion && "animate-in fade-in slide-in-from-top-2 duration-300")}>
            {/* Seta Esquerda - FORA */}
            <NavButton
              direction="left"
              onClick={() => scrollBy("left", true)}
              visible={subScrollFade.showLeft}
              reducedMotion={reducedMotion}
              size="sm"
            />

            {/* Container de Scroll com Fades */}
            <div className="relative flex-1 min-w-0">
              <FadeGradient side="left" visible={subScrollFade.showLeft} size="sm" />

              {/* Scroll Container */}
              <div
                ref={subScrollRef}
                role="tablist"
                aria-label="Filtrar por subcategoria"
                className={cn(
                  "flex gap-2 overflow-x-auto py-2",
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
                      ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-lg shadow-violet-500/30"
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
                        animationDelay: reducedMotion ? "0ms" : `${index * ANIMATION_DELAY_STEP}ms`,
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
                          ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-lg shadow-violet-500/30"
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

              <FadeGradient side="right" visible={subScrollFade.showRight} size="sm" />
            </div>

            {/* Seta Direita - FORA */}
            <NavButton
              direction="right"
              onClick={() => scrollBy("right", true)}
              visible={subScrollFade.showRight}
              reducedMotion={reducedMotion}
              size="sm"
            />
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

CategoriasPills.displayName = "CategoriasPills";
