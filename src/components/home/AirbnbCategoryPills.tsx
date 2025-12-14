import { useMemo, useRef, useState, useEffect, useCallback, memo } from "react";
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
  estabelecimentos?: any[];
}

export const AirbnbCategoryPills = memo(({ categoriaAtiva, onCategoriaChange }: AirbnbCategoryPillsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFadeLeft, setShowFadeLeft] = useState(false);
  const [showFadeRight, setShowFadeRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowFadeLeft(scrollLeft > 10);
    setShowFadeRight(scrollLeft < scrollWidth - clientWidth - 10);
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

  useEffect(() => {
    if (!scrollRef.current) return;

    const selectedEl = scrollRef.current.querySelector(`[data-categoria="${categoriaAtiva ?? "todos"}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [categoriaAtiva]);

  const scrollBy = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = 300;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const tabs = scrollRef.current?.querySelectorAll('[role="tab"]');
      if (!tabs?.length) return;

      const currentIndex = Array.from(tabs).findIndex(
        (tab) => tab.getAttribute("data-categoria") === (categoriaAtiva ?? "todos"),
      );

      let newIndex = currentIndex;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === "Home") {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        newIndex = tabs.length - 1;
      }

      if (newIndex !== currentIndex) {
        const newTab = tabs[newIndex] as HTMLButtonElement;
        const newCategoria = newTab.getAttribute("data-categoria");
        onCategoriaChange(newCategoria === "todos" ? null : newCategoria);
        newTab.focus();
      }
    },
    [categoriaAtiva, onCategoriaChange],
  );

  const categoriasConfig = useMemo(() => {
    const categoriasOrdenadas = [...CATEGORIAS].sort((a, b) => a.plural.localeCompare(b.plural, "pt-BR"));

    return [
      {
        id: null,
        categoryId: "todos",
        nome: "Todos",
        icon: CATEGORIA_ICONS["todos"],
      },
      ...categoriasOrdenadas.map((cat) => ({
        id: cat.label,
        categoryId: cat.id,
        nome: cat.label,
        icon: CATEGORIA_ICONS[cat.id] || CATEGORIA_ICONS["outros"],
      })),
    ];
  }, []);

  const handleScrollLeft = useCallback(() => scrollBy("left"), [scrollBy]);
  const handleScrollRight = useCallback(() => scrollBy("right"), [scrollBy]);

  return (
    <div className="bg-[#240046] py-4">
      <div className="relative flex items-center gap-2 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
        <button
          onClick={handleScrollLeft}
          aria-label="Categorias anteriores"
          className={cn(
            "flex flex-shrink-0 w-11 h-11 rounded-full items-center justify-center transition-all",
            "bg-white/10 sm:bg-white hover:bg-white/20 sm:hover:bg-white/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            !showFadeLeft && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft className="w-5 h-5 text-white sm:text-[#240046]" aria-hidden="true" />
        </button>

        <div className="relative flex-1 overflow-hidden">
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#240046] to-transparent z-10 pointer-events-none transition-opacity duration-300",
              showFadeLeft ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />

          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#240046] to-transparent z-10 pointer-events-none transition-opacity duration-300",
              showFadeRight ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />

          <div
            ref={scrollRef}
            role="tablist"
            aria-label="Filtrar por categoria"
            onKeyDown={handleKeyDown}
            className="flex gap-3 sm:gap-4 overflow-x-auto py-2 scrollbar-hide scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex gap-3 sm:gap-4 px-1 min-w-max">
              {categoriasConfig.map((cat) => {
                const isActive = categoriaAtiva === cat.id;
                const IconComponent = cat.icon;

                return (
                  <button
                    key={cat.categoryId}
                    data-categoria={cat.id ?? "todos"}
                    onClick={() => onCategoriaChange(cat.id)}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    className={cn(
                      "group flex flex-col items-center justify-center gap-1.5",
                      "min-w-[72px] sm:min-w-[80px] min-h-[68px]",
                      "px-3 py-2 rounded-xl transition-all duration-200",
                      "flex-shrink-0",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#240046]",
                      isActive ? "bg-white/15" : "bg-transparent hover:bg-white/10",
                    )}
                  >
                    <IconComponent
                      size={24}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className={cn(
                        "transition-all duration-200",
                        isActive
                          ? "text-white scale-110"
                          : "text-white/80 group-hover:text-white group-hover:scale-110",
                      )}
                    />

                    <span
                      className={cn(
                        "text-xs sm:text-sm whitespace-nowrap transition-all duration-200",
                        isActive ? "text-white font-semibold" : "text-white/80 group-hover:text-white",
                      )}
                    >
                      {cat.nome}
                    </span>

                    <div
                      className={cn(
                        "h-0.5 rounded-full transition-all duration-200",
                        isActive ? "w-6 bg-white" : "w-0 bg-transparent",
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
          className={cn(
            "flex flex-shrink-0 w-11 h-11 rounded-full items-center justify-center transition-all",
            "bg-white/10 sm:bg-white hover:bg-white/20 sm:hover:bg-white/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            !showFadeRight && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronRight className="w-5 h-5 text-white sm:text-[#240046]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

AirbnbCategoryPills.displayName = "AirbnbCategoryPills";
