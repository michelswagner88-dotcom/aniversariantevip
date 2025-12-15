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

interface Estabelecimento {
  id: string;
  categoria?: string | string[];
  especialidades?: string[];
  [key: string]: any;
}

interface AirbnbCategoryPillsProps {
  categoriaAtiva: string | null;
  subcategoriaAtiva?: string | null;
  onCategoriaChange: (categoria: string | null) => void;
  onSubcategoriaChange?: (subcategoria: string | null) => void;
  estabelecimentos: Estabelecimento[];
  isLoading?: boolean;
}

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

const normalizeCategoriaToId = (cat: string): string => {
  if (!cat) return "";
  const lower = cat.toLowerCase().trim();

  const found = CATEGORIAS.find(
    (c) => c.id === lower || c.label.toLowerCase() === lower || c.plural.toLowerCase() === lower,
  );

  return found?.id || lower;
};

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
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(true);
    const [showSubLeftFade, setShowSubLeftFade] = useState(false);
    const [showSubRightFade, setShowSubRightFade] = useState(true);
    const reducedMotion = useReducedMotion();

    // Contagem por categoria (normalizado para ID)
    const contagens = useMemo(() => {
      const counts: Record<string, number> = { todos: estabelecimentos.length };

      estabelecimentos.forEach((est) => {
        const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
        cats.forEach((cat: string) => {
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
        especialidades.forEach((esp: string) => {
          if (esp) {
            const lower = esp.toLowerCase().trim();
            counts[lower] = (counts[lower] || 0) + 1;
          }
        });
      });

      return counts;
    }, [estabelecimentos]);

    // Configurar categorias
    const categoriasConfig = useMemo(() => {
      const configs = [
        { id: null, nome: "Todos", icon: CATEGORIA_ICONS.todos },
        ...CATEGORIAS.map((cat) => ({
          id: cat.id,
          nome: cat.plural,
          icon: CATEGORIA_ICONS[cat.id] || Star,
        })),
      ];

      return configs.filter((cat) => {
        if (cat.id === null) return true;
        return (contagens[cat.id] || 0) > 0;
      });
    }, [contagens]);

    // Subcategorias da categoria ativa
    const subcategoriasConfig = useMemo(() => {
      if (!categoriaAtiva) return [];

      const categoria = CATEGORIAS.find((c) => c.id === categoriaAtiva);
      if (!categoria) return [];

      // Filtrar apenas subcategorias que têm estabelecimentos
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

    const checkScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftFade(scrollLeft > 10);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    const checkSubScroll = useCallback(() => {
      const el = subScrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowSubLeftFade(scrollLeft > 10);
      setShowSubRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    const debouncedCheckScroll = useDebounce(checkScroll, 16);
    const debouncedCheckSubScroll = useDebounce(checkSubScroll, 16);

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
      const el = subScrollRef.current;
      if (!el) return;

      checkSubScroll();
      el.addEventListener("scroll", debouncedCheckSubScroll, { passive: true });

      return () => {
        el.removeEventListener("scroll", debouncedCheckSubScroll);
      };
    }, [checkSubScroll, debouncedCheckSubScroll, subcategoriasConfig]);

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

    const scrollBy = useCallback(
      (direction: "left" | "right", isSubcategoria = false) => {
        const el = isSubcategoria ? subScrollRef.current : scrollRef.current;
        if (!el) return;

        if (navigator.vibrate) navigator.vibrate(5);

        el.scrollBy({
          left: direction === "left" ? -200 : 200,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      [reducedMotion],
    );

    const handleCategoriaChange = useCallback(
      (id: string | null) => {
        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
        onCategoriaChange(id);
        // Limpar subcategoria quando muda categoria
        if (onSubcategoriaChange) {
          onSubcategoriaChange(null);
        }
      },
      [onCategoriaChange, onSubcategoriaChange],
    );

    const handleSubcategoriaChange = useCallback(
      (id: string | null) => {
        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
        if (onSubcategoriaChange) {
          onSubcategoriaChange(id);
        }
      },
      [onSubcategoriaChange],
    );

    const activeCategoryName = useMemo(() => {
      const cat = categoriasConfig.find((c) => c.id === categoriaAtiva);
      return cat?.nome ?? "Todos";
    }, [categoriasConfig, categoriaAtiva]);

    return (
      <div className="space-y-2" role="navigation" aria-label="Filtros de categoria">
        {/* CATEGORIAS PRINCIPAIS */}
        <div className="relative">
          <button
            onClick={() => scrollBy("left")}
            aria-label="Categorias anteriores"
            disabled={!showLeftFade}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex",
              "w-9 h-9 items-center justify-center rounded-full",
              "bg-slate-800/90 border border-white/10 text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              "disabled:opacity-0 disabled:pointer-events-none",
              !reducedMotion && "transition-all duration-200 hover:bg-slate-700 hover:scale-105",
              showLeftFade ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-12 z-[5]",
              "bg-gradient-to-r from-background to-transparent",
              "pointer-events-none",
              !reducedMotion && "transition-opacity duration-300",
              showLeftFade ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />

          <div
            ref={scrollRef}
            role="tablist"
            aria-label="Filtrar por categoria"
            tabIndex={0}
            className={cn(
              "flex gap-1 overflow-x-auto py-3 px-4 scrollbar-hide snap-x snap-mandatory touch-pan-x",
              reducedMotion ? "scroll-auto" : "scroll-smooth",
            )}
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categoriasConfig.map((cat, index) => {
              const isActive = categoriaAtiva === cat.id;
              const count = cat.id === null ? contagens.todos : contagens[cat.id] || 0;
              const IconComponent = cat.icon;

              return (
                <button
                  key={cat.id || "todos"}
                  data-category={cat.id ?? "todos"}
                  onClick={() => handleCategoriaChange(cat.id)}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  style={{
                    animationDelay: reducedMotion ? "0ms" : `${index * 30}ms`,
                    scrollSnapAlign: "start",
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 px-4 py-3 min-w-[80px] min-h-[72px]",
                    "rounded-xl whitespace-nowrap flex-shrink-0 snap-start",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "[-webkit-tap-highlight-color:transparent]",
                    !reducedMotion &&
                      "transition-all duration-200 active:scale-[0.97] animate-fade-in opacity-0 [animation-fill-mode:forwards]",
                    reducedMotion && "opacity-100",
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
                      aria-label={`${count} estabelecimentos`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="w-4 flex-shrink-0" aria-hidden="true" />
          </div>

          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-12 z-[5]",
              "bg-gradient-to-l from-background to-transparent",
              "pointer-events-none",
              !reducedMotion && "transition-opacity duration-300",
              showRightFade ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />

          <button
            onClick={() => scrollBy("right")}
            aria-label="Próximas categorias"
            disabled={!showRightFade}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex",
              "w-9 h-9 items-center justify-center rounded-full",
              "bg-slate-800/90 border border-white/10 text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              "disabled:opacity-0 disabled:pointer-events-none",
              !reducedMotion && "transition-all duration-200 hover:bg-slate-700 hover:scale-105",
              showRightFade ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        {/* SUBCATEGORIAS - Aparece quando tem categoria selecionada */}
        {categoriaAtiva && subcategoriasConfig.length > 0 && (
          <div className={cn("relative", !reducedMotion && "animate-in fade-in slide-in-from-top-2 duration-300")}>
            <button
              onClick={() => scrollBy("left", true)}
              aria-label="Subcategorias anteriores"
              disabled={!showSubLeftFade}
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex",
                "w-7 h-7 items-center justify-center rounded-full",
                "bg-slate-800/90 border border-white/10 text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                "disabled:opacity-0 disabled:pointer-events-none",
                !reducedMotion && "transition-all duration-200 hover:bg-slate-700 hover:scale-105",
                showSubLeftFade ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>

            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-8 z-[5]",
                "bg-gradient-to-r from-background to-transparent",
                "pointer-events-none",
                showSubLeftFade ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />

            <div
              ref={subScrollRef}
              role="tablist"
              aria-label="Filtrar por subcategoria"
              className={cn(
                "flex gap-2 overflow-x-auto py-2 px-4 scrollbar-hide snap-x snap-mandatory touch-pan-x",
                reducedMotion ? "scroll-auto" : "scroll-smooth",
              )}
              style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* Botão "Todos" da subcategoria */}
              <button
                onClick={() => handleSubcategoriaChange(null)}
                role="tab"
                aria-selected={subcategoriaAtiva === null}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-full whitespace-nowrap flex-shrink-0 snap-start",
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
                    style={{
                      animationDelay: reducedMotion ? "0ms" : `${index * 40}ms`,
                      scrollSnapAlign: "start",
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-full whitespace-nowrap flex-shrink-0 snap-start",
                      "border text-sm font-medium",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
                      "[-webkit-tap-highlight-color:transparent]",
                      !reducedMotion &&
                        "transition-all duration-200 active:scale-[0.97] animate-fade-in opacity-0 [animation-fill-mode:forwards]",
                      reducedMotion && "opacity-100",
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
                          "text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center tabular-nums",
                          isActive ? "bg-white/25" : "bg-white/10",
                        )}
                      >
                        {sub.count}
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="w-4 flex-shrink-0" aria-hidden="true" />
            </div>

            <div
              className={cn(
                "absolute right-0 top-0 bottom-0 w-8 z-[5]",
                "bg-gradient-to-l from-background to-transparent",
                "pointer-events-none",
                showSubRightFade ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />

            <button
              onClick={() => scrollBy("right", true)}
              aria-label="Próximas subcategorias"
              disabled={!showSubRightFade}
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex",
                "w-7 h-7 items-center justify-center rounded-full",
                "bg-slate-800/90 border border-white/10 text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                "disabled:opacity-0 disabled:pointer-events-none",
                !reducedMotion && "transition-all duration-200 hover:bg-slate-700 hover:scale-105",
                showSubRightFade ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading ? `Carregando ${activeCategoryName}...` : `Categoria: ${activeCategoryName}`}
        </div>
      </div>
    );
  },
);

AirbnbCategoryPills.displayName = "AirbnbCategoryPills";
