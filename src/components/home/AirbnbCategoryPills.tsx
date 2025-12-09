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
        <button
          onClick={() => scrollBy("left")}
          aria-label="Categorias anteriores"
         className={cn(
  "hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full bg-white hover:bg-white/90 items-center justify-center transition-all",
  !showFadeLeft && "opacity-30 pointer-events-none",
)}
>
  <ChevronLeft className="w-4 h-4 text-[#240046]" />
          )}
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex-1 flex gap-2 sm:gap-3 overflow-x-auto py-2 scrollbar-hide scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex gap-2 sm:gap-3 px-1 min-w-max">
            {categoriasConfig.map((cat) => {
              const isActive = categoriaAtiva === cat.id;
              const IconComponent = cat.icon;

              return (
                <button
                  key={cat.id || "todos"}
                  data-categoria={cat.id ?? "todos"}
                  onClick={() => onCategoriaChange(cat.id)}
                  aria-label={`Filtrar por ${cat.nome}`}
                  aria-pressed={isActive}
                  className={cn(
                    "group flex flex-col items-center gap-1.5 min-w-[64px] sm:min-w-[72px] px-3 py-2 rounded-xl transition-all duration-300",
                    "flex-shrink-0",
                    isActive ? "bg-white/15" : "bg-transparent hover:bg-white/10",
                  )}
                >
                  <IconComponent
                    size={24}
                    strokeWidth={1.5}
                    className={cn(
                      "transition-all duration-300",
                      isActive ? "text-white scale-110" : "text-white group-hover:scale-110",
                    )}
                  />

                  <span
                    className={cn(
                      "text-xs whitespace-nowrap transition-all duration-300",
                      isActive ? "text-white font-semibold" : "text-white",
                    )}
                  >
                    {cat.nome}
                  </span>

                  <div
                    className={cn(
                      "h-0.5 rounded-full transition-all duration-300",
                      isActive ? "w-6 bg-white" : "w-0 bg-transparent",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => scrollBy("right")}
          aria-label="Próximas categorias"
          className={cn(
            "hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full bg-white hover:bg-white/90 items-center justify-center transition-all",
  !showFadeRight && "opacity-30 pointer-events-none",
          )}
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
