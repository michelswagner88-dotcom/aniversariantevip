import { useMemo, useRef, useState, useEffect } from "react";
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
  estabelecimentos: any[];
}

export const AirbnbCategoryPills = ({
  categoriaAtiva,
  onCategoriaChange,
  estabelecimentos,
}: AirbnbCategoryPillsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFadeLeft, setShowFadeLeft] = useState(false);
  const [showFadeRight, setShowFadeRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowFadeLeft(scrollLeft > 10);
    setShowFadeRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

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
  }, [estabelecimentos]);

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

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = 300;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const categoriasConfig = useMemo(() => {
    const categoriasOrdenadas = [...CATEGORIAS].sort((a, b) => a.plural.localeCompare(b.plural, "pt-BR"));

    const configs: Array<{
      id: string | null;
      categoryId: string;
      nome: string;
      icon: LucideIcon;
    }> = [
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

    return configs;
  }, []);

  return (
    <div className="bg-[#240046] py-4">
      <div className="relative flex items-center gap-2 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Seta Esquerda - Visível em todas as telas quando há scroll */}
        <button
          onClick={() => scrollBy("left")}
          aria-label="Categorias anteriores"
          className={cn(
            "flex flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full items-center justify-center transition-all",
            "bg-white/10 sm:bg-white hover:bg-white/20 sm:hover:bg-white/90",
            !showFadeLeft && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft className="w-5 h-5 text-white sm:text-[#240046]" />
        </button>

        {/* Container com gradientes de fade */}
        <div className="relative flex-1 overflow-hidden">
          {/* Fade esquerdo - indicador visual de scroll */}
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#240046] to-transparent z-10 pointer-events-none transition-opacity duration-300",
              showFadeLeft ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />

          {/* Fade direito - indicador visual de scroll */}
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
            className="flex gap-3 sm:gap-4 overflow-x-auto py-2 scrollbar-hide scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex gap-3 sm:gap-4 px-1 min-w-max">
              {categoriasConfig.map((cat) => {
                const isActive = categoriaAtiva === cat.id;
                const IconComponent = cat.icon;

                return (
                  <button
                    key={cat.id || "todos"}
                    data-categoria={cat.id ?? "todos"}
                    onClick={() => onCategoriaChange(cat.id)}
                    role="tab"
                    aria-label={`Filtrar por ${cat.nome}`}
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    className={cn(
                      "group flex flex-col items-center justify-center gap-1.5",
                      "min-w-[72px] sm:min-w-[80px] min-h-[68px]",
                      "px-3 py-2 rounded-xl transition-all duration-300",
                      "flex-shrink-0",
                      isActive ? "bg-white/15" : "bg-transparent hover:bg-white/10",
                    )}
                  >
                    <IconComponent
                      size={24}
                      strokeWidth={1.5}
                      className={cn(
                        "transition-all duration-300",
                        isActive
                          ? "text-white scale-110"
                          : "text-white/80 group-hover:text-white group-hover:scale-110",
                      )}
                    />

                    <span
                      className={cn(
                        "text-xs sm:text-sm whitespace-nowrap transition-all duration-300",
                        isActive ? "text-white font-semibold" : "text-white/80 group-hover:text-white",
                      )}
                    >
                      {cat.nome}
                    </span>

                    {/* Indicador de seleção */}
                    <div
                      className={cn(
                        "h-0.5 rounded-full transition-all duration-300",
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

        {/* Seta Direita - Visível em todas as telas quando há scroll */}
        <button
          onClick={() => scrollBy("right")}
          aria-label="Próximas categorias"
          className={cn(
            "flex flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full items-center justify-center transition-all",
            "bg-white/10 sm:bg-white hover:bg-white/20 sm:hover:bg-white/90",
            !showFadeRight && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronRight className="w-5 h-5 text-white sm:text-[#240046]" />
        </button>
      </div>
    </div>
  );
};
